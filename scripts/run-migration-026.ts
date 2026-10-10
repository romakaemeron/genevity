/**
 * ТЗ #15 (doctor publications) + ТЗ #16 (before/after, promotions,
 * homepage final CTA, "alternatives" section type).
 * Run: npx tsx scripts/run-migration-026.ts
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
    path.resolve(__dirname, "migrations/026_tz15_tz16.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 026 applied: doctors.publications, before_after_cases, promotions, homepage_cta, section_type 'alternatives'");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
