/**
 * Add block_order TEXT[] to services, service_categories, static_pages so
 * admins can reorder page sections from the admin UI.
 *
 * Run: npx tsx scripts/migrate-block-order.ts
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
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS block_order TEXT[]`;
  await sql`ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS block_order TEXT[]`;
  await sql`ALTER TABLE static_pages ADD COLUMN IF NOT EXISTS block_order TEXT[]`;
  console.log("✓ block_order columns added");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
