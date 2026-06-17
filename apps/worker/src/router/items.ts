import { z } from "zod";
import { t, protectedProcedure } from "./trpc";
import { listItems } from "../db/schema";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { searchTMDB } from "../services/tmdb";
import { searchOpenLibrary } from "../services/openLibrary";

const LIST_TYPES = ["movie","series","book","food_restaurant","food_recipe","shopping"] as const;
const STATUSES   = ["pending","in_progress","completed","skipped"] as const;

export const itemsRouter = t.router({
  list: protectedProcedure
    .input(z.object({
      type:   z.enum(LIST_TYPES).optional(),
      status: z.enum(STATUSES).optional(),
      search: z.string().max(200).optional(),
      page:   z.number().int().min(1).default(1),
      limit:  z.number().int().min(1).max(100).default(24),
    }))
    .query(async ({ input, ctx }) => {
      const { type, status, search, page, limit } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(listItems.userId, ctx.userId)];
      if (type)   conditions.push(eq(listItems.type, type));
      if (status) conditions.push(eq(listItems.status, status));
      if (search) conditions.push(ilike(listItems.title, `%${search}%`));

      const [items, countResult] = await Promise.all([
        ctx.db.query.listItems.findMany({
          where: and(...conditions),
          orderBy: [desc(listItems.addedAt)],
          limit, offset,
        }),
        ctx.db.select({ count: sql<number>`count(*)::int` })
          .from(listItems).where(and(...conditions)),
      ]);

      return { items, total: countResult[0].count, page, limit };
    }),

  add: protectedProcedure
    .input(z.object({
      type:           z.enum(LIST_TYPES),
      title:          z.string().min(1).max(255),
      status:         z.enum(STATUSES).default("pending"),
      notes:          z.string().max(2000).optional(),
      coverUrl:       z.string().url().optional(),
      externalId:     z.string().optional(),
      externalSource: z.string().optional(),
      // film/dizi
      year:           z.number().int().min(1900).max(2100).optional(),
      genre:          z.array(z.string()).optional(),
      posterUrl:      z.string().url().optional(),
      seasonCount:    z.number().int().min(1).optional(),
      // kitap
      author:         z.string().max(255).optional(),
      isbn:           z.string().optional(),
      pageCount:      z.number().int().min(1).optional(),
      // yemek-restoran
      restaurantName: z.string().optional(),
      cuisine:        z.string().optional(),
      location:       z.string().optional(),
      priceRange:     z.number().int().min(1).max(4).optional(),
      mapsUrl:        z.string().url().optional(),
      // yemek-tarif
      recipeUrl:      z.string().url().optional(),
      cookTimeMin:    z.number().int().min(1).optional(),
      difficulty:     z.number().int().min(1).max(3).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [item] = await ctx.db.insert(listItems)
        .values({ ...input, userId: ctx.userId })
        .returning();
      return item;
    }),

  update: protectedProcedure
    .input(z.object({
      id:          z.string().uuid(),
      status:      z.enum(STATUSES).optional(),
      rating:      z.number().int().min(1).max(5).nullable().optional(),
      notes:       z.string().max(2000).optional(),
      title:       z.string().min(1).max(255).optional(),
      startedAt:   z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      // yemek/alışveriş güncelleme alanları
      priceRange:  z.number().int().min(1).max(4).optional(),
      mapsUrl:     z.string().url().optional(),
      recipeUrl:   z.string().url().optional(),
      difficulty:  z.number().int().min(1).max(3).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const existing = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, id), eq(listItems.userId, ctx.userId)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date() };
      if (updates.status === "completed" && !existing.completedAt) {
        updateData.completedAt = new Date();
      }

      const [updated] = await ctx.db.update(listItems)
        .set(updateData)
        .where(and(eq(listItems.id, id), eq(listItems.userId, ctx.userId)))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(listItems)
        .where(and(eq(listItems.id, input.id), eq(listItems.userId, ctx.userId)));
      return { success: true };
    }),

  markComplete: protectedProcedure
    .input(z.object({
      id:     z.string().uuid(),
      rating: z.number().int().min(1).max(5).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db.update(listItems)
        .set({ status: "completed", completedAt: new Date(), rating: input.rating ?? null, updatedAt: new Date() })
        .where(and(eq(listItems.id, input.id), eq(listItems.userId, ctx.userId)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  tmdbSearch: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => searchTMDB(input.query, ctx.env.TMDB_API_KEY)),

  tmdbDetails: protectedProcedure
    .input(z.object({ id: z.number(), type: z.enum(["movie","series"]) }))
    .query(async ({ input, ctx }) => {
      const { getTMDBDetails } = await import("../services/tmdb");
      return getTMDBDetails(input.id, input.type, ctx.env.TMDB_API_KEY);
    }),

  openLibrarySearch: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => searchOpenLibrary(input.query)),
});
