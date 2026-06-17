import { z } from "zod";
import { t, protectedProcedure } from "./trpc";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/crypto";
import { TRPCError } from "@trpc/server";

export const userRouter = t.router({
  updateProfile: protectedProcedure
    .input(z.object({
      name:          z.string().min(2).max(64).optional(),
      locale:        z.enum(["tr","en"]).optional(),
      notifChannel:  z.enum(["in_app","email","both"]).optional(),
      weeklyDigest:  z.boolean().optional(),
      smartIdleDays: z.number().int().min(0).max(30).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db.update(users)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(users.id, ctx.userId))
        .returning({ id: users.id, email: users.email, name: users.name,
                     locale: users.locale, notifChannel: users.notifChannel,
                     weeklyDigest: users.weeklyDigest, smartIdleDays: users.smartIdleDays });
      return updated;
    }),

  changePassword: protectedProcedure
    .input(z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({ where: eq(users.id, ctx.userId) });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Mevcut şifre hatalı" });
      }
      await ctx.db.update(users)
        .set({ passwordHash: await hashPassword(input.newPassword), updatedAt: new Date() })
        .where(eq(users.id, ctx.userId));
      return { success: true };
    }),

  requestDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await ctx.db.update(users)
      .set({ deletedAt: new Date(), scheduledPurgeAt: purgeDate, updatedAt: new Date() })
      .where(eq(users.id, ctx.userId));
    await ctx.db.delete(sessions).where(eq(sessions.userId, ctx.userId));
    return { success: true, purgeDate: purgeDate.toISOString() };
  }),

  cancelDeletion: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.update(users)
      .set({ deletedAt: null, scheduledPurgeAt: null, updatedAt: new Date() })
      .where(eq(users.id, ctx.userId));
    return { success: true };
  }),
});
