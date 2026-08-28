import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "pg";
import { INITIAL_USERS } from "./seed/users";

async function runSafeMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn("[MIGRATE] DATABASE_URL not set, skipping database migration.");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    // 1. Content versions table (for history/rollback)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "content_versions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "page" text NOT NULL,
        "section" text NOT NULL,
        "snapshot" jsonb NOT NULL,
        "note" text,
        "updated_by" uuid,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 2. Newsletter subscribers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL UNIQUE,
        "locale" text DEFAULT 'nl' NOT NULL,
        "source" text DEFAULT 'modal' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 3. Auth codes table (passwordless OTP & magic links)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "auth_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "code_hash" text NOT NULL,
        "magic_token_hash" text,
        "attempts" integer DEFAULT 0 NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 4. Make password_hash nullable on users
    try {
      await pool.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;`);
    } catch {
      // Ignore if already nullable
    }

    // 5. Seed initial admin accounts for passwordless login
    for (const email of INITIAL_USERS) {
      try {
        await pool.query(
          `INSERT INTO "users" ("email") VALUES ($1) ON CONFLICT ("email") DO NOTHING;`,
          [email]
        );
      } catch {
        // Ignore conflict
      }
    }

    console.log("[MIGRATE] Database schema and initial accounts successfully verified.");
  } catch (err: any) {
    console.warn("[MIGRATE NOTICE] Startup migration notice (continuing):", err?.message || err);
  } finally {
    try {
      await pool.end();
    } catch {
      // Ignore pool close errors
    }
  }
}

runSafeMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.warn("[MIGRATE ERROR] Migration error (continuing startup):", err);
    process.exit(0);
  });
