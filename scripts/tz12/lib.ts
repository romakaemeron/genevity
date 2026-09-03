/**
 * TZ #12 — shared seeding helpers.
 *
 * Source of truth for the 11 new service pages:
 *   tasks_inweb/genevity.com.ua _ Технічне завдання №12 _ Метатеги - genevity.com.ua.csv
 *
 * Same shape as scripts/seed-tz-v8-new-services.ts, with two corrections:
 *   - block_order entries are written with the `section:` prefix the template
 *     and admin actions expect (v8 wrote bare UUIDs and had to be repaired);
 *   - relations (related services / doctors / equipment) are seeded here too,
 *     so the new pages carry the internal links the SEO brief requires.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { randomUUID } from "crypto";

export const sql = postgres(process.env.DATABASE_URL!);

export type L = { uk: string; ru: string; en: string };

export type RichTextSection = { type: "richText"; heading: L; body: L; calloutBody?: L };
export type IndicationsSection = {
  type: "indicationsContraindications";
  indicationsHeading: L; indications: L[];
  contraindicationsHeading: L; contraindications: L[];
};
export type StepsSection = { type: "steps"; heading: L; steps: { title: L; description: L }[] };
export type BulletsSection = { type: "bullets"; heading: L; items: L[] };
export type AnySection = RichTextSection | IndicationsSection | StepsSection | BulletsSection;

export interface Meta {
  category: string;          // service_categories.slug
  h1: L;                     // ← "URL UA/RU/EN" column + city
  seoTitle: L;               // ← "Title" column
  seoDesc: L;                // ← "Description" column
}

export interface ServiceSeed {
  slug: string;
  meta: Meta;
  title: L;
  summary: L;
  procedureLength?: L;
  effectDuration?: L;
  sessionsRecommended?: L;
  sections: AnySection[];
  faqs: { question: L; answer: L }[];
  related?: string[];        // service slugs
  doctors?: string[];        // doctor slugs
  equipment?: string[];      // equipment.id
  blocks?: string[];
}

export const PROCEDURE_BLOCKS = ["faq", "doctors", "equipment", "relatedServices", "finalCTA"];

function sectionData(s: AnySection): object {
  switch (s.type) {
    case "richText": return { heading: s.heading, body: s.body, calloutBody: s.calloutBody ?? null, heroImage: null };
    case "indicationsContraindications": return {
      indicationsHeading: s.indicationsHeading, indications: s.indications,
      contraindicationsHeading: s.contraindicationsHeading, contraindications: s.contraindications,
    };
    case "steps": return { heading: s.heading, steps: s.steps };
    case "bullets": return { heading: s.heading, items: s.items };
  }
}

async function categoryId(slug: string): Promise<string> {
  const [row] = await sql`SELECT id FROM service_categories WHERE slug = ${slug}`;
  if (!row) throw new Error(`Category not found: ${slug}`);
  return row.id;
}

export async function seedService(svc: ServiceSeed) {
  const catId = await categoryId(svc.meta.category);

  let [row] = await sql`SELECT id FROM services WHERE slug = ${svc.slug}`;
  if (!row) {
    const id = randomUUID();
    const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM services WHERE category_id = ${catId}`;
    await sql`INSERT INTO services(id, slug, category_id, title_uk, sort_order)
              VALUES(${id}, ${svc.slug}, ${catId}, ${svc.title.uk}, ${Number(max) + 10})`;
    row = { id };
    console.log(`  + created ${svc.slug} in ${svc.meta.category} (sort ${Number(max) + 10})`);
  }
  const serviceId: string = row.id;
  const m = svc.meta;

  await sql`
    UPDATE services SET
      category_id=${catId},
      title_uk=${svc.title.uk}, title_ru=${svc.title.ru}, title_en=${svc.title.en},
      h1_uk=${m.h1.uk}, h1_ru=${m.h1.ru}, h1_en=${m.h1.en},
      summary_uk=${svc.summary.uk}, summary_ru=${svc.summary.ru}, summary_en=${svc.summary.en},
      procedure_length_uk=${svc.procedureLength?.uk ?? null}, procedure_length_ru=${svc.procedureLength?.ru ?? null}, procedure_length_en=${svc.procedureLength?.en ?? null},
      effect_duration_uk=${svc.effectDuration?.uk ?? null}, effect_duration_ru=${svc.effectDuration?.ru ?? null}, effect_duration_en=${svc.effectDuration?.en ?? null},
      sessions_recommended_uk=${svc.sessionsRecommended?.uk ?? null}, sessions_recommended_ru=${svc.sessionsRecommended?.ru ?? null}, sessions_recommended_en=${svc.sessionsRecommended?.en ?? null},
      seo_title_uk=${m.seoTitle.uk}, seo_title_ru=${m.seoTitle.ru}, seo_title_en=${m.seoTitle.en},
      seo_desc_uk=${m.seoDesc.uk}, seo_desc_ru=${m.seoDesc.ru}, seo_desc_en=${m.seoDesc.en},
      updated_at=now()
    WHERE id=${serviceId}`;

  await sql`DELETE FROM content_sections WHERE owner_id=${serviceId} AND owner_type='service'`;
  await sql`DELETE FROM faq_items WHERE owner_id=${serviceId} AND owner_type='service'`;

  const sectionIds: string[] = [];
  for (let i = 0; i < svc.sections.length; i++) {
    const sec = svc.sections[i];
    const id = randomUUID();
    sectionIds.push(`section:${id}`);
    await sql`INSERT INTO content_sections(id, owner_type, owner_id, sort_order, section_type, data)
              VALUES(${id}, 'service', ${serviceId}, ${i}, ${sec.type}::section_type, ${sql.json(sectionData(sec) as never)})`;
  }
  for (let i = 0; i < svc.faqs.length; i++) {
    const f = svc.faqs[i];
    await sql`INSERT INTO faq_items(owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
              VALUES('service', ${serviceId}, ${i}, ${f.question.uk}, ${f.question.ru}, ${f.question.en}, ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en})`;
  }
  await sql`UPDATE services SET block_order=${[...sectionIds, ...(svc.blocks ?? PROCEDURE_BLOCKS)]} WHERE id=${serviceId}`;

  // ── relations ────────────────────────────────────────────────────────────
  await sql`DELETE FROM service_related WHERE service_id=${serviceId}`;
  let n = 0;
  for (const relSlug of svc.related ?? []) {
    const [r] = await sql`SELECT id FROM services WHERE slug=${relSlug}`;
    if (!r) { console.log(`    ⚠ related service not found: ${relSlug}`); continue; }
    await sql`INSERT INTO service_related(service_id, related_service_id, sort_order) VALUES(${serviceId}, ${r.id}, ${n++})`;
  }

  await sql`DELETE FROM service_doctors WHERE service_id=${serviceId}`;
  n = 0;
  for (const docSlug of svc.doctors ?? []) {
    const [d] = await sql`SELECT id FROM doctors WHERE slug=${docSlug}`;
    if (!d) { console.log(`    ⚠ doctor not found: ${docSlug}`); continue; }
    await sql`INSERT INTO service_doctors(service_id, doctor_id, sort_order) VALUES(${serviceId}, ${d.id}, ${n++})`;
  }

  await sql`DELETE FROM service_equipment WHERE service_id=${serviceId}`;
  n = 0;
  for (const eqId of svc.equipment ?? []) {
    const [e] = await sql`SELECT id FROM equipment WHERE id=${eqId}`;
    if (!e) { console.log(`    ⚠ equipment not found: ${eqId}`); continue; }
    await sql`INSERT INTO service_equipment(service_id, equipment_id, sort_order) VALUES(${serviceId}, ${eqId}, ${n++})`;
  }

  console.log(`✓ ${svc.slug} — ${svc.sections.length} sections, ${svc.faqs.length} FAQs, ` +
              `${(svc.related ?? []).length} related, ${(svc.doctors ?? []).length} doctors, ${(svc.equipment ?? []).length} devices`);
}

/** equipment.id constants (equipment has no slug column) */
export const EQ = {
  ULTRAFORMER_MPT: "43033463-9b71-421f-a1eb-9f24c9f7b713",
  EXION_FACE:      "8a58bc56-6e1a-4f70-be08-cbeb0a3df349",
  VOLNEWMER:       "18e12727-116a-4e38-b08d-397a37f10aaa",
  M22:             "1466b7ba-0060-447e-8619-f3c7eea7f76a",
  ACUPULSE:        "b9fc15cc-b374-4bc4-83f7-a0310675a287",
  SPLENDOR_X:      "d98aec45-ab1a-4828-8dce-5946ec2fb8ee",
} as const;

export const COSMETOLOGISTS = ["beliyanushkin-viktor", "sepkina-hanna"];
