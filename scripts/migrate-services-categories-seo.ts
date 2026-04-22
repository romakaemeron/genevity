/**
 * Add seo_keywords to services and service_categories, plus seo_noindex to
 * service_categories so both match the full static_pages SEO feature set.
 * Run: npx tsx scripts/migrate-services-categories-seo.ts
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
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_keywords_uk TEXT`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_keywords_ru TEXT`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS seo_keywords_en TEXT`;

  await sql`ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS seo_keywords_uk TEXT`;
  await sql`ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS seo_keywords_ru TEXT`;
  await sql`ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS seo_keywords_en TEXT`;
  await sql`ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS seo_noindex BOOLEAN NOT NULL DEFAULT false`;

  console.log("✓ services + service_categories SEO columns added");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
