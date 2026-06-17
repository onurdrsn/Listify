import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Geçersiz e-posta"),
  password: z.string().min(8, "En az 8 karakter"),
  name: z.string().min(2).max(64),
  locale: z.enum(["tr", "en"]).default("tr"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçersiz e-posta"),
  password: z.string().min(1, "Şifre zorunludur"),
});
