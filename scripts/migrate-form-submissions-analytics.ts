/**
 * Extend form_submissions with the analytics fields we want on every
 * lead email + in the admin portal:
 *
 *   form_label     TEXT  — which CTA surface (homepage hero, service
 *                           final, doctor modal, etc.)
 *   page_title     TEXT  — document.title at submit time
 *   referrer       TEXT  — document.referrer (where the visitor came from)
 *   utm_source     TEXT  — captured on landing, persisted via
 *   utm_medium     TEXT     sessionStorage so UTMs survive in-site
 *   utm_campaign   TEXT     navigation between first touch and the
 *   utm_term       TEXT     actual form submit.
 *   utm_content    TEXT
 *
 * Run: npx tsx scripts/migrate-form-submissions-analytics.ts
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
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS form_label   TEXT`;
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS page_title   TEXT`;
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS referrer     TEXT`;
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS utm_source   TEXT`;
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS utm_medium   TEXT`;
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS utm_campaign TEXT`;
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS utm_term     TEXT`;
  await sql`ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS utm_content  TEXT`;
  console.log("✓ form_submissions: analytics columns added");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
