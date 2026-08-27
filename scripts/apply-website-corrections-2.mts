/**
 * "Правка вебсайта 2" — the client's answer to the outstanding photo list.
 *
 * Two kinds of change:
 *   1. a thematic photo on pages that had none (and on two hubs)
 *   2. Вероніка Полуніна added to the doctors block on the six pages the
 *      document names
 *
 * Idempotent: re-running produces no further changes. Previous values are
 * dumped to scripts/backups/ before anything is written.
 *
 * NOT applied here — see the PR for the reasoning:
 *   - laser-peel: the document asks for "тематичні фото" but supplies none,
 *     and every AcuPulse shot we hold is already used on another page
 *   - plastic-surgery hub: the photo is a pin.it link (third-party image,
 *     unclear licensing)
 *   - Rejuran / Juvederm / PolyPhil / gynaecology: the supplied images are
 *     AI-generated and carry a misspelt wordmark ("GENE VITI", "GENEVITTI")
 *     on the robe and uniform
 *
 *   npx tsx scripts/apply-website-corrections-2.mts          # dry run
 *   npx tsx scripts/apply-website-corrections-2.mts --apply
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const APPLY = process.argv.includes("--apply");
const rollback: any[] = [];
let changes = 0;
const log = (m: string) => console.log(m);
const parse = (d: any) => (typeof d === "string" ? JSON.parse(d) : d);

const IMG = {
  acupulse: "/images/equipment/acupulse-co2-lumenis.webp",
  m22: "/images/equipment/m22-stellar-black-2.webp",
  ultrasound: "/images/equipment/ultrasound-logiq-2.webp",
  rfLifting: "/images/procedures/rf-lifting-face.webp",
  prpTubes: "/images/procedures/prp-tubes.webp",
  prpDraw: "/images/procedures/prp-blood-draw.webp",
} as const;

async function serviceId(cat: string, slug: string): Promise<string | null> {
  const r = await sql`SELECT s.id FROM services s JOIN service_categories c ON c.id = s.category_id
                      WHERE c.slug = ${cat} AND s.slug = ${slug}`;
  if (!r[0]) log(`  !! service not found: ${cat}/${slug}`);
  return r[0]?.id ?? null;
}

/** Sets heroImage on the page's first richText section. */
async function setHeroImage(cat: string, slug: string, url: string, focal?: string) {
  const id = await serviceId(cat, slug);
  if (!id) return;
  const secs = (await sql`SELECT id, data FROM content_sections
                          WHERE owner_type='service' AND owner_id=${id} AND section_type='richText'
                          ORDER BY sort_order LIMIT 1`) as any[];
  if (!secs[0]) return log(`  !! ${cat}/${slug}: no richText section`);
  const before = parse(secs[0].data);
  const after = { ...before, heroImage: url, ...(focal ? { heroImageFocalPoint: focal } : {}) };
  if (JSON.stringify(before) === JSON.stringify(after)) return log(`  = ${cat}/${slug} (already set)`);
  rollback.push({ table: "content_sections", id: secs[0].id, column: "data", before: secs[0].data });
  log(`  ✓ ${cat}/${slug} → ${url}`);
  changes++;
  if (APPLY) await sql`UPDATE content_sections SET data=${JSON.stringify(after)}::jsonb, updated_at=now() WHERE id=${secs[0].id}`;
}

/** Adds images to the page's gallery section (used for the PRP pair). */
async function addGalleryImages(cat: string, slug: string, images: { url: string; alt: Record<string, string>; title?: Record<string, string>; subtitle?: Record<string, string> }[]) {
  const id = await serviceId(cat, slug);
  if (!id) return;
  const sec = (await sql`SELECT id, section_type, data FROM content_sections
                         WHERE owner_type='service' AND owner_id=${id}
                           AND section_type IN ('imageGallery','showcaseGallery')
                         ORDER BY sort_order LIMIT 1`) as any[];
  if (!sec[0]) return log(`  !! ${cat}/${slug}: no gallery section`);
  const before = parse(sec[0].data);
  const existing: any[] = Array.isArray(before.images) ? before.images : [];
  const fresh = images.filter((i) => !existing.some((e) => e.url === i.url));
  if (!fresh.length) return log(`  = ${cat}/${slug} gallery (already contains photos)`);
  const shaped = fresh.map((i) => ({
    url: i.url,
    alt: i.alt,
    ...(sec[0].section_type === "showcaseGallery"
      ? { span: "1", focalPoint: "50% 50%", ...(i.title ? { title: i.title } : {}), ...(i.subtitle ? { subtitle: i.subtitle } : {}) }
      : {}),
  }));
  const after = { ...before, images: [...shaped, ...existing] };
  rollback.push({ table: "content_sections", id: sec[0].id, column: "data", before: sec[0].data });
  log(`  ✓ ${cat}/${slug} gallery += ${fresh.map((f) => f.url).join(", ")}`);
  changes++;
  if (APPLY) await sql`UPDATE content_sections SET data=${JSON.stringify(after)}::jsonb, updated_at=now() WHERE id=${sec[0].id}`;
}

