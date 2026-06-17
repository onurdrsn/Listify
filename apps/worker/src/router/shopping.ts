import { z } from "zod";
import { t, protectedProcedure } from "./trpc";
import { listItems, shoppingItems } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const CATEGORIES = [
  "produce","meat_fish","dairy","bakery","frozen",
  "beverages","cleaning","personal_care","electronics","clothing","other"
] as const;

export const shoppingRouter = t.router({
  /* Alışveriş listesi oluştur (list_items'a "shopping" kaydı) */
  createList: protectedProcedure
    .input(z.object({ title: z.string().min(1).max(100).default("Alışveriş Listesi") }))
    .mutation(async ({ input, ctx }) => {
      const [list] = await ctx.db.insert(listItems)
        .values({ userId: ctx.userId, type: "shopping", title: input.title, status: "pending" })
        .returning();
      return list;
    }),

  /* Listedeki ürünler */
  getItems: protectedProcedure
    .input(z.object({ listId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // Önce liste sahibi mi doğrula
      const list = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, input.listId), eq(listItems.userId, ctx.userId)),
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.query.shoppingItems.findMany({
        where: eq(shoppingItems.listId, input.listId),
        orderBy: [asc(shoppingItems.category), asc(shoppingItems.addedAt)],
      });
    }),

  addItem: protectedProcedure
    .input(z.object({
      listId:   z.string().uuid(),
      name:     z.string().min(1).max(200),
      quantity: z.string().default("1"),
      unit:     z.string().max(20).optional(),
      category: z.enum(CATEGORIES).default("other"),
      price:    z.number().int().min(0).optional(),
      barcode:  z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Sahiplik doğrula
      const list = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, input.listId), eq(listItems.userId, ctx.userId)),
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });

      const [item] = await ctx.db.insert(shoppingItems)
        .values({ ...input, userId: ctx.userId })
        .returning();
      return item;
    }),

  toggleItem: protectedProcedure
    .input(z.object({ id: z.string().uuid(), checked: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db.update(shoppingItems)
        .set({
          checked: input.checked,
          checkedAt: input.checked ? new Date() : null,
        })
        .where(and(eq(shoppingItems.id, input.id), eq(shoppingItems.userId, ctx.userId)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
      return updated;
    }),

  deleteItem: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(shoppingItems)
        .where(and(eq(shoppingItems.id, input.id), eq(shoppingItems.userId, ctx.userId)));
      return { success: true };
    }),

  clearChecked: protectedProcedure
    .input(z.object({ listId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Sahiplik doğrula
      const list = await ctx.db.query.listItems.findFirst({
        where: and(eq(listItems.id, input.listId), eq(listItems.userId, ctx.userId)),
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.delete(shoppingItems)
        .where(and(
          eq(shoppingItems.listId, input.listId),
          eq(shoppingItems.checked, true)
        ));
      return { success: true };
    }),

  /* Barkod arama — Open Food Facts ücretsiz API */
  barcodeSearch: protectedProcedure
    .input(z.object({ barcode: z.string().min(8).max(14) }))
    .query(async ({ input }) => {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${input.barcode}.json`
      );
      const data = await res.json() as any;
      if (data.status !== 1 || !data.product) return null;
      return {
        name: data.product.product_name ?? data.product.product_name_tr ?? "Bilinmiyor",
        brand: data.product.brands ?? "",
        imageUrl: data.product.image_url ?? null,
        category: "other" as const,
      };
    }),
});
