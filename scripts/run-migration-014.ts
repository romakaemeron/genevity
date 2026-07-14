/**
 * Add 'sources' to section_type enum.
 * Run: npx tsx scripts/run-migration-014.ts
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
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/014_section_sources.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 014 applied: 'sources' added to section_type enum");

  const values = await sql`
    SELECT enumlabel FROM pg_enum
    WHERE enumtypid = 'section_type'::regtype
    ORDER BY enumsortorder
  `;
  console.log("section_type values:", values.map((r) => r.enumlabel));

  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
