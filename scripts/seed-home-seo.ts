/**
 * Seed reasonable SEO defaults for the home page static_pages row.
 * Run: npx tsx scripts/seed-home-seo.ts
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

const seed = {
  seo_title_uk: "Центр естетичної медицини та довголіття у Дніпрі | GENEVITY",
  seo_title_ru: "Центр эстетической медицины и долголетия в Днепре | GENEVITY",
  seo_title_en: "Aesthetic Medicine & Longevity Center in Dnipro | GENEVITY",
  seo_desc_uk: "GENEVITY — центр естетичної медицини у Дніпрі. Косметологія, апаратні процедури, longevity-програми. ☎ +380 73 000 0150",
  seo_desc_ru: "GENEVITY — центр эстетической медицины в Днепре. Косметология, аппаратные процедуры, longevity-программы. ☎ +380 73 000 0150",
  seo_desc_en: "GENEVITY — aesthetic medicine center in Dnipro. Cosmetology, apparatus procedures, longevity programs. ☎ +380 73 000 0150",
  seo_keywords_uk: "естетична медицина, косметологія, longevity, довголіття, GENEVITY, Дніпро, апаратна косметологія",
  seo_keywords_ru: "эстетическая медицина, косметология, longevity, долголетие, GENEVITY, Днепр, аппаратная косметология",
  seo_keywords_en: "aesthetic medicine, cosmetology, longevity, longevity center, GENEVITY, Dnipro, aesthetic clinic",
};

async function main() {
  await sql`
    UPDATE static_pages SET
      seo_title_uk = COALESCE(NULLIF(seo_title_uk, ''), ${seed.seo_title_uk}),
      seo_title_ru = COALESCE(NULLIF(seo_title_ru, ''), ${seed.seo_title_ru}),
      seo_title_en = COALESCE(NULLIF(seo_title_en, ''), ${seed.seo_title_en}),
      seo_desc_uk  = COALESCE(NULLIF(seo_desc_uk,  ''), ${seed.seo_desc_uk}),
      seo_desc_ru  = COALESCE(NULLIF(seo_desc_ru,  ''), ${seed.seo_desc_ru}),
      seo_desc_en  = COALESCE(NULLIF(seo_desc_en,  ''), ${seed.seo_desc_en}),
      seo_keywords_uk = COALESCE(NULLIF(seo_keywords_uk, ''), ${seed.seo_keywords_uk}),
      seo_keywords_ru = COALESCE(NULLIF(seo_keywords_ru, ''), ${seed.seo_keywords_ru}),
      seo_keywords_en = COALESCE(NULLIF(seo_keywords_en, ''), ${seed.seo_keywords_en})
    WHERE slug = 'home'
  `;
  console.log("✓ home SEO seeded");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
