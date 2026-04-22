/**
 * Add site_settings.og_image so the site-wide default OG image becomes editable
 * from /admin/settings → General Settings.
 * Run: npx tsx scripts/migrate-og-default.ts
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

async function main() {
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS og_image TEXT`;
  // Seed the old hardcoded default so every existing page keeps its visual
  await sql`UPDATE site_settings SET og_image = '/og/genevity-og.jpg' WHERE og_image IS NULL AND id = 1`;
  console.log("✓ site_settings.og_image added + seeded");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
