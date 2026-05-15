/**
 * Add two JSONB columns to the `services` table so admins can customise each
 * service detail page individually:
 *
 *   • block_headings — localized heading overrides for the 5 reorderable
 *     blocks (faq, doctors, equipment, relatedServices, finalCTA). Empty =
 *     fall back to the global ui_strings label.
 *
 *   • final_cta — Final CTA card customization per-service: bg type
 *     (color token / image), color (CSS var name), image URL, image focal
 *     point. Copy (heading, subtitle, button label) still comes from
 *     ui_strings for now.
 *
 * Both default to NULL; template falls back gracefully.
 *
 * Run: npx tsx scripts/migrate-service-overrides.ts
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
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS block_headings JSONB`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS final_cta JSONB`;
  console.log("✓ services.block_headings + services.final_cta columns added");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
