/**
 * Fix v2: strip trailing "|" pipes + fix casing (IV, RF, CO₂, Check-Up) +
 * replace bad-target titles (прайсові запити → service-name titles).
 * Run: npx tsx scripts/fix-seo-titles-v2.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

// Exact replacements for each slug
const categoryFixes: Record<string, { uk: string; ru: string; en: string }> = {
  "apparatus-cosmetology": {
    uk: "Апаратна косметологія у Дніпрі — EMFACE, Ultraformer MPT, EMSCULPT NEO",
    ru: "Аппаратная косметология в Днепре — EMFACE, Ultraformer MPT, EMSCULPT NEO",
    en: "Apparatus Cosmetology in Dnipro — EMFACE, Ultraformer MPT, EMSCULPT NEO",
  },
  "injectable-cosmetology": {
    uk: "Косметичні ін'єкції у Дніпрі — ботулінотерапія, філери, біоревіталізація, мезотерапія",
    ru: "Косметические инъекции в Днепре — ботулинотерапия, филлеры, биоревитализация, мезотерапия",
    en: "Cosmetic Injections in Dnipro — Botulinum Therapy, Fillers, Biorevitalisation, Mesotherapy",
  },
};

const serviceFixes: Record<string, { uk: string; ru: string; en: string }> = {
  "acupulse-co2-intimate": {
    uk: "Інтимне омолодження AcuPulse CO₂ у Дніпрі — лазерна вагінальна терапія",
    ru: "Интимное омоложение AcuPulse CO₂ в Днепре — лазерная вагинальная терапия",
    en: "AcuPulse CO₂ Intimate Rejuvenation in Dnipro — Vaginal Laser Therapy",
  },
  "biorevitalisation": {
    uk: "Біоревіталізація обличчя у Дніпрі — ін'єкційне зволоження шкіри гіалуроновою кислотою",
    ru: "Биоревитализация лица в Днепре — инъекционное увлажнение гиалуроновой кислотой",
    en: "Facial Biorevitalisation in Dnipro — Injectable Skin Hydration with Hyaluronic Acid",
  },
  "check-up-40": {
    uk: "Check-Up 40+ у Дніпрі — комплексне обстеження організму після 40 років",
    ru: "Check-Up 40+ в Днепре — комплексное обследование организма после 40 лет",
    en: "Check-Up 40+ in Dnipro — Comprehensive Health Screening After 40",
  },
  // Was targeting "Корекція овалу обличчя ціна" — wrong, price-targeted
  "contour-plasty": {
    uk: "Контурна пластика обличчя у Дніпрі — ін'єкції філерів, корекція овалу та губ",
    ru: "Контурная пластика лица в Днепре — инъекции филлеров, коррекция овала и губ",
    en: "Facial Contour Correction in Dnipro — Filler Injections, Oval and Lip Correction",
  },
  "exosomes": {
    uk: "Екзосомальна терапія у Дніпрі — омолодження та регенерація шкіри",
    ru: "Экзосомальная терапия в Днепре — омоложение и регенерация кожи",
    en: "Exosome Therapy in Dnipro — Skin Rejuvenation and Regeneration",
  },
  "hormonal-balance": {
    uk: "Програма гормонального балансу у Дніпрі — діагностика та корекція гормонів",
    ru: "Программа гормонального баланса в Днепре — диагностика и коррекция гормонов",
    en: "Hormonal Balance Programme in Dnipro — Hormone Diagnostics and Correction",
  },
  "iv-therapy": {
    uk: "IV-терапія у Дніпрі — вітамінні крапельниці та інфузійне лікування",
    ru: "IV-терапия в Днепре — витаминные капельницы и инфузионное лечение",
    en: "IV Therapy in Dnipro — Vitamin Drips and Infusion Treatment",
  },
  "juvederm": {
    uk: "Ін'єкції Juvederm у Дніпрі — філери для губ, овалу та зволоження шкіри",
    ru: "Инъекции Juvederm в Днепре — филлеры для губ, овала и увлажнения кожи",
    en: "Juvederm Injections in Dnipro — Fillers for Lips, Oval and Skin Hydration",
  },
  "laser-men": {
    uk: "Чоловіча лазерна епіляція Splendor X у Дніпрі — видалення волосся для чоловіків",
    ru: "Мужская лазерная эпиляция Splendor X в Днепре — удаление волос для мужчин",
    en: "Men's Laser Hair Removal Splendor X in Dnipro",
  },
  "laser-women": {
    uk: "Жіноча лазерна епіляція Splendor X у Дніпрі — видалення волосся для жінок",
    ru: "Женская лазерная эпиляция Splendor X в Днепре — удаление волос для женщин",
    en: "Women's Laser Hair Removal Splendor X in Dnipro",
  },
  "longevity-program": {
    uk: "Longevity програма у Дніпрі — персоналізована програма здорового довголіття",
    ru: "Longevity программа в Днепре — персонализированная программа здорового долголетия",
    en: "Longevity Programme in Dnipro — Personalised Healthy Longevity Programme",
  },
  "mesotherapy": {
    uk: "Мезотерапія обличчя у Дніпрі — ін'єкції вітамінів, пептидів та гіалуронової кислоти",
    ru: "Мезотерапия лица в Днепре — инъекции витаминов, пептидов и гиалуроновой кислоты",
    en: "Facial Mesotherapy in Dnipro — Vitamin, Peptide and Hyaluronic Acid Injections",
  },
  "monopolar-rf-lifting": {
    uk: "Монополярний RF-ліфтинг у Дніпрі — відновлення тонусу інтимної зони",
    ru: "Монополярный RF-лифтинг в Днепре — восстановление тонуса интимной зоны",
    en: "Monopolar RF Lifting in Dnipro — Intimate Zone Tone Restoration",
  },
  // Was targeting "Вартість процедури polyphil" — price-targeted, wrong
  "polyphil": {
    uk: "Процедура PolyPhil у Дніпрі — ін'єкційна корекція та зволоження шкіри",
    ru: "Процедура PolyPhil в Днепре — инъекционная коррекция и увлажнение кожи",
    en: "PolyPhil Procedure in Dnipro — Injectable Skin Correction and Hydration",
  },
  // Was targeting "Плазмотерапія протипоказання" — wrong, contra-targeted
  "prp-therapy": {
    uk: "PRP-терапія (плазмоліфтинг) у Дніпрі — ціна та показання",
    ru: "PRP-терапия (плазмолифтинг) в Днепре — цена и показания",
    en: "PRP Therapy (Plasma Lifting) in Dnipro — Price and Indications",
  },
  // Was targeting "Вартість процедури rejuran" — price-targeted, wrong
  "rejuran": {
    uk: "Rejuran у Дніпрі — ін'єкції для відновлення та омолодження шкіри",
    ru: "Rejuran в Днепре — инъекции для восстановления и омоложения кожи",
    en: "Rejuran in Dnipro — Injections for Skin Restoration and Rejuvenation",
  },
  "stem-cell-therapy": {
    uk: "Омолодження стовбуровими клітинами у Дніпрі — регенерація та відновлення шкіри",
    ru: "Омоложение стволовыми клетками в Днепре — регенерация и восстановление кожи",
    en: "Stem Cell Rejuvenation in Dnipro — Skin Regeneration and Restoration",
  },
};

async function main() {
  let fixed = 0;

  for (const [slug, t] of Object.entries(categoryFixes)) {
    await sql`
      UPDATE service_categories
      SET seo_title_uk = ${t.uk}, seo_title_ru = ${t.ru}, seo_title_en = ${t.en}
      WHERE slug = ${slug}
    `;
    console.log(`✓ cat:${slug}`);
    fixed++;
  }

  for (const [slug, t] of Object.entries(serviceFixes)) {
    await sql`
      UPDATE services
      SET seo_title_uk = ${t.uk}, seo_title_ru = ${t.ru}, seo_title_en = ${t.en}
      WHERE slug = ${slug}
    `;
    console.log(`✓ svc:${slug}`);
    fixed++;
  }

  // Blanket trailing-pipe cleanup for anything missed
  await sql`
    UPDATE services
    SET
      seo_title_uk = TRIM(TRAILING ' |' FROM TRIM(seo_title_uk)),
      seo_title_ru = TRIM(TRAILING ' |' FROM TRIM(seo_title_ru)),
      seo_title_en = TRIM(TRAILING ' |' FROM TRIM(seo_title_en))
    WHERE seo_title_uk LIKE '%|' OR seo_title_ru LIKE '%|' OR seo_title_en LIKE '%|'
  `;
  await sql`
    UPDATE service_categories
    SET
      seo_title_uk = TRIM(TRAILING ' |' FROM TRIM(seo_title_uk)),
      seo_title_ru = TRIM(TRAILING ' |' FROM TRIM(seo_title_ru)),
      seo_title_en = TRIM(TRAILING ' |' FROM TRIM(seo_title_en))
    WHERE seo_title_uk LIKE '%|' OR seo_title_ru LIKE '%|' OR seo_title_en LIKE '%|'
  `;
  console.log("✓ Blanket trailing-pipe cleanup done");

  // Verify no remaining issues
  const remaining = await sql`
    SELECT 'svc' AS t, slug, seo_title_uk FROM services
    WHERE seo_title_uk LIKE '%|' OR seo_title_uk ILIKE '% iv %' OR seo_title_uk LIKE '%check up%'
    UNION ALL
    SELECT 'cat', slug, seo_title_uk FROM service_categories
    WHERE seo_title_uk LIKE '%|'
  `;
  if (remaining.length) {
    console.warn("⚠ Still issues:");
    remaining.forEach(r => console.warn(" ", r.t, r.slug, r.seo_title_uk));
  } else {
    console.log(`✓ All clean — ${fixed} titles updated`);
  }

  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
