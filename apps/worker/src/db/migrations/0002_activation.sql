-- 0002_activation.sql
ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "activation_code" text;
ALTER TABLE "users" ADD COLUMN "activation_retry_count" smallint DEFAULT 0 NOT NULL;
ALTER TABLE "users" ADD COLUMN "last_activation_sent_at" timestamp;

-- Optionally mark existing users as verified so they don't get locked out
UPDATE "users" SET "is_verified" = true;
