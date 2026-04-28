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
  const services = await sql`
    SELECT s.slug, s.title_uk, sc.title_uk as category,
      (SELECT COUNT(*) FROM content_sections cs WHERE cs.owner_id = s.id AND cs.owner_type = 'service') as sections,
      (SELECT COUNT(*) FROM faq_items fi WHERE fi.owner_id = s.id AND fi.owner_type = 'service') as faqs,
      (SELECT string_agg(DISTINCT cs2.section_type::text, ', ') FROM content_sections cs2 WHERE cs2.owner_id = s.id AND cs2.owner_type = 'service') as types
    FROM services s
    LEFT JOIN service_categories sc ON sc.id = s.category_id
    ORDER BY sc.title_uk, s.slug
  `;
  for (const s of services) {
    const cnt = Number(s.sections);
    const status = cnt === 0 ? "❌ EMPTY" : `✓ ${s.sections}sec [${s.types}] ${s.faqs}FAQs`;
    console.log(`[${s.category}] ${s.slug} — ${status}`);
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
