/**
 * Create media_mentions table.
 * Run: npx tsx scripts/run-migration-019.ts
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
    path.resolve(__dirname, "migrations/019_media_mentions.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 019 applied: media_mentions created");
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'media_mentions' ORDER BY ordinal_position`;
  console.log("columns:", cols.map((r) => r.column_name));
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
