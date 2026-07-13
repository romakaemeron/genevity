/**
 * Add About-page trust-block columns (license photo, medical director, verified-numbers note).
 * Run: npx tsx scripts/run-migration-015.ts
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
  const migration = fs.readFileSync(path.resolve(__dirname, "migrations/015_about_trust_blocks.sql"), "utf-8");
  await sql.unsafe(migration);
  console.log("✓ Migration 015 applied: license_image, director_photo, director_name/_role, stats_note added to about");

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'about' AND column_name IN (
      'license_image', 'director_photo',
      'director_name_uk', 'director_name_ru', 'director_name_en',
      'director_role_uk', 'director_role_ru', 'director_role_en',
      'stats_note_uk', 'stats_note_ru', 'stats_note_en'
    )
    ORDER BY column_name
  `;
  console.log("About columns added:", cols.map((r) => r.column_name));

  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
