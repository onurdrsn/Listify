import { z } from "zod";
import { t, publicProcedure, protectedProcedure } from "./trpc";
import { users, sessions } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword, verifyPassword, sha256Hex } from "../lib/crypto";
import { signJWT } from "../lib/jwt";
import { TRPCError } from "@trpc/server";
import { sendActivationEmail } from "../services/resend";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authRouter = t.router({
  register: publicProcedure
    .input(z.object({
      email:  z.string().email("Geçersiz e-posta"),
      password: z.string().min(8, "En az 8 karakter"),
      name:   z.string().min(2).max(64),
      locale: z.enum(["tr", "en"]).default("tr"),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.query.users.findFirst({
        where: and(eq(users.email, input.email.toLowerCase()), isNull(users.deletedAt)),
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Bu e-posta zaten kayıtlı" });

      const passwordHash = await hashPassword(input.password);
      const code = generateCode();
      const [user] = await ctx.db.insert(users)
        .values({ 
          email: input.email.toLowerCase(), 
          passwordHash, 
          name: input.name, 
          locale: input.locale,
          isVerified: false,
          activationCode: code,
          activationRetryCount: 0,
          lastActivationSentAt: new Date()
        })
        .returning({ id: users.id, email: users.email, name: users.name, locale: users.locale });

      // send email asynchronously
      ctx.waitUntil(sendActivationEmail(ctx.env.RESEND_API_KEY, user.email, user.name, code, user.locale as any));

      return { success: true, email: user.email };
    }),

  verify: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string().length(6) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: and(eq(users.email, input.email.toLowerCase()), isNull(users.deletedAt)),
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (user.isVerified) throw new TRPCError({ code: "BAD_REQUEST", message: "Already verified" });
      if (user.activationCode !== input.code) throw new TRPCError({ code: "UNAUTHORIZED", message: "Geçersiz veya süresi dolmuş kod" });

      const [updated] = await ctx.db.update(users)
        .set({ isVerified: true, activationCode: null, activationRetryCount: 0, lastActivationSentAt: null })
        .where(eq(users.id, user.id))
        .returning({ id: users.id, email: users.email, name: users.name, locale: users.locale, notifChannel: users.notifChannel, weeklyDigest: users.weeklyDigest, smartIdleDays: users.smartIdleDays });

      const token = await signJWT({ sub: updated.id }, ctx.env.JWT_SECRET, "30d");
      await ctx.db.insert(sessions).values({
        userId: updated.id,
        tokenHash: await sha256Hex(token),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: ctx.req.headers.get("user-agent") ?? undefined,
      });

      return { token, user: updated };
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: and(eq(users.email, input.email.toLowerCase()), isNull(users.deletedAt)),
      });
      if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-posta veya şifre hatalı" });
      }

      if (!user.isVerified) {
        const now = new Date();
        const lastSent = user.lastActivationSentAt || new Date(0);
        const retryCount = user.activationRetryCount;
        const backoffSeconds = 30 * Math.pow(2, retryCount); // 30, 60, 120, 240...
        const diffSeconds = (now.getTime() - lastSent.getTime()) / 1000;

        if (diffSeconds < backoffSeconds) {
          const waitLeft = Math.ceil(backoffSeconds - diffSeconds);
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Lütfen ${waitLeft} saniye bekleyin.` });
        }

        const code = generateCode();
        await ctx.db.update(users)
          .set({ 
            activationCode: code, 
            activationRetryCount: retryCount + 1, 
            lastActivationSentAt: now 
          })
          .where(eq(users.id, user.id));

        ctx.waitUntil(sendActivationEmail(ctx.env.RESEND_API_KEY, user.email, user.name, code, user.locale as any));
        throw new TRPCError({ code: "FORBIDDEN", message: "Hesabınız doğrulanmamış." });
      }

      const token = await signJWT({ sub: user.id }, ctx.env.JWT_SECRET, "30d");
      await ctx.db.insert(sessions).values({
        userId: user.id,
        tokenHash: await sha256Hex(token),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: ctx.req.headers.get("user-agent") ?? undefined,
      });

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, locale: user.locale,
                notifChannel: user.notifChannel, weeklyDigest: user.weeklyDigest,
                smartIdleDays: user.smartIdleDays },
      };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const token = ctx.req.headers.get("Authorization")?.slice(7);
    if (token) {
      await ctx.db.delete(sessions).where(eq(sessions.tokenHash, await sha256Hex(token)));
    }
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: and(eq(users.id, ctx.userId), isNull(users.deletedAt)),
      columns: { id: true, email: true, name: true, locale: true,
                 notifChannel: true, weeklyDigest: true, smartIdleDays: true, createdAt: true },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),
});
