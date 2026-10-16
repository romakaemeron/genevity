/**
 * Seed a batch of plastic surgery landing pages (ТЗ #16 structure, ТЗ #17
 * metatags) under the `plastic-surgery` category.
 *
 * One batch per data file in scripts/data/:
 *   plastic-surgery-face.json    — the seven facial pages
 *   plastic-surgery-breast.json  — the five breast pages
 *   plastic-surgery-body.json    — the six body pages
 *
 * Copy and metatags come from `scripts/data/plastic-surgery-face.json`, which
 * was generated once from the client's Word documents and is the source of
 * truth from here on — edit that file (or /admin), never the .docx.
 *
 * Idempotent: services are upserted by (slug, category), and their sections,
 * FAQ entries, relations and before/after cases are deleted and rewritten on
 * every run. Re-running after an edit in /admin WILL discard that edit, so
 * treat this as the initial-import tool it is.
 *
 * Run: npx tsx scripts/seed-plastic-surgery-face.ts <data-file> [--dry]
 *      npx tsx scripts/seed-plastic-surgery-face.ts plastic-surgery-body.json
 *
 * `--dry` executes every statement and then rolls the transaction back, which
 * is the only honest way to prove the SQL works against a database that has no
 * staging copy.
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const env: Record<string, string> = {};
fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8")
  .split("\n")
  .forEach((l) => {
    const [k, ...v] = l.split("=");
    if (k && v.length) env[k.trim()] = v.join("=").trim();
  });

const sql = postgres(env.DATABASE_URL!);
const DRY = process.argv.includes("--dry");
const FILE = process.argv.slice(2).find((a) => a.endsWith(".json")) ?? "plastic-surgery-face.json";

/** Thrown at the end of a --dry run purely to roll the transaction back. */
const ROLLBACK = Symbol("dry-run rollback");

type Loc = { uk: string; ru: string; en: string };
interface Section { type: string; data: Record<string, unknown> }
interface BeforeAfter { count: number; zone: Loc; sessions: Loc; alt: Loc }
interface Page {
  slug: string;
  sortOrder: number;
  /** Pages awaiting a clinician's review ship noindex so nothing unreviewed
   *  is indexed; clearing the flag in /admin publishes them. */
  seoNoindex?: boolean;
  /** Sibling slugs for the "Related services" block, in order. */
  related: string[];
  beforeAfter?: BeforeAfter;
  h1: Loc; title: Loc; summary: Loc;
  seoTitle: Loc; seoDescription: Loc;
  heroImage: string;
  sections: Section[];
  faq: { question: Loc; answer: Loc }[];
}

const content = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "data", FILE), "utf-8"),
) as { categorySlug: string; pages: Page[] };

/** Fixed blocks appended after the editable sections, in render order. */
const TAIL_BLOCKS = ["beforeAfter", "doctors", "reviews", "relatedServices", "faq", "finalCTA"];

