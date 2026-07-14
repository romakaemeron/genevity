/**
 * Add category column to faq_items for grouping dedicated /faq page sections.
 * Run: npx tsx scripts/run-migration-017.ts
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
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/017_faq_category.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 017 applied: category column added to faq_items");

  const faqItemsCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'faq_items' AND column_name = 'category'
    ORDER BY column_name
  `;
  console.log("FAQ Items columns added:", faqItemsCols.map((r) => r.column_name));

  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
