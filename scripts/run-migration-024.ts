/**
 * Add price_subcategories + price_items catalogue columns.
 * Run: npx tsx scripts/run-migration-024.ts
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
  const migration = fs.readFileSync(
    path.resolve(__dirname, "migrations/024_price_catalogue.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 024 applied");
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'price_items' ORDER BY ordinal_position`;
  console.log("price_items:", cols.map((r) => r.column_name).join(", "));
  const sub = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'price_subcategories' ORDER BY ordinal_position`;
  console.log("price_subcategories:", sub.map((r) => r.column_name).join(", "));
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
