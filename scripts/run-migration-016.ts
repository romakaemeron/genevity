/**
 * Create google_reviews cache table for Google reviews (Business Profile API or Places API).
 * Run: npx tsx scripts/run-migration-016.ts
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
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/016_google_reviews.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 016 applied: google_reviews cache table created");

  const tableExists = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'google_reviews'
  `;
  console.log("Table exists:", tableExists.length > 0 ? "yes" : "no");

  const columns = await sql`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'google_reviews'
    ORDER BY ordinal_position
  `;
  console.log("Columns created:", columns.map((c) => `${c.column_name} (${c.data_type})`).join(", "));

  const indexExists = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'google_reviews' AND indexname = 'google_reviews_visible_idx'
  `;
  console.log("Index google_reviews_visible_idx exists:", indexExists.length > 0 ? "yes" : "no");

  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
