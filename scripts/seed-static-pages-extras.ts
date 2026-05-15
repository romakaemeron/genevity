import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const pages = [
  {
    slug: "about",
    title_uk: "Про центр",
    title_ru: "О центре",
    title_en: "About",
  },
  {
    slug: "contacts",
    title_uk: "Контакти",
    title_ru: "Контакты",
    title_en: "Contacts",
  },
  {
    slug: "doctors",
    title_uk: "Лікарі",
    title_ru: "Врачи",
    title_en: "Doctors",
  },
  {
    slug: "prices",
    title_uk: "Ціни",
    title_ru: "Цены",
    title_en: "Prices",
  },
  {
    slug: "services",
    title_uk: "Послуги",
    title_ru: "Услуги",
    title_en: "Services",
  },
];

async function run() {
  for (const p of pages) {
    const existing = await sql`SELECT id FROM static_pages WHERE slug = ${p.slug}`;
    if (existing.length) {
      console.log(`• ${p.slug} already exists — skipping`);
      continue;
    }
    await sql`
      INSERT INTO static_pages (slug, title_uk, title_ru, title_en)
      VALUES (${p.slug}, ${p.title_uk}, ${p.title_ru}, ${p.title_en})
    `;
    console.log(`✓ Seeded static_pages row for ${p.slug}`);
  }
  console.log("done");
}

run().catch((e) => { console.error(e); process.exit(1); });
