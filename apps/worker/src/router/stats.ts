import { t, protectedProcedure } from "./trpc";
import { listItems } from "../db/schema";
import { eq } from "drizzle-orm";

export const statsRouter = t.router({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.listItems.findMany({
      where: eq(listItems.userId, ctx.userId),
      columns: { type: true, status: true, rating: true, completedAt: true },
    });

    const types = ["movie","series","book","food_restaurant","food_recipe","shopping"] as const;
    const byType: Record<string, Record<string, number>> = {};
    for (const type of types) {
      byType[type] = { pending: 0, in_progress: 0, completed: 0, skipped: 0 };
    }

    let totalRating = 0, ratingCount = 0;
    const byMonth: Record<string, number> = {};

    for (const item of items) {
      byType[item.type][item.status]++;
      if (item.rating) { totalRating += item.rating; ratingCount++; }
      if (item.completedAt) {
        const k = new Date(item.completedAt).toISOString().slice(0, 7);
        byMonth[k] = (byMonth[k] ?? 0) + 1;
      }
    }

    return {
      byType,
      averageRating: ratingCount > 0 ? +(totalRating / ratingCount).toFixed(1) : null,
      byMonth,
      total: items.length,
    };
  }),
});
