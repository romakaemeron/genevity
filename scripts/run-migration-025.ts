/**
 * Add `certificates` JSONB to equipment.
 * Run: npx tsx scripts/run-migration-025.ts
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
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/025_equipment_certificates.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 025 applied: equipment.certificates");

  const cols = await sql`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'equipment' AND column_name = 'certificates'
  `;
  console.log(cols);
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
