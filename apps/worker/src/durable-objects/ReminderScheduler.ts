import { DurableObject } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
import { reminders, listItems, users } from "../db/schema";
import { getWittyMessage } from "../services/wittyMessages";
import { sendReminderEmail } from "../services/resend";
import { createInAppNotification } from "../router/notifications";

type Env = {
  DATABASE_URL: string;
  RESEND_API_KEY: string;
  APP_URL: string;
};

export class ReminderScheduler extends DurableObject {
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/schedule" && request.method === "POST") {
      const { reminderId, scheduledAt } = await request.json() as {
        reminderId: string; scheduledAt: string;
      };
      const ts = new Date(scheduledAt).getTime();
      if (ts > Date.now()) {
        // Mevcut alarmı iptal edip yenisini kur
        await this.ctx.storage.put(`reminder:${reminderId}`, scheduledAt);
        const earliest = await this.getEarliestAlarm();
        if (!this.ctx.storage.getAlarm || earliest === null || ts < earliest) {
          await this.ctx.storage.setAlarm(ts);
        }
      }
      return new Response("ok");
    }

    if (url.pathname === "/cancel" && request.method === "POST") {
      const { reminderId } = await request.json() as { reminderId: string };
      await this.ctx.storage.delete(`reminder:${reminderId}`);
      return new Response("ok");
    }

    return new Response("Not found", { status: 404 });
  }

  async alarm() {
    const now = Date.now();
    const db = drizzle(neon(this.env.DATABASE_URL), { schema });

    // Süresi gelmiş tüm hatırlatmaları bul
    const dueReminders = await db.query.reminders.findMany({
      where: and(
        eq(reminders.isActive, true),
        lte(reminders.scheduledAt, new Date(now)),
        isNull(reminders.firedAt),
      ),
    });

    for (const reminder of dueReminders) {
      try {
        await this.fireReminder(db, reminder);
      } catch (err) {
        console.error("Reminder fire error:", err);
      }
    }

    // Bir sonraki alarmı ayarla
    const nextAlarm = await this.getEarliestScheduled(db);
    if (nextAlarm) {
      await this.ctx.storage.setAlarm(nextAlarm.getTime());
    }
  }

  private async fireReminder(db: any, reminder: typeof reminders.$inferSelect) {
    const user = await db.query.users.findFirst({ where: eq(users.id, reminder.userId) });
    if (!user) return;

    let item: typeof listItems.$inferSelect | undefined;
    if (reminder.itemId) {
      item = await db.query.listItems.findFirst({ where: eq(listItems.id, reminder.itemId) });
    }

    const wittyKey = reminder.wittyKey ?? (item ? item.type : "general");
    const message = getWittyMessage(reminder.type, wittyKey as any, user.locale as "tr" | "en");
    const title = reminder.title ?? message.title;
    const body  = message.body;

    if (user.notifChannel !== "email") {
      await createInAppNotification(db, {
        userId: reminder.userId,
        reminderId: reminder.id,
        itemId: reminder.itemId ?? undefined,
        title,
        body,
      });
    }

    if (user.notifChannel !== "in_app") {
      await sendReminderEmail(this.env.RESEND_API_KEY, {
        to: user.email,
        name: user.name,
        subject: title,
        body,
        itemTitle: item?.title,
        itemType: item?.type,
        appUrl: this.env.APP_URL,
        locale: user.locale as "tr" | "en",
      });
    }

    // firedAt güncelle
    await db.update(reminders)
      .set({ firedAt: new Date(), isActive: reminder.isRecurring })
      .where(eq(reminders.id, reminder.id));

    // Recurring ise bir sonraki zamanı hesapla
    if (reminder.isRecurring && reminder.intervalDays && reminder.scheduledAt) {
      const next = new Date(reminder.scheduledAt);
      next.setDate(next.getDate() + reminder.intervalDays);
      await db.update(reminders)
        .set({ scheduledAt: next, firedAt: null, isActive: true })
        .where(eq(reminders.id, reminder.id));
    }
  }

  private async getEarliestAlarm(): Promise<number | null> {
    const alarm = await this.ctx.storage.getAlarm();
    return alarm ?? null;
  }

  private async getEarliestScheduled(db: any): Promise<Date | null> {
    const next = await db.query.reminders.findFirst({
      where: and(eq(reminders.isActive, true), isNull(reminders.firedAt)),
      orderBy: [reminders.scheduledAt],
    });
    return next?.scheduledAt ?? null;
  }
}
