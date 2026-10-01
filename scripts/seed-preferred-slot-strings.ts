/**
 * Seed the ui_strings keys for the booking form's preferred day / time
 * picker (DateTimePicker). Lives under the existing `ctaForm` namespace so
 * translators edit it alongside the rest of the form.
 *
 * Safe to re-run — existing keys are preserved.
 *
 * Run: npx tsx scripts/seed-preferred-slot-strings.ts
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
  preferredLabel: {
    uk: "Бажаний день і час",
    ru: "Желаемый день и время",
    en: "Preferred day and time",
  },
  preferredPlaceholder: {
    uk: "Необов'язково — оберіть зручний день",
    ru: "Необязательно — выберите удобный день",
    en: "Optional — pick a day that suits you",
  },
  preferredTimeHeading: {
    uk: "Час",
    ru: "Время",
    en: "Time",
  },
  preferredTimeHint: {
    uk: "Спочатку оберіть день",
    ru: "Сначала выберите день",
    en: "Pick a day first",
  },
  preferredAnyTime: {
    uk: "Будь-який час",
    ru: "Любое время",
    en: "Any time",
  },
  preferredPrevMonth: {
    uk: "Попередній місяць",
    ru: "Предыдущий месяц",
    en: "Previous month",
  },
  preferredNextMonth: {
    uk: "Наступний місяць",
    ru: "Следующий месяц",
    en: "Next month",
  },
};

async function main() {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.ctaForm = tree.ctaForm || {};

  let added = 0;
  for (const [key, value] of Object.entries(NEW_KEYS)) {
    if (!tree.ctaForm[key]) {
      tree.ctaForm[key] = value;
      added += 1;
    }
  }

  if (added === 0) {
    console.log("↷ all keys already present — no changes");
  } else {
    await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
    console.log(`✓ added ${added} new ctaForm keys`);
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
