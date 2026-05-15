/**
 * Fix duplicate GENEVITY branding in seo_title fields.
 * Layout template appends " | GENEVITY" automatically — stored titles must NOT contain GENEVITY.
 * Run: npx tsx scripts/fix-seo-titles.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

const staticTitles: Record<string, { uk: string; ru: string; en: string; desc_uk: string; desc_ru: string; desc_en: string }> = {
  stationary: {
    uk: "Денний стаціонар у Дніпрі — IV-терапія та відновлення після процедур",
    ru: "Дневной стационар в Днепре — IV-терапия и восстановление после процедур",
    en: "Day Stationary in Dnipro — IV Therapy & Post-Procedure Recovery",
    desc_uk: "Денний стаціонар GENEVITY у Дніпрі: індивідуальні палати, IV-терапія, відновлення після процедур. ☎ +380 73 000 0150",
    desc_ru: "Дневной стационар GENEVITY в Днепре: индивидуальные палаты, IV-терапия, восстановление после процедур. ☎ +380 73 000 0150",
    desc_en: "GENEVITY day stationary in Dnipro: private rooms, IV therapy, post-procedure recovery. ☎ +380 73 000 0150",
  },
  laboratory: {
    uk: "Лабораторія та аналізи у Дніпрі — швидко, точно, конфіденційно",
    ru: "Лаборатория и анализы в Днепре — быстро, точно, конфиденциально",
    en: "Laboratory & Tests in Dnipro — Fast, Accurate, Confidential",
    desc_uk: "Повний спектр лабораторних аналізів та УЗД у центрі GENEVITY у Дніпрі. Результати онлайн. ☎ +380 73 000 0150",
    desc_ru: "Полный спектр лабораторных анализов и УЗИ в центре GENEVITY в Днепре. Результаты онлайн. ☎ +380 73 000 0150",
    desc_en: "Full range of lab tests and ultrasound at GENEVITY center in Dnipro. Online results. ☎ +380 73 000 0150",
  },
  about: {
    uk: "Про центр GENEVITY у Дніпрі — команда лікарів, обладнання, підхід",
    ru: "О центре GENEVITY в Днепре — команда врачей, оборудование, подход",
    en: "About GENEVITY Dnipro — Medical Team, Equipment, Approach",
    desc_uk: "Центр естетичної медицини та довголіття GENEVITY у Дніпрі. Команда експертів, передове обладнання, доказова медицина.",
    desc_ru: "Центр эстетической медицины и долголетия GENEVITY в Днепре. Команда экспертов, передовое оборудование, доказательная медицина.",
    desc_en: "GENEVITY aesthetic medicine and longevity center in Dnipro. Expert team, advanced equipment, evidence-based medicine.",
  },
  contacts: {
    uk: "Контакти GENEVITY — адреса, телефон, графік роботи у Дніпрі",
    ru: "Контакты GENEVITY — адрес, телефон, график работы в Днепре",
    en: "GENEVITY Contacts — Address, Phone & Hours in Dnipro",
    desc_uk: "Контакти клініки GENEVITY у Дніпрі: адреса, телефон, графік роботи. ☎ +380 73 000 0150",
    desc_ru: "Контакты клиники GENEVITY в Днепре: адрес, телефон, график работы. ☎ +380 73 000 0150",
    desc_en: "GENEVITY clinic contacts in Dnipro: address, phone, working hours. ☎ +380 73 000 0150",
  },
  prices: {
    uk: "Ціни на послуги косметології та медицини у Дніпрі",
    ru: "Цены на услуги косметологии и медицины в Днепре",
    en: "Prices for Cosmetic & Medical Services in Dnipro",
    desc_uk: "Ціни на послуги GENEVITY у Дніпрі: косметологія, апаратні процедури, лазерна епіляція, діагностика. ☎ +380 73 000 0150",
    desc_ru: "Цены на услуги GENEVITY в Днепре: косметология, аппаратные процедуры, лазерная эпиляция, диагностика. ☎ +380 73 000 0150",
    desc_en: "GENEVITY service prices in Dnipro: cosmetology, apparatus procedures, laser hair removal, diagnostics. ☎ +380 73 000 0150",
  },
  doctors: {
    uk: "Лікарі GENEVITY — сертифіковані спеціалісти з естетичної медицини у Дніпрі",
    ru: "Врачи GENEVITY — сертифицированные специалисты по эстетической медицине в Днепре",
    en: "GENEVITY Doctors — Certified Aesthetic Medicine Specialists in Dnipro",
    desc_uk: "Команда лікарів центру GENEVITY у Дніпрі. Досвідчені спеціалісти в естетичній медицині та longevity.",
    desc_ru: "Команда врачей центра GENEVITY в Днепре. Опытные специалисты в эстетической медицине и longevity.",
    desc_en: "GENEVITY medical team in Dnipro. Experienced specialists in aesthetic medicine and longevity.",
  },
};

async function main() {
  // 1. Fix static_pages
  for (const [slug, t] of Object.entries(staticTitles)) {
    const res = await sql`
      UPDATE static_pages
      SET seo_title_uk = ${t.uk}, seo_title_ru = ${t.ru}, seo_title_en = ${t.en},
          seo_desc_uk  = ${t.desc_uk}, seo_desc_ru = ${t.desc_ru}, seo_desc_en = ${t.desc_en}
      WHERE slug = ${slug}
    `;
    console.log(`✓ static_pages.${slug} (${res.count} row)`);
  }

  // 2. Strip "в GENEVITY —" / "у GENEVITY —" / " — GENEVITY" patterns from services seo_title
  await sql`
    UPDATE services
    SET
      seo_title_uk = TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(seo_title_uk, '\\s*(в|у)\\s+GENEVITY\\s*[—–-]\\s*', '', 'gi'),
        '\\s*[—–-]?\\s*GENEVITY[^|]*$', '', 'gi'
      )),
      seo_title_ru = TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(seo_title_ru, '\\s*в\\s+GENEVITY\\s*[—–-]\\s*', '', 'gi'),
        '\\s*[—–-]?\\s*GENEVITY[^|]*$', '', 'gi'
      )),
      seo_title_en = TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(seo_title_en, '\\s*(at|in)\\s+GENEVITY\\s*[—–-]\\s*', '', 'gi'),
        '\\s*[—–-]?\\s*GENEVITY[^|]*$', '', 'gi'
      ))
    WHERE seo_title_uk ILIKE '%GENEVITY%'
       OR seo_title_ru ILIKE '%GENEVITY%'
       OR seo_title_en ILIKE '%GENEVITY%'
  `;
  console.log("✓ services seo_title cleaned");

  // 3. Same for service_categories
  await sql`
    UPDATE service_categories
    SET
      seo_title_uk = TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(seo_title_uk, '\\s*(в|у)\\s+GENEVITY\\s*[—–-]\\s*', '', 'gi'),
        '\\s*[—–-]?\\s*GENEVITY[^|]*$', '', 'gi'
      )),
      seo_title_ru = TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(seo_title_ru, '\\s*в\\s+GENEVITY\\s*[—–-]\\s*', '', 'gi'),
        '\\s*[—–-]?\\s*GENEVITY[^|]*$', '', 'gi'
      )),
      seo_title_en = TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(seo_title_en, '\\s*(at|in)\\s+GENEVITY\\s*[—–-]\\s*', '', 'gi'),
        '\\s*[—–-]?\\s*GENEVITY[^|]*$', '', 'gi'
      ))
    WHERE seo_title_uk ILIKE '%GENEVITY%'
       OR seo_title_ru ILIKE '%GENEVITY%'
       OR seo_title_en ILIKE '%GENEVITY%'
  `;
  console.log("✓ service_categories seo_title cleaned");

  // 4. Verify no doubled GENEVITY remains
  const broken = await sql`
    SELECT 'static_pages' AS tbl, slug, seo_title_uk FROM static_pages
    WHERE seo_title_uk ~* 'GENEVITY.{0,20}GENEVITY'
    UNION ALL
    SELECT 'services', slug, seo_title_uk FROM services
    WHERE seo_title_uk ~* 'GENEVITY.{0,20}GENEVITY'
    UNION ALL
    SELECT 'service_categories', slug, seo_title_uk FROM service_categories
    WHERE seo_title_uk ~* 'GENEVITY.{0,20}GENEVITY'
  `;
  if (broken.length) {
    console.warn("⚠ Still doubled GENEVITY:");
    broken.forEach(r => console.warn(" ", r.tbl, r.slug, r.seo_title_uk));
  } else {
    console.log("✓ No doubled GENEVITY found");
  }

  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
