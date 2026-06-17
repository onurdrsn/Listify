import { defineConfig } from "drizzle-kit";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, ".dev.vars") });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