async function setCategoryHero(slug: string, url: string) {
  const r = (await sql`SELECT id, hero_image FROM service_categories WHERE slug=${slug}`) as any[];
  if (!r[0]) return log(`  !! category not found: ${slug}`);
  if (r[0].hero_image === url) return log(`  = category ${slug} (already set)`);
  rollback.push({ table: "service_categories", id: r[0].id, column: "hero_image", before: r[0].hero_image });
  log(`  ✓ category ${slug} → ${url}`);
  changes++;
  if (APPLY) await sql`UPDATE service_categories SET hero_image=${url}, updated_at=now() WHERE id=${r[0].id}`;
}

async function setCategoryGallery(slug: string, items: { url: string; alt: [string, string, string] }[]) {
  const key = "category_" + slug;
  const before = (await sql`SELECT * FROM gallery_items WHERE owner_key=${key} ORDER BY sort_order`) as any[];
  const same = before.length === items.length && before.every((b, i) => b.image_url === items[i].url);
  if (same) return log(`  = gallery ${key} (already set)`);
  rollback.push({ table: "gallery_items", ownerKey: key, action: "restore", before });
  log(`  ✓ gallery ${key} → ${items.map((i) => i.url).join(", ")}`);
  changes++;
  if (!APPLY) return;
  await sql`DELETE FROM gallery_items WHERE owner_key=${key}`;
  for (const [i, it] of items.entries()) {
    await sql`INSERT INTO gallery_items (owner_key, image_url, alt_uk, alt_ru, alt_en, title_uk, title_ru, title_en, label_uk, label_ru, label_en, sort_order)
              VALUES (${key}, ${it.url}, ${it.alt[0]}, ${it.alt[1]}, ${it.alt[2]},
                      ${it.alt[0]}, ${it.alt[1]}, ${it.alt[2]}, ${it.alt[0]}, ${it.alt[1]}, ${it.alt[2]}, ${i})`;
  }
}

/** Appends a doctor to a service's doctors block, keeping the existing order. */
async function addDoctor(cat: string, slug: string, doctorSlug: string) {
  const id = await serviceId(cat, slug);
  if (!id) return;
  const doc = (await sql`SELECT id FROM doctors WHERE slug=${doctorSlug}`) as any[];
  if (!doc[0]) return log(`  !! doctor not found: ${doctorSlug}`);
  const linked = (await sql`SELECT doctor_id FROM service_doctors WHERE service_id=${id}`) as any[];
  if (linked.some((l) => l.doctor_id === doc[0].id)) return log(`  = ${cat}/${slug} + ${doctorSlug} (already linked)`);
  const next = linked.length;
  rollback.push({ table: "service_doctors", serviceId: id, doctorId: doc[0].id, action: "delete" });
  log(`  ✓ ${cat}/${slug} += ${doctorSlug}`);
  changes++;
  if (APPLY) await sql`INSERT INTO service_doctors (service_id, doctor_id, sort_order) VALUES (${id}, ${doc[0].id}, ${next})`;
}

// ── run ──────────────────────────────────────────────────────────────────────
log(APPLY ? "APPLYING to the production database\n" : "DRY RUN — no writes (pass --apply)\n");

