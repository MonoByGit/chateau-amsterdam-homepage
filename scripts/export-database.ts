import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL || "postgresql://localhost:5432/railway";

async function exportDatabase() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  console.log("Connecting to production Postgres to export database...");

  const tables = [
    "users",
    "auth_codes",
    "sessions",
    "content_blocks",
    "content_versions",
    "media",
    "reservations",
    "availability_blocks",
    "newsletter_subscribers",
  ];

  let sqlOutput = `-- =============================================================\n`;
  sqlOutput += `-- Chateau Amsterdam Database Export\n`;
  sqlOutput += `-- Exported on: ${new Date().toISOString()}\n`;
  sqlOutput += `-- Source: Railway Production PostgreSQL\n`;
  sqlOutput += `-- =============================================================\n\n`;

  // Include migration DDL / schemas
  const migrationFiles = fs
    .readdirSync(path.join(process.cwd(), "drizzle"))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  sqlOutput += `-- 1. Schema DDL Definitions\n`;
  for (const file of migrationFiles) {
    const content = fs.readFileSync(path.join(process.cwd(), "drizzle", file), "utf-8");
    sqlOutput += `-- File: drizzle/${file}\n`;
    sqlOutput += content + "\n\n";
  }

  sqlOutput += `-- 2. Data Inserts\n`;

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT * FROM "${table}"`);
      sqlOutput += `\n-- Table: ${table} (${res.rows.length} rows)\n`;

      if (res.rows.length > 0) {
        for (const row of res.rows) {
          const columns = Object.keys(row).map((k) => `"${k}"`).join(", ");
          const values = Object.values(row).map((v) => {
            if (v === null || v === undefined) return "NULL";
            if (typeof v === "number" || typeof v === "boolean") return v;
            if (v instanceof Date) return `'${v.toISOString()}'`;
            if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
            return `'${String(v).replace(/'/g, "''")}'`;
          }).join(", ");

          sqlOutput += `INSERT INTO "${table}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
        }
      }
    } catch (err: any) {
      console.warn(`Could not export table ${table}:`, err.message);
    }
  }

  const exportPath = path.join(process.cwd(), "database_export.sql");
  fs.writeFileSync(exportPath, sqlOutput, "utf-8");
  console.log(`Database export saved successfully to ${exportPath}`);

  await pool.end();
}

exportDatabase().catch(console.error);
