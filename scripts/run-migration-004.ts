/**
 * Add title_uk/ru/en columns to gallery_items for SEO image title attributes.
 * Run: npx tsx scripts/run-migration-004.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

async function run() {
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/004_gallery_title.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 004 applied: title_uk/ru/en added to gallery_items");

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'gallery_items' AND column_name LIKE 'title_%'
    ORDER BY column_name
  `;
  console.log("Title columns:", cols.map((r) => r.column_name));
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
