import { z } from "zod";
import { t, protectedProcedure } from "./trpc";
import { reminders, listItems, users } from "../db/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getWittyMessage } from "../services/wittyMessages";
import { sendReminderEmail } from "../services/resend";
import { createInAppNotification } from "./notifications";

const REMINDER_TYPES = ["manual","weekly_digest","smart_idle"] as const;
const CHANNELS       = ["in_app","email","both"] as const;

export const remindersRouter = t.router({
  list: protectedProcedure
    .input(z.object({ active: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      const conditions = [eq(reminders.userId, ctx.userId)];
      if (input.active !== undefined) conditions.push(eq(reminders.isActive, input.active));
      return ctx.db.query.reminders.findMany({
        where: and(...conditions),
        orderBy: [desc(reminders.createdAt)],
      });
    }),

  create: protectedProcedure
    .input(z.object({
      itemId:       z.string().uuid().optional(),
      type:         z.enum(REMINDER_TYPES),
      channel:      z.enum(CHANNELS).default("both"),
      scheduledAt:  z.string().datetime().optional(),
      isRecurring:  z.boolean().default(false),
      intervalDays: z.number().int().min(1).max(365).optional(),
      title:        z.string().max(200).optional(),
      wittyKey:     z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.type === "manual" && !input.scheduledAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Manuel hatırlatma için tarih/saat zorunludur" });
      }

      const [reminder] = await ctx.db.insert(reminders)
        .values({
          ...input,
          userId: ctx.userId,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        })
        .returning();

      // Durable Object Alarm kur (manual için)
      if (input.type === "manual" && input.scheduledAt) {
        const doId = ctx.env.REMINDER_SCHEDULER.idFromName(ctx.userId);
        const stub = ctx.env.REMINDER_SCHEDULER.get(doId);
        await stub.fetch("https://do/schedule", {
          method: "POST",
          body: JSON.stringify({ reminderId: reminder.id, scheduledAt: input.scheduledAt }),
          headers: { "Content-Type": "application/json" },
        });
      }

      return reminder;
    }),

  update: protectedProcedure
    .input(z.object({
      id:           z.string().uuid(),
      isActive:     z.boolean().optional(),
      scheduledAt:  z.string().datetime().optional(),
      channel:      z.enum(CHANNELS).optional(),
      title:        z.string().max(200).optional(),
      intervalDays: z.number().int().min(1).max(365).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const existing = await ctx.db.query.reminders.findFirst({
        where: and(eq(reminders.id, id), eq(reminders.userId, ctx.userId)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: Record<string, any> = { ...updates };
      if (updates.scheduledAt) {
        updateData.scheduledAt = new Date(updates.scheduledAt);
      }

      const [updated] = await ctx.db.update(reminders)
        .set(updateData)
        .where(eq(reminders.id, id))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(reminders)
        .where(and(eq(reminders.id, input.id), eq(reminders.userId, ctx.userId)));
      return { success: true };
    }),

  /* Smart idle — Worker cron bu endpoint'i tetikler (iç kullanım) */
  fireSmartIdle: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({ where: eq(users.id, ctx.userId) });
      if (!user || user.smartIdleDays === 0) return { fired: 0 };

      const cutoff = new Date(Date.now() - user.smartIdleDays * 24 * 60 * 60 * 1000);
      const pendingItems = await ctx.db.query.listItems.findMany({
        where: and(
          eq(listItems.userId, ctx.userId),
          eq(listItems.status, "pending"),
          lte(listItems.addedAt, cutoff)
        ),
      });

      let fired = 0;
      for (const item of pendingItems.slice(0, 3)) { // Max 3 aynı anda
        const message = getWittyMessage("smart_idle", item.type, user.locale as "tr" | "en");
        if (user.notifChannel !== "email") {
          await createInAppNotification(ctx.db, {
            userId: ctx.userId,
            itemId: item.id,
            title: message.title,
            body: message.body,
          });
        }
        if (user.notifChannel !== "in_app") {
          await sendReminderEmail(ctx.env.RESEND_API_KEY, {
            to: user.email,
            name: user.name,
            subject: message.title,
            body: message.body,
            itemTitle: item.title,
            itemType: item.type,
            appUrl: ctx.env.APP_URL,
            locale: user.locale as "tr" | "en",
          });
        }
        fired++;
      }
      return { fired };
    }),
});
