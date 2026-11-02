/**
 * Apple Wallet pass updates: per-card auth token, pass_updated_at, device registrations.
 * Idempotent (IF NOT EXISTS throughout); prints the resulting schema for verification.
 * Run: npx tsx scripts/run-migration-029.ts
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
    path.resolve(__dirname, "migrations/029_loyalty_pass_updates.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 029 applied: loyalty_pass_updates");

  const cols = await sql`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (table_name = 'loyalty_apple_registrations'
        OR (table_name = 'loyalty_cards' AND column_name IN ('apple_auth_token', 'pass_updated_at')))
    ORDER BY table_name, ordinal_position`;
  for (const c of cols) {
    console.log(`  ${c.table_name}.${c.column_name}: ${c.data_type}${c.is_nullable === "NO" ? " NOT NULL" : ""}`);
  }
  // Token values are secrets: report only counts and lengths.
  const [stats] = await sql`
    SELECT count(*)::int AS cards,
           count(*) FILTER (WHERE length(apple_auth_token) = 64)::int AS tokens_ok,
           count(DISTINCT apple_auth_token)::int AS tokens_distinct
    FROM loyalty_cards`;
  console.log(`  cards: ${stats.cards}, 64-char tokens: ${stats.tokens_ok}, distinct tokens: ${stats.tokens_distinct}`);
  const idx = await sql`
    SELECT indexname FROM pg_indexes WHERE tablename = 'loyalty_apple_registrations' ORDER BY indexname`;
  console.log(`  indexes: ${idx.map((i) => i.indexname).join(", ")}`);
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
