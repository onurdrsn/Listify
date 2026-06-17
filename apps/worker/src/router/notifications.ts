import { z } from "zod";
import { t, protectedProcedure } from "./trpc";
import { notifications } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function createInAppNotification(
  db: any,
  data: { userId: string; itemId?: string; reminderId?: string; title: string; body: string }
) {
  const [notif] = await db.insert(notifications).values(data).returning();
  return notif;
}

export const notificationsRouter = t.router({
  list: protectedProcedure
    .input(z.object({
      unreadOnly: z.boolean().default(false),
      limit:      z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const conditions = [eq(notifications.userId, ctx.userId)];
      if (input.unreadOnly) conditions.push(eq(notifications.isRead, false));

      const [items, unreadCount] = await Promise.all([
        ctx.db.query.notifications.findMany({
          where: and(...conditions),
          orderBy: [desc(notifications.createdAt)],
          limit: input.limit,
        }),
        ctx.db.select({ count: sql<number>`count(*)::int` })
          .from(notifications)
          .where(and(eq(notifications.userId, ctx.userId), eq(notifications.isRead, false))),
      ]);

      return { items, unreadCount: unreadCount[0].count };
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.userId)));
      return { success: true };
    }),

  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await ctx.db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.userId, ctx.userId), eq(notifications.isRead, false)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(notifications)
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.userId)));
      return { success: true };
    }),
});
