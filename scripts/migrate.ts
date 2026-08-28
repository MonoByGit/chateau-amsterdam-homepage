import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { INITIAL_USERS } from "./seed/users";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set, skipping database migration.");
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied via drizzle migrator.");
  } catch (err: any) {
    console.warn("Drizzle migration notice (continuing startup):", err?.message || err);
  }

  // Ensure newsletter_subscribers table exists safely
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL UNIQUE,
        "locale" text DEFAULT 'nl' NOT NULL,
        "source" text DEFAULT 'modal' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    console.log("newsletter_subscribers table verified.");
  } catch (err) {
    console.warn("Could not verify newsletter_subscribers table:", err);
  }

  // Ensure auth_codes table exists safely
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "auth_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "code_hash" text NOT NULL,
        "magic_token_hash" text,
        "attempts" integer DEFAULT 0 NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    console.log("auth_codes table verified.");
  } catch (err) {
    console.warn("Could not verify auth_codes table:", err);
  }

  // Ensure password_hash is nullable on users
  try {
    await pool.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);
    console.log("users table password_hash constraint verified.");
  } catch (err) {
    // Ignore if already nullable or column doesn't exist
  }

  // Ensure initial admin accounts exist
  try {
    for (const email of INITIAL_USERS) {
      await pool.query(
        `INSERT INTO "users" ("email") VALUES ($1) ON CONFLICT ("email") DO NOTHING`,
        [email]
      );
    }
    console.log("Initial admin accounts verified.");
  } catch (err) {
    console.warn("Could not verify initial admin accounts:", err);
  }

  await pool.end();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.warn("Migration warning (continuing startup):", err);
    process.exit(0);
  });
