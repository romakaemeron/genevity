/**
 * Create google_place_stats (place-level Google rating cache).
 * Run: npx tsx scripts/run-migration-021.ts
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
    path.resolve(__dirname, "migrations/021_google_place_stats.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 021 applied: google_place_stats created");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
