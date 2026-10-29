/**
 * Friends loyalty cards table.
 * Run: npx tsx scripts/run-migration-027.ts
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
    path.resolve(__dirname, "migrations/027_loyalty_cards.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 027 applied: loyalty_cards");
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
