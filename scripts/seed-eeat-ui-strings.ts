/**
 * Seed the ui_strings keys used by the E-E-A-T `ReviewedByBadge` and
 * `MedicalDisclaimer` components. Adds them under a new `eeat` namespace.
 *
 * Safe to re-run — existing keys are preserved, other namespaces untouched.
 *
 * Run: npx tsx scripts/seed-eeat-ui-strings.ts
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

const NEW_KEYS: Record<string, { uk: string; ru: string; en: string }> = {
  reviewedBy: {
    uk: "Перевірено лікарем",
    ru: "Проверено врачом",
    en: "Medically reviewed by",
  },
  updated: {
    uk: "оновлено",
    ru: "обновлено",
    en: "updated",
  },
  disclaimer: {
    uk: "Ця інформація має ознайомлювальний характер і не замінює консультацію лікаря.",
    ru: "Эта информация носит ознакомительный характер и не заменяет консультацию врача.",
    en: "This information is for general awareness and does not replace a doctor's consultation.",
  },
  sourcesHeading: {
    uk: "Джерела",
    ru: "Источники",
    en: "Sources",
  },
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.eeat = tree.eeat || {};

  let added = 0;
  for (const [key, value] of Object.entries(NEW_KEYS)) {
    if (!tree.eeat[key]) {
      tree.eeat[key] = value;
      added += 1;
    }
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
