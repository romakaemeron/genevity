/**
 * Seed: align SEO tags for quality-policy and public-offer with the templated
 * style used by the other legal pages (license, air-raid-rules, privacy-policy):
 *   seo_title — "[Document] GENEVITY" (no pipe)
 *   seo_desc  — "[Phrase] 🤍 GENEVITY 💫 [middle] ⏩ [closing]."
 *
 * Run: npx tsx scripts/seed-legal-seo-template.ts
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

async function main() {
  console.log("🔖 Aligning legal SEO tags with the templated style...\n");

  // ---- quality-policy ----
  const qp = await sql`
    UPDATE legal_docs SET
      seo_title_uk = 'Політика якості медичного центру GENEVITY',
      seo_title_ru = 'Политика качества медицинского центра GENEVITY',
      seo_title_en = 'GENEVITY medical center quality policy',
      seo_desc_uk = 'Політика якості медичного центру 🤍 GENEVITY 💫 Стандарти безпеки, персоналізованого підходу та доказової медицини ⏩ Якість медичних послуг у центрі довголіття у Дніпрі.',
      seo_desc_ru = 'Политика качества медицинского центра 🤍 GENEVITY 💫 Стандарты безопасности, персонализированного подхода и доказательной медицины ⏩ Качество медицинских услуг в центре долголетия в Днепре.',
      seo_desc_en = 'Quality policy of the medical center 🤍 GENEVITY 💫 Standards of safety, a personalized approach and evidence-based medicine ⏩ Quality of medical services at the longevity center in Dnipro.'
    WHERE slug = 'quality-policy'
  `;
  console.log(`  ${qp.count ? "✓" : "⚠ NOT FOUND —"} quality-policy (${qp.count} row)`);

  // ---- public-offer ----
  const po = await sql`
    UPDATE legal_docs SET
      seo_title_uk = 'Договір публічної оферти GENEVITY',
      seo_title_ru = 'Договор публичной оферты GENEVITY',
      seo_title_en = 'GENEVITY public offer agreement',
      seo_desc_uk = 'Договір публічної оферти про надання послуг 🤍 GENEVITY 💫 Умови надання медичних та супутніх послуг ⏩ Права та обов''язки сторін у центрі довголіття у Дніпрі.',
      seo_desc_ru = 'Договор публичной оферты об оказании услуг 🤍 GENEVITY 💫 Условия оказания медицинских и сопутствующих услуг ⏩ Права и обязанности сторон в центре долголетия в Днепре.',
      seo_desc_en = 'Public offer agreement for the provision of services 🤍 GENEVITY 💫 Terms of medical and related services ⏩ Rights and obligations of the parties at the longevity center in Dnipro.'
    WHERE slug = 'public-offer'
  `;
  console.log(`  ${po.count ? "✓" : "⚠ NOT FOUND —"} public-offer (${po.count} row)`);

  await sql.end();
  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