async function main(sql: postgres.TransactionSql) {
  console.log(`seeding ${FILE}`);
  const [cat] = await sql`SELECT id FROM service_categories WHERE slug = ${content.categorySlug}`;
  if (!cat) throw new Error(`category "${content.categorySlug}" not found`);

  // Every page is reviewed by the senior plastic surgeon — the E-E-A-T byline
  // the service template renders under the H1.
  const [reviewer] = await sql`
    SELECT id FROM doctors WHERE slug = 'detsyk-dmytro' AND is_published = true
  `;
  const surgeons = await sql`
    SELECT id, slug FROM doctors
    WHERE slug IN ('detsyk-dmytro', 'harmash-serhii') AND is_published = true
    ORDER BY slug = 'detsyk-dmytro' DESC
  `;
  if (!reviewer || surgeons.length !== 2) throw new Error("expected both published surgeons");

  const ids: Record<string, string> = {};

  for (const p of content.pages) {
    const [row] = await sql`
      INSERT INTO services (
        slug, category_id, title_uk, title_ru, title_en, h1_uk, h1_ru, h1_en,
        summary_uk, summary_ru, summary_en, hero_image,
        seo_title_uk, seo_title_ru, seo_title_en,
        seo_desc_uk, seo_desc_ru, seo_desc_en,
        sort_order, reviewer_doctor_id, last_reviewed_at, seo_noindex
      ) VALUES (
        ${p.slug}, ${cat.id}, ${p.title.uk}, ${p.title.ru}, ${p.title.en},
        ${p.h1.uk}, ${p.h1.ru}, ${p.h1.en},
        ${p.summary.uk}, ${p.summary.ru}, ${p.summary.en}, ${p.heroImage},
        ${p.seoTitle.uk}, ${p.seoTitle.ru}, ${p.seoTitle.en},
        ${p.seoDescription.uk}, ${p.seoDescription.ru}, ${p.seoDescription.en},
        ${p.sortOrder}, ${reviewer.id}, now(), ${p.seoNoindex ?? false}
      )
      ON CONFLICT (slug, category_id) DO UPDATE SET
        title_uk = EXCLUDED.title_uk, title_ru = EXCLUDED.title_ru, title_en = EXCLUDED.title_en,
        h1_uk = EXCLUDED.h1_uk, h1_ru = EXCLUDED.h1_ru, h1_en = EXCLUDED.h1_en,
        summary_uk = EXCLUDED.summary_uk, summary_ru = EXCLUDED.summary_ru, summary_en = EXCLUDED.summary_en,
        hero_image = EXCLUDED.hero_image,
        seo_title_uk = EXCLUDED.seo_title_uk, seo_title_ru = EXCLUDED.seo_title_ru, seo_title_en = EXCLUDED.seo_title_en,
        seo_desc_uk = EXCLUDED.seo_desc_uk, seo_desc_ru = EXCLUDED.seo_desc_ru, seo_desc_en = EXCLUDED.seo_desc_en,
        sort_order = EXCLUDED.sort_order,
        reviewer_doctor_id = EXCLUDED.reviewer_doctor_id,
        last_reviewed_at = EXCLUDED.last_reviewed_at,
        seo_noindex = EXCLUDED.seo_noindex,
        updated_at = now()
      RETURNING id
    `;
    ids[p.slug] = row.id as string;

    await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${row.id}`;
    await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${row.id}`;
    await sql`DELETE FROM service_doctors WHERE service_id = ${row.id}`;
    await sql`DELETE FROM service_related WHERE service_id = ${row.id}`;
    await sql`DELETE FROM before_after_cases WHERE owner_key = ${`service:${row.id}`}`;

    const sectionIds: string[] = [];
    for (const [i, s] of p.sections.entries()) {
      const [sec] = await sql`
        INSERT INTO content_sections (owner_type, owner_id, section_type, data, sort_order)
        VALUES ('service', ${row.id}, ${s.type}::section_type, ${sql.json(s.data as never)}, ${i})
        RETURNING id
      `;
      sectionIds.push(`section:${sec.id}`);
    }

    for (const [i, f] of p.faq.entries()) {
      await sql`
        INSERT INTO faq_items (
          owner_type, owner_id, question_uk, question_ru, question_en,
          answer_uk, answer_ru, answer_en, sort_order
        ) VALUES (
          'service', ${row.id}, ${f.question.uk}, ${f.question.ru}, ${f.question.en},
          ${f.answer.uk}, ${f.answer.ru}, ${f.answer.en}, ${i}
        )
      `;
    }

    for (const [i, d] of surgeons.entries()) {
      await sql`
        INSERT INTO service_doctors (service_id, doctor_id, sort_order)
        VALUES (${row.id}, ${d.id}, ${i})
      `;
    }

    const ba = p.beforeAfter;
    if (ba) {
      for (let n = 1; n <= ba.count; n++) {
        await sql`
          INSERT INTO before_after_cases (
            owner_key, before_url, after_url,
            zone_uk, zone_ru, zone_en,
            sessions_uk, sessions_ru, sessions_en,
            alt_uk, alt_ru, alt_en, sort_order
          ) VALUES (
            ${`service:${row.id}`},
            ${`/images/surgery/before-after/${p.slug}-${n}-before.webp`},
            ${`/images/surgery/before-after/${p.slug}-${n}-after.webp`},
            ${ba.zone.uk}, ${ba.zone.ru}, ${ba.zone.en},
            ${ba.sessions.uk}, ${ba.sessions.ru}, ${ba.sessions.en},
            ${ba.alt.uk}, ${ba.alt.ru}, ${ba.alt.en}, ${n - 1}
          )
        `;
      }
    }

    await sql`
      UPDATE services SET block_order = ${sectionIds.concat(TAIL_BLOCKS)} WHERE id = ${row.id}
    `;
    console.log(
      `  ${p.slug.padEnd(16)} ${p.sections.length} sections, ${p.faq.length} FAQ` +
      `${ba ? `, ${ba.count} before/after` : ""}`,
    );
  }

  // Related services need every id, so they are wired after the first pass.
  // A batch may point at pages seeded by an earlier batch (the body pages link
  // back to the face hub), so unknown slugs are resolved from the database
  // rather than assumed missing.
  for (const p of content.pages) {
    for (const [i, target] of (p.related ?? []).entries()) {
      let targetId = ids[target];
      if (!targetId) {
        const [row] = await sql`
          SELECT s.id FROM services s
          JOIN service_categories c ON c.id = s.category_id
          WHERE s.slug = ${target} AND c.slug = ${content.categorySlug}
        `;
        if (!row) throw new Error(`unknown related slug "${target}" for "${p.slug}"`);
        targetId = row.id as string;
      }
      await sql`
        INSERT INTO service_related (service_id, related_service_id, sort_order)
        VALUES (${ids[p.slug]}, ${targetId}, ${i})
        ON CONFLICT DO NOTHING
      `;
    }
  }
  console.log("  related services wired");

  if (DRY) throw ROLLBACK;
}

// One transaction for the whole import: a half-seeded page — sections written
// but block_order not, or related services pointing at ids that rolled back —
// would be live on production the moment it was committed.
sql
  .begin((tx) => main(tx))
  .then(async () => {
    console.log("done");
    await sql.end();
  })
  .catch(async (e) => {
    if (e === ROLLBACK) {
      console.log("--dry: every statement ran, transaction rolled back");
      await sql.end();
      return;
    }
    console.error(e);
    await sql.end();
    process.exit(1);
  });