log("── Фото апарата на сторінках, де фото не було");
await setHeroImage("apparatus-cosmetology", "laser-resurfacing-post-acne", IMG.acupulse, "50% 45%");
await setHeroImage("apparatus-cosmetology", "acne-treatment", IMG.m22, "50% 45%");
await setHeroImage("apparatus-cosmetology", "pigmentation-removal", IMG.m22, "50% 45%");
await setHeroImage("apparatus-cosmetology", "rosacea-treatment", IMG.m22, "50% 45%");
await setHeroImage("diagnostics", "ultrasound-diagnostician", IMG.ultrasound, "50% 45%");

log("\n── Фото на сторінках, які показували лише загальні фото клініки");
await setHeroImage("intimate-rejuvenation", "monopolar-rf-lifting", IMG.rfLifting);
await addGalleryImages("injectable-cosmetology", "prp-therapy", [
  {
    url: IMG.prpTubes,
    alt: { uk: "Пробірки з плазмою для PRP-терапії та центрифуга", ru: "Пробирки с плазмой для PRP-терапии и центрифуга", en: "Tubes of plasma for PRP therapy and a centrifuge" },
    title: { uk: "Підготовка плазми", ru: "Подготовка плазмы", en: "Preparing the plasma" },
    subtitle: { uk: "Кров розділяють у центрифузі перед процедурою", ru: "Кровь разделяют в центрифуге перед процедурой", en: "Blood is separated in a centrifuge before the treatment" },
  },
  {
    url: IMG.prpDraw,
    alt: { uk: "Забір крові для PRP-терапії в клініці", ru: "Забор крови для PRP-терапии в клинике", en: "Blood draw for PRP therapy at the clinic" },
    title: { uk: "Забір крові", ru: "Забор крови", en: "The blood draw" },
    subtitle: { uk: "Процедура починається зі звичайного забору крові", ru: "Процедура начинается с обычного забора крови", en: "The procedure begins with a routine blood draw" },
  },
]);
await setHeroImage("injectable-cosmetology", "prp-therapy", IMG.prpTubes);

log("\n── Розділ «Апаратна косметологія для інтимних зон»");
await setCategoryHero("intimate-rejuvenation", IMG.acupulse);
await setCategoryGallery("intimate-rejuvenation", [
  { url: IMG.acupulse, alt: ["Лазер AcuPulse CO₂ для інтимного омолодження в GENEVITY", "Лазер AcuPulse CO₂ для интимного омоложения в GENEVITY", "The AcuPulse CO₂ laser for intimate rejuvenation at GENEVITY"] },
  { url: IMG.rfLifting, alt: ["Процедура RF-ліфтингу в клініці GENEVITY", "Процедура RF-лифтинга в клинике GENEVITY", "An RF lifting treatment at the GENEVITY clinic"] },
]);

log("\n── Полуніна Вероніка у блоці «Команда лікарів»");
for (const [cat, slug] of [
  ["apparatus-cosmetology", "laser-resurfacing-post-acne"],
  ["apparatus-cosmetology", "laser-peel"],
  ["apparatus-cosmetology", "acne-treatment"],
  ["apparatus-cosmetology", "pigmentation-removal"],
  ["apparatus-cosmetology", "rosacea-treatment"],
  ["diagnostics", "ultrasound-diagnostician"],
] as [string, string][]) await addDoctor(cat, slug, "polunina-veronika");

log("\n── Медіатека");
{
  const existing = new Set(((await sql`SELECT url FROM media_assets`) as any[]).map((r) => r.url));
  for (const url of Object.values(IMG)) {
    if (existing.has(url)) continue;
    const filename = url.split("/").pop()!;
    const folder = url.split("/").slice(2, -1).join("/");
    log(`  ✓ media_assets += ${url}`);
    changes++;
    if (APPLY) {
      const ins = await sql`INSERT INTO media_assets (url, filename, folder, mime_type, source, title)
                            VALUES (${url}, ${filename}, ${folder}, 'image/webp', 'public', ${filename}) RETURNING id`;
      rollback.push({ table: "media_assets", id: ins[0].id, action: "delete" });
    }
  }
}

log(`\n${APPLY ? "Applied" : "Would apply"} ${changes} change(s).`);
if (APPLY && rollback.length) {
  if (!existsSync("scripts/backups")) mkdirSync("scripts/backups", { recursive: true });
  const f = `scripts/backups/website-corrections-2-rollback-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(f, JSON.stringify(rollback, null, 2));
  log(`Rollback data written to ${f}`);
}
