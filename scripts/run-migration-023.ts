/**
 * Add WhatsApp consent + delivery status to form_submissions.
 * Run: npx tsx scripts/run-migration-023.ts
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
  const file = path.resolve(__dirname, "migrations/023_whatsapp_confirmation.sql");
  await sql.unsafe(fs.readFileSync(file, "utf-8"));

  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'form_submissions'
      AND column_name IN ('whatsapp_opt_in', 'whatsapp_status')
    ORDER BY column_name
  `;
  console.log("✓ migration 023 applied");
  for (const c of cols) {
    console.log(`  ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`);
  }
  await sql.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
