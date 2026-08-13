/**
 * UI strings for the "expand a clamped review" toggle on the homepage Google
 * reviews slider:
 *   - eeat.reviewsMore — "Читати повністю"
 *   - eeat.reviewsLess — "Згорнути"
 *
 * Safe to re-run — existing keys are preserved.
 *
 * Run: npx tsx scripts/seed-reviews-expand-ui-strings.ts
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

type L = { uk: string; ru: string; en: string };

const EEAT: Record<string, L> = {
  reviewsMore: {
    uk: "Читати повністю",
    ru: "Читать полностью",
    en: "Read full review",
  },
  reviewsLess: {
    uk: "Згорнути",
    ru: "Свернуть",
    en: "Show less",
  },
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.eeat = tree.eeat || {};

  let added = 0;
  for (const [key, value] of Object.entries(EEAT)) {
    if (!tree.eeat[key]) { tree.eeat[key] = value; added += 1; }
  }

  if (added === 0) {
    console.log("↷ all keys already present — no changes");
  } else {
    await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
    console.log(`✓ added ${added} new eeat keys`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
