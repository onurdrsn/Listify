import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./router/index";
import { createContext } from "./router/context";
import { ReminderScheduler } from "./durable-objects/ReminderScheduler";
import { purgeDeletedUsers } from "./lib/kvkk";
import { fireWeeklyDigests } from "./services/resend";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./db/schema";
import type { KVNamespace, DurableObjectNamespace, ScheduledEvent, ExecutionContext } from "@cloudflare/workers-types";

export { ReminderScheduler };

type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  TMDB_API_KEY: string;
  COOKIE_SECRET: string;
  APP_URL: string;
  CRON_SECRET: string;
  RATE_LIMIT_KV: KVNamespace;
  SESSION_KV: KVNamespace;
  REMINDER_SCHEDULER: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", secureHeaders());
app.use("*", cors({
  origin: (origin) => {
    if (!origin) return null;
    const allowed = [
      "https://listify.pages.dev",
      "http://localhost:5173",
      "https://listify.onurd.com.tr"
    ];
    if (allowed.includes(origin) || origin.endsWith(".onurd.com.tr") || origin === "https://onurd.com.tr") {
      return origin;
    }
    return null;
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.use("/trpc/*", trpcServer({
  router: appRouter,
  createContext: (opts, c) => createContext(opts, c.env),
}));

app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));

app.get("/api/cron/purge", async (c) => {
  if (!c.env.CRON_SECRET || c.req.query("secret") !== c.env.CRON_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = drizzle(neon(c.env.DATABASE_URL), { schema });
  c.executionCtx.waitUntil(purgeDeletedUsers(db));
  return c.json({ status: "Purge task started" });
});

app.get("/api/cron/digest", async (c) => {
  if (!c.env.CRON_SECRET || c.req.query("secret") !== c.env.CRON_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = drizzle(neon(c.env.DATABASE_URL), { schema });
  c.executionCtx.waitUntil(fireWeeklyDigests(db, c.env));
  return c.json({ status: "Digest task started" });
});

export default {
  fetch: app.fetch,
};
