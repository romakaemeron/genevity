import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type StaticPageSeed = {
  slug: string;
  title: { uk: string; ru: string; en: string };
  h1?: { uk: string; ru: string; en: string };
  summary: { uk: string; ru: string; en: string };
  seoTitle?: { uk: string; ru: string; en: string };
  seoDesc?: { uk: string; ru: string; en: string };
};

const pages: StaticPageSeed[] = [
  {
    slug: "stationary",
    title: {
      uk: "Денний стаціонар",
      ru: "Дневной стационар",
      en: "Day Stationary",
    },
    h1: {
      uk: "Денний стаціонар GENEVITY — медичний комфорт та відновлення",
      ru: "Дневной стационар GENEVITY — медицинский комфорт и восстановление",
      en: "GENEVITY Day Stationary — Medical Comfort & Recovery",
    },
    summary: {
      uk: "Індивідуальні палати, постійний медичний моніторинг та персональний супровід у центрі Дніпра. Відновлення після процедур у повному комфорті та конфіденційності.",
      ru: "Индивидуальные палаты, постоянный медицинский мониторинг и персональное сопровождение в центре Днепра. Восстановление после процедур в полном комфорте и конфиденциальности.",
      en: "Private rooms, continuous medical monitoring and personal care in central Dnipro. Recovery after procedures in complete comfort and confidentiality.",
    },
    seoTitle: {
      uk: "Денний стаціонар у Дніпрі — GENEVITY",
      ru: "Дневной стационар в Днепре — GENEVITY",
      en: "Day Stationary in Dnipro — GENEVITY",
    },
    seoDesc: {
      uk: "Денний стаціонар центру GENEVITY у Дніпрі: індивідуальні палати, IV-терапія, медичний моніторинг, відновлення після процедур.",
      ru: "Дневной стационар центра GENEVITY в Днепре: индивидуальные палаты, IV-терапия, медицинский мониторинг, восстановление после процедур.",
      en: "GENEVITY day stationary in Dnipro: private rooms, IV therapy, medical monitoring, post-procedure recovery.",
    },
  },
  {
    slug: "laboratory",
    title: {
      uk: "Лабораторія та діагностика",
      ru: "Лаборатория и диагностика",
      en: "Laboratory & Diagnostics",
    },
    h1: {
      uk: "Лабораторія та діагностика GENEVITY — точні результати за одне відвідування",
      ru: "Лаборатория и диагностика GENEVITY — точные результаты за одно посещение",
      en: "GENEVITY Laboratory & Diagnostics — Accurate Results in One Visit",
    },
    summary: {
      uk: "Повний спектр лабораторних аналізів та інструментальної діагностики на місці. УЗД, ЕКГ, Check-Up програми — усе в одному центрі в Дніпрі.",
      ru: "Полный спектр лабораторных анализов и инструментальной диагностики на месте. УЗИ, ЭКГ, Check-Up программы — всё в одном центре в Днепре.",
      en: "Full range of laboratory tests and instrumental diagnostics on-site. Ultrasound, ECG, Check-Up programs — all in one center in Dnipro.",
    },
    seoTitle: {
      uk: "Лабораторія та діагностика — GENEVITY Дніпро",
      ru: "Лаборатория и диагностика — GENEVITY Днепр",
      en: "Laboratory & Diagnostics — GENEVITY Dnipro",
    },
    seoDesc: {
      uk: "Лабораторні аналізи, УЗД-діагностика, ЕКГ, Check-Up програми у центрі GENEVITY. Точна діагностика та швидкі результати.",
      ru: "Лабораторные анализы, УЗД-диагностика, ЭКГ, Check-Up программы в центре GENEVITY. Точная диагностика и быстрые результаты.",
      en: "Laboratory tests, ultrasound diagnostics, ECG, Check-Up programs at GENEVITY. Accurate diagnostics and fast results.",
    },
  },
];

async function seed() {
  for (const p of pages) {
    const existing = await sql`SELECT id FROM static_pages WHERE slug = ${p.slug}`;
    if (existing.length) {
      console.log(`• ${p.slug} already exists — skipping`);
      continue;
    }
    await sql`
      INSERT INTO static_pages (slug,
        title_uk, title_ru, title_en,
        h1_uk, h1_ru, h1_en,
        summary_uk, summary_ru, summary_en,
        seo_title_uk, seo_title_ru, seo_title_en,
        seo_desc_uk, seo_desc_ru, seo_desc_en)
      VALUES (${p.slug},
        ${p.title.uk}, ${p.title.ru}, ${p.title.en},
        ${p.h1?.uk ?? null}, ${p.h1?.ru ?? null}, ${p.h1?.en ?? null},
        ${p.summary.uk}, ${p.summary.ru}, ${p.summary.en},
        ${p.seoTitle?.uk ?? null}, ${p.seoTitle?.ru ?? null}, ${p.seoTitle?.en ?? null},
        ${p.seoDesc?.uk ?? null}, ${p.seoDesc?.ru ?? null}, ${p.seoDesc?.en ?? null})
    `;
    console.log(`✓ Seeded ${p.slug}`);
  }
  console.log("done");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
