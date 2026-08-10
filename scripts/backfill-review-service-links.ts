/**
 * TZ #10 §4 — bind existing patient reviews to service pages.
 *
 * Reviews already carry a free-text `procedure_tag`. Most of those tags are
 * verbatim service titles, so they can be matched automatically; the rest are
 * either narrower than a service ("Кольпоскопія" → Гінекологія) or worded
 * differently ("Ботокс" → Ботулінотерапія), so they're mapped by hand below.
 *
 * Tags with no matching service (Подологія, Гастроентерологія, масажі, …) are
 * left unbound — those reviews keep showing on the doctor's page only.
 *
 * Only fills empty `service_id` values, so an admin's manual choice in
 * /admin/reviews is never overwritten. Safe to re-run.
 *
 * Run: npx tsx scripts/backfill-review-service-links.ts [--dry]
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
const DRY = process.argv.includes("--dry");

/** procedure_tag → service slug, for tags that aren't a literal service title. */
const ALIASES: Record<string, string> = {
  "Ботокс": "botulinum-therapy",
  "Контурна пластика губ": "lip-augmentation",
  "AcuPulse CO₂": "acupulse-co2",
  "Лазерне омолодження CO₂": "laser-rejuvenation",
  "Лазерне шліфування рубця": "laser-resurfacing",
  "Кольпоскопія": "gynaecology",
  "Гінекологічний огляд": "gynaecology",
  "Дитяча гінекологія": "gynaecology",
  "Порушення менструального циклу": "gynaecology",
  "УЗД молочних залоз": "ultrasound",
  "Консультація та УЗД": "ultrasound",
  "Гормональні порушення": "endocrinologist",
  "Метаболічні порушення": "endocrinologist",
  "Цукровий діабет": "endocrinologist",
  "Захворювання щитоподібної залози": "endocrinologist",
  "Блефаропластика": "plastic-surgery",
  "Пластика живота": "plastic-surgery",
  "Пластика грудей": "plastic-surgery",
  "Ендоскопічна підтяжка обличчя": "plastic-surgery",
};

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

async function main() {
  const services = await sql`SELECT id, slug, title_uk, title_ru, title_en FROM services`;

  // Exact title match in any locale.
  const byTitle = new Map<string, string>();
  const bySlug = new Map<string, string>();
  for (const s of services) {
    bySlug.set(s.slug as string, s.id as string);
    for (const f of ["title_uk", "title_ru", "title_en"] as const) {
      const t = s[f] as string | null;
      if (t) byTitle.set(norm(t), s.id as string);
    }
  }

  const reviews = await sql`
    SELECT id, procedure_tag, procedure_tag_ru, procedure_tag_en
    FROM doctor_reviews
    WHERE service_id IS NULL
  `;

  let linked = 0;
  const unmatched = new Map<string, number>();

  for (const r of reviews) {
    const tags = [r.procedure_tag, r.procedure_tag_ru, r.procedure_tag_en]
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0);
    if (!tags.length) continue;

    let serviceId: string | undefined;
    for (const tag of tags) {
      const aliasSlug = ALIASES[tag.trim()];
      serviceId = (aliasSlug && bySlug.get(aliasSlug)) || byTitle.get(norm(tag));
      if (serviceId) break;
    }

    if (!serviceId) {
      const key = tags[0].trim();
      unmatched.set(key, (unmatched.get(key) ?? 0) + 1);
      continue;
    }

    if (!DRY) {
      await sql`UPDATE doctor_reviews SET service_id = ${serviceId} WHERE id = ${r.id}`;
    }
    linked += 1;
  }

  console.log(`${DRY ? "[dry] would link" : "✓ linked"} ${linked}/${reviews.length} unbound reviews`);
  if (unmatched.size) {
    console.log("\nNo matching service (left unbound — tag them manually if needed):");
    for (const [tag, n] of [...unmatched].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${n}×  ${tag}`);
    }
  }

  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
