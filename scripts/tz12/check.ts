/**
 * Verify the TZ #12 pages against the metatag CSV and the site's content rules.
 * Run: npx tsx scripts/tz12/check.ts
 */
import { sql } from "./lib";
import { apparatus } from "./content-apparatus";
import { apparatusB } from "./content-apparatus-b";
import { laser } from "./content-laser";
import { laserB } from "./content-laser-b";

const ALL = [...apparatus, ...apparatusB, ...laser, ...laserB];
const LOCALES = ["uk", "ru", "en"] as const;

async function main() {
  let problems = 0;
  const bad = (m: string) => { console.log("  ✗ " + m); problems++; };

  for (const svc of ALL) {
    const [row] = await sql`
      SELECT s.*, c.slug AS cat, d.slug AS reviewer
      FROM services s
      JOIN service_categories c ON c.id = s.category_id
      LEFT JOIN doctors d ON d.id = s.reviewer_doctor_id
      WHERE s.slug = ${svc.slug}`;
    console.log(`\n${svc.slug}`);
    if (!row) { bad("service row missing"); continue; }
    if (row.cat !== svc.meta.category) bad(`category is ${row.cat}, expected ${svc.meta.category}`);
    if (!row.reviewer) bad("no medical reviewer assigned");

    for (const l of LOCALES) {
      if (row[`seo_title_${l}`] !== svc.meta.seoTitle[l]) bad(`seo_title_${l} does not match the CSV`);
      if (row[`seo_desc_${l}`] !== svc.meta.seoDesc[l]) bad(`seo_desc_${l} does not match the CSV`);
      if (row[`h1_${l}`] !== svc.meta.h1[l]) bad(`h1_${l} does not match`);
      for (const f of ["title", "h1", "summary", "seo_title", "seo_desc"]) {
        if (!row[`${f}_${l}`]) bad(`${f}_${l} is empty`);
      }
      const t = row[`seo_title_${l}`] as string;
      // CSV titles run long in EN; flag only what would break the SERP badly
      if (t.length > 80) bad(`seo_title_${l} is ${t.length} chars`);
      const d = row[`seo_desc_${l}`] as string;
      if (d.length > 165) bad(`seo_desc_${l} is ${d.length} chars`);
      // site-wide convention: plain hyphen, no em/en dashes (see scripts/replace-dashes.ts)
      for (const f of ["title", "h1", "summary", "seo_title", "seo_desc"]) {
        if (/[–—]/.test(row[`${f}_${l}`] ?? "")) bad(`${f}_${l} contains an en/em dash`);
      }
    }

    const secs = await sql`SELECT id, section_type, data FROM content_sections WHERE owner_id=${row.id} AND owner_type='service' ORDER BY sort_order`;
    if (secs.length !== svc.sections.length) bad(`${secs.length} sections, expected ${svc.sections.length}`);
    for (const s of secs) {
      if (typeof s.data !== "object" || s.data === null) { bad(`section ${s.section_type} data is not a jsonb object (double-encoded?)`); continue; }
      const txt = JSON.stringify(s.data);
      for (const l of LOCALES) if (!txt.includes(`"${l}"`)) bad(`section ${s.section_type} missing ${l}`);
      if (/[–—]/.test(txt)) bad(`section ${s.section_type} contains an en/em dash`);
    }

    const faqs = await sql`SELECT * FROM faq_items WHERE owner_id=${row.id} AND owner_type='service' ORDER BY sort_order`;
    if (faqs.length !== 7) bad(`${faqs.length} FAQs, expected 7`);
    for (const f of faqs) for (const l of LOCALES) {
      if (!f[`question_${l}`] || !f[`answer_${l}`]) bad(`FAQ ${f.sort_order} incomplete in ${l}`);
    }

    const order: string[] = row.block_order ?? [];
    const sectionKeys = secs.map((s: any) => `section:${s.id}`);
    if (order.slice(0, sectionKeys.length).join("|") !== sectionKeys.join("|")) bad("block_order does not start with the section ids");
    for (const k of order) if (!k.startsWith("section:") && !["faq","reviews","doctors","equipment","relatedServices","finalCTA"].includes(k)) bad(`unknown block_order key: ${k}`);

    const rel = await sql`SELECT COUNT(*)::int AS n FROM service_related WHERE service_id=${row.id}`;
    const doc = await sql`SELECT COUNT(*)::int AS n FROM service_doctors WHERE service_id=${row.id}`;
    const eqp = await sql`SELECT COUNT(*)::int AS n FROM service_equipment WHERE service_id=${row.id}`;
    if (rel[0].n < 3) bad(`only ${rel[0].n} related services (need >= 3)`);
    if (doc[0].n < 1) bad("no doctors linked");
    if (eqp[0].n < 1) bad("no equipment linked");
    if (!problems) console.log(`  ok - ${secs.length} sections, ${faqs.length} FAQs, ${rel[0].n} related, ${doc[0].n} doctors, ${eqp[0].n} devices`);
  }

  // Cross-page duplication: no two pages may share an opening section body.
  const bodies = new Map<string, string>();
  for (const svc of ALL) {
    const first = svc.sections[0];
    if (first.type !== "richText") continue;
    const key = first.body.uk.slice(0, 200);
    if (bodies.has(key)) bad(`duplicate opening copy: ${svc.slug} and ${bodies.get(key)}`);
    bodies.set(key, svc.slug);
  }

  console.log(problems === 0 ? "\nAll TZ #12 checks passed." : `\n${problems} problem(s) found.`);
  await sql.end();
  process.exit(problems === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
