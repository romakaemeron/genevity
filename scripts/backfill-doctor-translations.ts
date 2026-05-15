/**
 * Backfill missing RU/EN translations for doctors stored as literal "null" strings.
 * Run: npx tsx scripts/backfill-doctor-translations.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

type Row = {
  name_uk: string;
  name_ru: string;
  name_en: string;
  role_ru: string;
  role_en: string;
  exp_ru: string;
  exp_en: string;
};

// Key on the Ukrainian name so the script is idempotent even if IDs change.
const translations: Record<string, Row> = {
  "Бєлянушкін Віктор Ігорович": {
    name_uk: "Бєлянушкін Віктор Ігорович",
    name_ru: "Белянушкин Виктор Игоревич",
    name_en: "Бєлянушкін Віктор Ігорович",
    role_ru: "Директор филиала, врач дерматолог / косметолог",
    role_en: "Branch Director, Dermatologist / Cosmetologist",
    exp_ru: "20 лет",
    exp_en: "20 years",
  },
  "Сепкіна Ганна Сергіївна": {
    name_uk: "Сепкіна Ганна Сергіївна",
    name_ru: "Сепкина Анна Сергеевна",
    name_en: "Сепкіна Ганна Сергіївна",
    role_ru: "Врач дерматолог / косметолог",
    role_en: "Dermatologist / Cosmetologist",
    exp_ru: "20 лет",
    exp_en: "20 years",
  },
  "Макаренко Олександра Сергіївна": {
    name_uk: "Макаренко Олександра Сергіївна",
    name_ru: "Макаренко Александра Сергеевна",
    name_en: "Макаренко Олександра Сергіївна",
    role_ru: "Врач эндокринолог",
    role_en: "Endocrinologist",
    exp_ru: "8 лет",
    exp_en: "8 years",
  },
  "Єсаянц Анна Олександрівна": {
    name_uk: "Єсаянц Анна Олександрівна",
    name_ru: "Есаянц Анна Александровна",
    name_en: "Єсаянц Анна Олександрівна",
    role_ru: "Врач гинеколог",
    role_en: "Gynecologist",
    exp_ru: "20 лет",
    exp_en: "20 years",
  },
  "Кириленко Анжела В'ячеславівна": {
    name_uk: "Кириленко Анжела В'ячеславівна",
    name_ru: "Кириленко Анжела Вячеславовна",
    name_en: "Кириленко Анжела В'ячеславівна",
    role_ru: "Подолог",
    role_en: "Podologist",
    exp_ru: "",
    exp_en: "",
  },
  "Толстикова Тетяна Миколаївна": {
    name_uk: "Толстикова Тетяна Миколаївна",
    name_ru: "Толстикова Татьяна Николаевна",
    name_en: "Толстикова Тетяна Миколаївна",
    role_ru: "Врач гастроэнтеролог, диетолог",
    role_en: "Gastroenterologist, Dietitian",
    exp_ru: "25 лет",
    exp_en: "25 years",
  },
};

async function main() {
  let updated = 0;
  for (const [uk, t] of Object.entries(translations)) {
    const res = await sql`
      UPDATE doctors SET
        name_ru = ${t.name_ru},
        name_en = ${t.name_en},
        role_ru = ${t.role_ru},
        role_en = ${t.role_en},
        experience_ru = ${t.exp_ru},
        experience_en = ${t.exp_en}
      WHERE name_uk = ${uk}
        AND (name_ru = 'null' OR name_ru IS NULL OR name_ru = '')
    `;
    if (res.count > 0) {
      console.log(`✓ Updated: ${uk}`);
      updated += res.count;
    } else {
      console.log(`· Skipped (already translated or not found): ${uk}`);
    }
  }
  console.log(`\nDone. Updated ${updated} doctor row(s).`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
