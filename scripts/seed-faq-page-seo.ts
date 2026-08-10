/**
 * TZ #11 §1 — metatags for /faq.
 *
 * The FAQ page previously had no `static_pages` row, so `generateMetadata`
 * fell back to the generic `faq.title` / `faq.subtitle` UI strings. This
 * seeds a proper row so the page has the SEO title/description the SEO team
 * specified, and so admins can edit them at /admin/pages/faq like any other
 * static page.
 *
 * Safe to re-run — upserts by slug.
 *
 * Run: npx tsx scripts/seed-faq-page-seo.ts
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

const SEO = {
  title_uk: "Часті запитання",
  title_ru: "Частые вопросы",
  title_en: "Frequently asked questions",
  seo_title_uk: "Часті запитання про послуги, консультації та запис в GENEVITY",
  seo_title_ru: "Часто задаваемые вопросы об услугах, консультациях и записи в GENEVITY",
  seo_title_en:
    "Frequently Asked Questions About Services, Consultations, and Appointments at GENEVITY",
  seo_desc_uk:
    "Відповіді на часті запитання про консультації, процедури, підготовку до візиту, оплату, безпеку, аналізи та діагностику в 🤍 GENEVITY у Дніпрі.",
  seo_desc_ru:
    "Ответы на часто задаваемые вопросы о консультациях, процедурах, подготовке к визиту, оплате, безопасности, анализах и диагностике в 🤍 GENEVITY в Днепре.",
  seo_desc_en:
    "Answers to frequently asked questions about consultations, procedures, preparing for your visit, payment, safety, tests, and diagnostics at 🤍 GENEVITY in Dnipro.",
};

async function main() {
  const existing = await sql`SELECT id FROM static_pages WHERE slug = 'faq' LIMIT 1`;

  if (existing.length) {
    await sql`
      UPDATE static_pages SET
        seo_title_uk = ${SEO.seo_title_uk},
        seo_title_ru = ${SEO.seo_title_ru},
        seo_title_en = ${SEO.seo_title_en},
        seo_desc_uk  = ${SEO.seo_desc_uk},
        seo_desc_ru  = ${SEO.seo_desc_ru},
        seo_desc_en  = ${SEO.seo_desc_en},
        updated_at   = now()
      WHERE slug = 'faq'
    `;
    console.log("✓ updated existing static_pages row for /faq");
  } else {
    await sql`
      INSERT INTO static_pages (
        slug, title_uk, title_ru, title_en,
        seo_title_uk, seo_title_ru, seo_title_en,
        seo_desc_uk, seo_desc_ru, seo_desc_en
      ) VALUES (
        'faq', ${SEO.title_uk}, ${SEO.title_ru}, ${SEO.title_en},
        ${SEO.seo_title_uk}, ${SEO.seo_title_ru}, ${SEO.seo_title_en},
        ${SEO.seo_desc_uk}, ${SEO.seo_desc_ru}, ${SEO.seo_desc_en}
      )
    `;
    console.log("✓ inserted static_pages row for /faq");
  }

  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
