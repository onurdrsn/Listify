import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyJWT } from "../lib/jwt";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import type { KVNamespace, DurableObjectNamespace } from "@cloudflare/workers-types";

type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  TMDB_API_KEY: string;
  APP_URL: string;
  RATE_LIMIT_KV: KVNamespace;
  REMINDER_SCHEDULER: DurableObjectNamespace;
};

export async function createContext(opts: FetchCreateContextFnOptions, env: Env) {
  const db = drizzle(neon(env.DATABASE_URL), { schema });
  let userId: string | null = null;

  const authHeader = opts.req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (payload) userId = payload.sub;
  }

  return { db, userId, env, req: opts.req };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
