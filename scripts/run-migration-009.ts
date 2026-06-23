/**
 * Make about.requisites translatable: add requisites_uk/ru/en and backfill
 * from the existing single `requisites` column.
 * Run: npx tsx scripts/run-migration-009.ts
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
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/009_about_requisites_i18n.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 009 applied: requisites_uk/ru/en added & backfilled");

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'about' AND column_name LIKE 'requisites%'
    ORDER BY column_name
  `;
  console.log("Requisites columns:", cols.map((r) => r.column_name));
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
