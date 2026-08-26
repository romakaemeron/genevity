/**
 * GENEVITY_website_corrections.docx — corrections #1–#21.
 *
 * Applies the client's visual-audit corrections to the CMS content:
 *  - real GENEVITY photos (clinic rooms + equipment) extracted from the .docx
 *  - client-supplied photos from website_correction_images/
 *  - Unsplash photos the document linked to
 *
 * Idempotent: re-running produces no further changes. Every write is recorded
 * in scripts/backups/website-corrections-rollback.json before it is applied.
 *
 *   npx tsx scripts/apply-website-corrections.mts          # dry run (default)
 *   npx tsx scripts/apply-website-corrections.mts --apply  # write to the DB
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => {
  const m = l.match(/^([^#=\s]+)=(.+)/);
  if (m) process.env[m[1].trim()] = m[2].trim();
});

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const APPLY = process.argv.includes("--apply");
const rollback: any[] = [];
let changes = 0;

const log = (msg: string) => console.log(msg);
const parse = (d: any) => (typeof d === "string" ? JSON.parse(d) : d);

/** Public-path images added for these corrections. */
const IMG = {
  hallApparatus: "/images/interior/hall-apparatus-cosmetology.webp",
  consultationRoom: "/images/interior/consultation-room.webp",
  doctorOffice: "/images/interior/doctor-office.webp",
  emfaceRoom: "/images/interior/emface-room.webp",
  treatmentRoom: "/images/interior/treatment-room-classic.webp",

  splendorX: "/images/equipment/splendor-x.webp",
  emsculptHandpieces: "/images/equipment/emsculpt-neo-handpieces.webp",
  emsculptScreen: "/images/equipment/emsculpt-neo-screen.webp",
  ultraformerHandpieces: "/images/equipment/ultraformer-handpieces.webp",
  ultraformerMptHandpieces: "/images/equipment/ultraformer-mpt-handpieces.webp",
  ultraformerMpt: "/images/equipment/ultraformer-mpt.webp",
  exionUnit: "/images/equipment/exion-unit.webp",
  exionBody: "/images/equipment/exion-body.webp",
  exionFace: "/images/equipment/exion-face.webp",
  emfacePair: "/images/equipment/emface-emsculpt-pair.webp",
  emfaceConsole: "/images/equipment/emface-console.webp",
  volnewmer: "/images/equipment/volnewmer-unit.webp",
  hydrafacial: "/images/equipment/hydrafacial-unit.webp",
  acupulse: "/images/equipment/acupulse-co2.webp",
  acupulseIntimate: "/images/equipment/acupulse-co2-intimate.webp",
  m22: "/images/equipment/m22-stellar-black.webp",
  inbody: "/images/equipment/inbody-770.webp",
  ultrasound: "/images/equipment/ultrasound-logiq.webp",

  laserLegs: "/images/procedures/laser-hair-removal-legs.webp",
  laserMen: "/images/procedures/laser-hair-removal-men.webp",
  laserBikini: "/images/procedures/laser-hair-removal-bikini.webp",
  laserLegsProcedure: "/images/procedures/laser-hair-removal-legs-procedure.webp",
  cosmetologistInjection: "/images/procedures/cosmetologist-injection.webp",
  noseContouring: "/images/procedures/nose-contouring.webp",
  jawContouring: "/images/procedures/jaw-contouring.webp",
  biorevitalisation: "/images/procedures/biorevitalisation.webp",
  mesotherapy: "/images/procedures/mesotherapy.webp",
  exosomes: "/images/procedures/exosomes.webp",
  stemCell: "/images/procedures/stem-cell-therapy.webp",
  lipAugmentation: "/images/procedures/lip-augmentation.webp",
  hairMesotherapy: "/images/procedures/hair-mesotherapy.webp",
  podology: "/images/procedures/podology.webp",
  skincareFacial: "/images/procedures/skincare-facial-mask.webp",
  skincareEye: "/images/procedures/skincare-eye-treatment.webp",
  injectableHero: "/images/procedures/injectable-cosmetology.webp",
  plasticSurgery: "/images/procedures/plastic-surgery-consult.webp",
  longevityAntiAge: "/images/procedures/longevity-anti-age.webp",
  longevityProgram: "/images/procedures/longevity-program.webp",
  checkUp40: "/images/procedures/check-up-40.webp",
  hormonalBalance: "/images/procedures/hormonal-balance.webp",
  ivTherapy: "/images/procedures/iv-therapy.webp",
  nutraceuticals: "/images/procedures/nutraceuticals.webp",
  exosomeIvDrip: "/images/procedures/exosome-iv-drip.webp",
} as const;

// ── low-level helpers ────────────────────────────────────────────────────────

async function serviceId(cat: string, slug: string): Promise<string | null> {
  const r = await sql`SELECT s.id FROM services s JOIN service_categories c ON s.category_id = c.id
                      WHERE c.slug = ${cat} AND s.slug = ${slug}`;
  if (!r[0]) log(`  !! service not found: ${cat}/${slug}`);
  return r[0]?.id ?? null;
}

async function sections(ownerType: string, ownerId: string) {
  return (await sql`SELECT id, sort_order, section_type, data FROM content_sections
                    WHERE owner_type = ${ownerType} AND owner_id = ${ownerId} ORDER BY sort_order`) as any[];
}

async function writeSection(id: string, before: any, after: any, label: string) {
  if (JSON.stringify(before) === JSON.stringify(after)) {
    log(`  = ${label} (already set)`);
    return;
  }
  rollback.push({ table: "content_sections", id, column: "data", before });
  log(`  ✓ ${label}`);
  changes++;
  if (APPLY) await sql`UPDATE content_sections SET data = ${JSON.stringify(after)}::jsonb, updated_at = now() WHERE id = ${id}`;
}

/** Sets `heroImage` on a service's Nth richText section (default: the first). */
async function setHeroImage(
  cat: string,
  slug: string,
  url: string,
  opts: { focal?: string; matchHeading?: string; nth?: number } = {},
) {
  const id = await serviceId(cat, slug);
  if (!id) return;
  const secs = (await sections("service", id)).filter((s) => s.section_type === "richText");
  let target = secs[opts.nth ?? 0];
  if (opts.matchHeading) {
    const needle = opts.matchHeading.toLowerCase();
    target = secs.find((s) => {
      const h = parse(s.data).heading;
      const text = typeof h === "object" && h ? String(h.uk ?? "") : String(h ?? "");
      return text.toLowerCase().includes(needle);
    })!;
    if (!target) return log(`  !! ${cat}/${slug}: no richText matching "${opts.matchHeading}"`);
  }
  if (!target) return log(`  !! ${cat}/${slug}: no richText section`);
  const before = parse(target.data);
  const after = { ...before, heroImage: url, ...(opts.focal ? { heroImageFocalPoint: opts.focal } : {}) };
  await writeSection(target.id, before, after, `${cat}/${slug} → ${url}`);
}

/** Adds image URLs to a service's gallery section (imageGallery/showcaseGallery). */
async function addGalleryImages(
  cat: string,
  slug: string,
  images: { url: string; alt?: Record<string, string>; title?: Record<string, string>; subtitle?: Record<string, string> }[],
  position: "start" | "end" = "start",
) {
  const id = await serviceId(cat, slug);
  if (!id) return;
  const sec = (await sections("service", id)).find((s) =>
    s.section_type === "imageGallery" || s.section_type === "showcaseGallery");
  if (!sec) return log(`  !! ${cat}/${slug}: no gallery section`);
  const before = parse(sec.data);
  const existing: any[] = Array.isArray(before.images) ? before.images : [];
  const fresh = images.filter((i) => !existing.some((e) => e.url === i.url));
  if (!fresh.length) return log(`  = ${cat}/${slug} gallery (already contains photos)`);
  const shaped = fresh.map((i) => ({
    url: i.url,
    ...(i.alt ? { alt: i.alt } : {}),
    ...(sec.section_type === "showcaseGallery"
      ? { span: "1", focalPoint: "50% 50%", ...(i.title ? { title: i.title } : {}), ...(i.subtitle ? { subtitle: i.subtitle } : {}) }
      : {}),
  }));
  const after = { ...before, images: position === "start" ? [...shaped, ...existing] : [...existing, ...shaped] };
  await writeSection(sec.id, before, after, `${cat}/${slug} gallery += ${fresh.map((f) => f.url).join(", ")}`);
}

/** Copies the "Атмосфера клініки" showcase gallery from a donor page onto a page that lacks one. */
async function cloneClinicGallery(fromCat: string, fromSlug: string, toCat: string, toSlug: string) {
  const src = await serviceId(fromCat, fromSlug);
  const dst = await serviceId(toCat, toSlug);
  if (!src || !dst) return;
  const donor = (await sections("service", src)).find((s) => s.section_type === "showcaseGallery");
  if (!donor) return log(`  !! donor gallery missing on ${fromCat}/${fromSlug}`);
  const existing = (await sections("service", dst)).find((s) => s.section_type === "showcaseGallery");
  if (existing) return log(`  = ${toCat}/${toSlug} already has a clinic gallery`);
  const data = parse(donor.data);
  const maxSort = Math.max(0, ...(await sections("service", dst)).map((s) => s.sort_order));
  log(`  ✓ ${toCat}/${toSlug} += "Атмосфера клініки" gallery`);
  changes++;
  if (APPLY) {
    const ins = await sql`INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
                          VALUES ('service', ${dst}, ${maxSort + 1}, 'showcaseGallery', ${JSON.stringify(data)}::jsonb)
                          RETURNING id`;
    const newId = ins[0].id as string;
    rollback.push({ table: "content_sections", id: newId, action: "delete" });
    // place it just before the fixed blocks in block_order
    const svc = await sql`SELECT block_order FROM services WHERE id = ${dst}`;
    const order: string[] | null = svc[0].block_order;
    if (order?.length) {
      rollback.push({ table: "services", id: dst, column: "block_order", before: order });
      const firstFixed = order.findIndex((k) => !k.startsWith("section:"));
      const next = [...order];
      next.splice(firstFixed === -1 ? next.length : firstFixed, 0, `section:${newId}`);
      await sql`UPDATE services SET block_order = ${next as any}, updated_at = now() WHERE id = ${dst}`;
    }
  }
}

async function setCategoryHero(slug: string, url: string) {
  const r = await sql`SELECT id, hero_image FROM service_categories WHERE slug = ${slug}`;
  if (!r[0]) return log(`  !! category not found: ${slug}`);
  if (r[0].hero_image === url) return log(`  = category ${slug} hero (already set)`);
  rollback.push({ table: "service_categories", id: r[0].id, column: "hero_image", before: r[0].hero_image });
  log(`  ✓ category ${slug} hero → ${url}`);
  changes++;
  if (APPLY) await sql`UPDATE service_categories SET hero_image = ${url}, updated_at = now() WHERE id = ${r[0].id}`;
}

/** Replaces a gallery_items collection wholesale (used for category hubs). */
async function setGalleryItems(
  ownerKey: string,
  items: { url: string; alt: [string, string, string]; title?: [string, string, string] }[],
) {
  const before = (await sql`SELECT * FROM gallery_items WHERE owner_key = ${ownerKey} ORDER BY sort_order`) as any[];
  const same = before.length === items.length && before.every((b, i) => b.image_url === items[i].url);
  if (same) return log(`  = gallery ${ownerKey} (already set)`);
  rollback.push({ table: "gallery_items", ownerKey, action: "restore", before });
  log(`  ✓ gallery ${ownerKey} → ${items.map((i) => i.url).join(", ")}`);
  changes++;
  if (!APPLY) return;
  await sql`DELETE FROM gallery_items WHERE owner_key = ${ownerKey}`;
  for (const [i, it] of items.entries()) {
    await sql`INSERT INTO gallery_items (owner_key, image_url, alt_uk, alt_ru, alt_en, title_uk, title_ru, title_en, label_uk, label_ru, label_en, sort_order)
              VALUES (${ownerKey}, ${it.url}, ${it.alt[0]}, ${it.alt[1]}, ${it.alt[2]},
                      ${it.title?.[0] ?? it.alt[0]}, ${it.title?.[1] ?? it.alt[1]}, ${it.title?.[2] ?? it.alt[2]},
                      ${it.title?.[0] ?? it.alt[0]}, ${it.title?.[1] ?? it.alt[1]}, ${it.title?.[2] ?? it.alt[2]}, ${i})`;
  }
}

/** Swaps the image of a single existing gallery_items row (keeps its labels). */
async function setGalleryItemImage(ownerKey: string, sortOrder: number, url: string, alt?: [string, string, string]) {
  const r = await sql`SELECT id, image_url FROM gallery_items WHERE owner_key = ${ownerKey} AND sort_order = ${sortOrder}`;
  if (!r[0]) return log(`  !! gallery item not found: ${ownerKey}#${sortOrder}`);
  if (r[0].image_url === url) return log(`  = ${ownerKey}#${sortOrder} (already set)`);
  rollback.push({ table: "gallery_items", id: r[0].id, column: "image_url", before: r[0].image_url });
  log(`  ✓ ${ownerKey}#${sortOrder} → ${url}`);
  changes++;
  if (APPLY) {
    await sql`UPDATE gallery_items SET image_url = ${url}, updated_at = now() WHERE id = ${r[0].id}`;
    if (alt) await sql`UPDATE gallery_items SET alt_uk = ${alt[0]}, alt_ru = ${alt[1]}, alt_en = ${alt[2]} WHERE id = ${r[0].id}`;
  }
}

async function setStaticPageHero(slug: string, url: string) {
  const r = await sql`SELECT id, hero_image FROM static_pages WHERE slug = ${slug}`;
  if (!r[0]) return log(`  !! static page not found: ${slug}`);
  if (r[0].hero_image === url) return log(`  = page ${slug} hero (already set)`);
  rollback.push({ table: "static_pages", id: r[0].id, column: "hero_image", before: r[0].hero_image });
  log(`  ✓ page ${slug} hero → ${url}`);
  changes++;
  if (APPLY) await sql`UPDATE static_pages SET hero_image = ${url}, updated_at = now() WHERE id = ${r[0].id}`;
}

// ── corrections ──────────────────────────────────────────────────────────────

async function pravka1_about() {
  log("\n── Правка №1 — /about: real clinic rooms + thematic hero");
  await setGalleryItemImage("about", 0, IMG.hallApparatus,
    ["Зал апаратної косметології GENEVITY з лазером Splendor X та процедурним кріслом",
     "Зал аппаратной косметологии GENEVITY с лазером Splendor X и процедурным креслом",
     "GENEVITY apparatus cosmetology room with the Splendor X laser and treatment chair"]);
  await setGalleryItemImage("about", 1, IMG.consultationRoom,
    ["Кабінет консультацій GENEVITY з кушеткою та робочим місцем лікаря",
     "Кабинет консультаций GENEVITY с кушеткой и рабочим местом врача",
     "GENEVITY consultation room with a couch and the doctor's workstation"]);
  await setGalleryItemImage("about", 2, IMG.doctorOffice,
    ["Кабінет лікаря GENEVITY з косметологічним обладнанням та кушеткою",
     "Кабинет врача GENEVITY с косметологическим оборудованием и кушеткой",
     "GENEVITY doctor's office with cosmetology equipment and a treatment couch"]);
  await setStaticPageHero("about", IMG.skincareEye);
}

async function pravka2_splendorX() {
  log("\n── Правка №2 — Splendor X: apparatus photo");
  await setHeroImage("apparatus-cosmetology", "splendor-x", IMG.splendorX, { focal: "50% 62%" });
  await addGalleryImages("apparatus-cosmetology", "splendor-x", [{
    url: IMG.splendorX,
    alt: { uk: "Лазер Splendor X у клініці GENEVITY", ru: "Лазер Splendor X в клинике GENEVITY", en: "Splendor X laser at the GENEVITY clinic" },
  }]);
}

async function pravka4_apparatusHub() {
  log("\n── Правка №4 — категорія «Апаратна косметологія»: кабінети та обладнання");
  await setCategoryHero("apparatus-cosmetology", IMG.hallApparatus);
  await setGalleryItems("category_apparatus-cosmetology", [
    { url: IMG.hallApparatus, alt: ["Зал апаратної косметології GENEVITY", "Зал аппаратной косметологии GENEVITY", "GENEVITY apparatus cosmetology room"] },
    { url: IMG.emfaceRoom, alt: ["Кабінет апаратної косметології GENEVITY з апаратом EMFACE", "Кабинет аппаратной косметологии GENEVITY с аппаратом EMFACE", "GENEVITY apparatus cosmetology room with the EMFACE device"] },
    { url: IMG.emfacePair, alt: ["Апарати EMFACE та EMSCULPT NEO в GENEVITY", "Аппараты EMFACE и EMSCULPT NEO в GENEVITY", "EMFACE and EMSCULPT NEO devices at GENEVITY"] },
    { url: IMG.exionUnit, alt: ["Апарат EXION у клініці GENEVITY", "Аппарат EXION в клинике GENEVITY", "EXION device at the GENEVITY clinic"] },
    { url: IMG.m22, alt: ["Лазерна платформа Lumenis M22 Stellar Black у GENEVITY", "Лазерная платформа Lumenis M22 Stellar Black в GENEVITY", "Lumenis M22 Stellar Black laser platform at GENEVITY"] },
  ]);
}

async function pravka5_injectableHub() {
  log("\n── Правка №5 — категорія «Ін'єкційна косметологія»");
  await setCategoryHero("injectable-cosmetology", IMG.injectableHero);
  await setGalleryItems("category_injectable-cosmetology", [
    { url: IMG.cosmetologistInjection, alt: ["Ін'єкційна процедура в клініці GENEVITY", "Инъекционная процедура в клинике GENEVITY", "Injectable treatment at the GENEVITY clinic"] },
    { url: IMG.injectableHero, alt: ["Ін'єкційна косметологія обличчя", "Инъекционная косметология лица", "Facial injectable cosmetology"] },
    { url: IMG.consultationRoom, alt: ["Кабінет консультацій GENEVITY", "Кабинет консультаций GENEVITY", "GENEVITY consultation room"] },
  ]);
}

async function pravka6_laserHub() {
  log("\n── Правка №6 — категорія «Лазерна епіляція»");
  await setCategoryHero("laser-hair-removal", IMG.laserLegs);
  await setGalleryItems("category_laser-hair-removal", [
    { url: IMG.laserLegs, alt: ["Процедура лазерної епіляції в клініці GENEVITY", "Процедура лазерной эпиляции в клинике GENEVITY", "Laser hair removal session at the GENEVITY clinic"] },
    { url: IMG.splendorX, alt: ["Лазер Splendor X для епіляції в GENEVITY", "Лазер Splendor X для эпиляции в GENEVITY", "Splendor X hair-removal laser at GENEVITY"] },
    { url: IMG.hallApparatus, alt: ["Зал апаратної косметології GENEVITY", "Зал аппаратной косметологии GENEVITY", "GENEVITY apparatus cosmetology room"] },
  ]);
}

async function pravka7_podology() {
  log("\n── Правка №7 — категорія «Подологія»: одне тематичне фото");
  await setCategoryHero("podology", IMG.podology);
  await setGalleryItems("category_podology", [
    { url: IMG.podology, alt: ["Подологічний огляд стопи", "Подологический осмотр стопы", "Podiatric examination of the foot"] },
  ]);
}

async function pravka8_injectablePages() {
  log("\n── Правка №8 — тематичні фото на сторінках ін'єкційної косметології");
  await setHeroImage("injectable-cosmetology", "biorevitalisation", IMG.biorevitalisation);
  await setHeroImage("injectable-cosmetology", "mesotherapy", IMG.mesotherapy);
  await setHeroImage("injectable-cosmetology", "exosomes", IMG.exosomes, { focal: "50% 40%" });
  await setHeroImage("injectable-cosmetology", "stem-cell-therapy", IMG.stemCell);
  await setHeroImage("injectable-cosmetology", "lip-augmentation", IMG.lipAugmentation);
  await setHeroImage("injectable-cosmetology", "jaw-contouring", IMG.jawContouring);
  await setHeroImage("injectable-cosmetology", "nose-contouring", IMG.noseContouring);
  await setHeroImage("injectable-cosmetology", "hair-mesotherapy", IMG.hairMesotherapy);
}

async function pravka10and20_apparatusPages() {
  log("\n── Правка №10 / №20 — фото апарата на кожній сторінці апаратної косметології");
  const focal = { focal: "50% 45%" };
  await setHeroImage("apparatus-cosmetology", "emface", IMG.emfaceConsole, focal);
  await setHeroImage("apparatus-cosmetology", "ultraformer-mpt", IMG.ultraformerMpt, focal);
  await setHeroImage("apparatus-cosmetology", "ultraformer-mpt-body", IMG.ultraformerHandpieces, focal);
  await setHeroImage("apparatus-cosmetology", "exion-face", IMG.exionFace, focal);
  await setHeroImage("apparatus-cosmetology", "exion-body", IMG.exionBody, focal);
  await setHeroImage("apparatus-cosmetology", "volnewmer", IMG.volnewmer, focal);
  await setHeroImage("apparatus-cosmetology", "emsculpt-neo", IMG.emsculptHandpieces, focal);
  await setHeroImage("apparatus-cosmetology", "hydrafacial", IMG.hydrafacial, focal);
  await setHeroImage("apparatus-cosmetology", "acupulse-co2", IMG.acupulse, focal);
  await setHeroImage("apparatus-cosmetology", "photorejuvenation", IMG.m22, focal);
  // Volnewmer's gallery had no photo of its own device.
  await addGalleryImages("apparatus-cosmetology", "volnewmer", [{
    url: IMG.volnewmer,
    alt: { uk: "Апарат Volnewmer у клініці GENEVITY", ru: "Аппарат Volnewmer в клинике GENEVITY", en: "Volnewmer device at the GENEVITY clinic" },
  }]);
}

async function pravka13_plasticSurgeon() {
  log("\n── Правка №13 — «Пластичний хірург»: фото + команда лікарів");
  await setHeroImage("diagnostics", "plastic-surgeon", IMG.plasticSurgery);
  const id = await serviceId("diagnostics", "plastic-surgeon");
  if (!id) return;
  const docs = await sql`SELECT id, slug FROM doctors WHERE slug IN ('detsyk-dmytro', 'harmash-serhii')`;
  const linked = await sql`SELECT doctor_id FROM service_doctors WHERE service_id = ${id}`;
  const have = new Set(linked.map((r: any) => r.doctor_id));
  for (const [i, d] of (docs as any[]).entries()) {
    if (have.has(d.id)) { log(`  = ${d.slug} already linked`); continue; }
    log(`  ✓ plastic-surgeon += ${d.slug}`);
    changes++;
    rollback.push({ table: "service_doctors", serviceId: id, doctorId: d.id, action: "delete" });
    if (APPLY) await sql`INSERT INTO service_doctors (service_id, doctor_id, sort_order) VALUES (${id}, ${d.id}, ${i})`;
  }
}

async function pravka14_skincare() {
  log("\n── Правка №14 — категорія «Доглядові процедури»: одне тематичне фото");
  await setCategoryHero("skincare", IMG.skincareFacial);
  await setGalleryItems("category_skincare", [
    { url: IMG.skincareFacial, alt: ["Доглядова процедура для обличчя", "Уходовая процедура для лица", "Facial care treatment"] },
  ]);
}

async function pravka15_laboratory() {
  log("\n── Правка №15 — /laboratory: фото у каруселі мають відповідати підписам");
  await setGalleryItemImage("laboratory", 0, IMG.ultrasound,
    ["Кабінет УЗД-діагностики GENEVITY з апаратом GE LOGIQ", "Кабинет УЗИ-диагностики GENEVITY с аппаратом GE LOGIQ", "GENEVITY ultrasound room with the GE LOGIQ scanner"]);
  await setGalleryItemImage("laboratory", 2, IMG.consultationRoom,
    ["Консультаційний кабінет GENEVITY", "Консультационный кабинет GENEVITY", "GENEVITY consultation room"]);
  // Slide 3 is titled "Zemits VeraFace" — point it at the actual VeraFace skin
  // scanner (stored under a legacy filename) instead of a generic interior.
  await setGalleryItemImage("laboratory", 3, "/images/equipment/Zemits CryoCool.webp",
    ["Апарат Zemits VeraFace для діагностики шкіри в GENEVITY", "Аппарат Zemits VeraFace для диагностики кожи в GENEVITY", "Zemits VeraFace skin diagnostic scanner at GENEVITY"]);
  await setGalleryItemImage("laboratory", 4, IMG.emfacePair,
    ["Обладнання центру GENEVITY - апарати EMFACE та EMSCULPT NEO", "Оборудование центра GENEVITY - аппараты EMFACE и EMSCULPT NEO", "GENEVITY equipment - EMFACE and EMSCULPT NEO devices"]);
}

async function pravka17_bodyPage() {
  log("\n── Правка №17 — «Апаратна косметологія для тіла»: фото апаратів у блоках");
  await setHeroImage("apparatus-cosmetology", "body", IMG.emsculptScreen, { matchHeading: "EMSCULPT", focal: "50% 45%" });
  await setHeroImage("apparatus-cosmetology", "body", IMG.ultraformerMptHandpieces, { matchHeading: "Ultraformer", focal: "50% 45%" });
  await setHeroImage("apparatus-cosmetology", "body", IMG.exionUnit, { matchHeading: "Exion", focal: "50% 45%" });
}

async function pravka18_longevityHub() {
  log("\n── Правка №18 — категорія «Longevity & Anti-Age»: одне тематичне фото");
  await setCategoryHero("longevity", IMG.longevityAntiAge);
  await setGalleryItems("category_longevity", [
    { url: IMG.longevityAntiAge, alt: ["Longevity та anti-age програми GENEVITY", "Longevity и anti-age программы GENEVITY", "GENEVITY longevity and anti-age programmes"] },
  ]);
}

async function pravka19_diagnosticsHub() {
  log("\n── Правка №19 — категорія «Діагностика»: одне тематичне фото");
  await setCategoryHero("diagnostics", IMG.ultrasound);
  await setGalleryItems("category_diagnostics", [
    { url: IMG.ultrasound, alt: ["УЗД-апарат GE LOGIQ у клініці GENEVITY", "УЗИ-аппарат GE LOGIQ в клинике GENEVITY", "GE LOGIQ ultrasound scanner at the GENEVITY clinic"] },
  ]);
}

async function pravka21_remainingPages() {
  log("\n── Правка №21 — фото на решті сторінок");
  await setHeroImage("intimate-rejuvenation", "acupulse-co2-intimate", IMG.acupulseIntimate, { focal: "50% 45%" });

  await setHeroImage("laser-hair-removal", "laser-men", IMG.laserMen);
  await setHeroImage("laser-hair-removal", "laser-women", IMG.laserLegs);
  await addGalleryImages("laser-hair-removal", "laser-women", [{
    url: IMG.splendorX,
    alt: { uk: "Лазер Splendor X для епіляції в GENEVITY", ru: "Лазер Splendor X для эпиляции в GENEVITY", en: "Splendor X hair-removal laser at GENEVITY" },
    title: { uk: "Splendor X", ru: "Splendor X", en: "Splendor X" },
    subtitle: { uk: "Лазер для епіляції всіх фототипів", ru: "Лазер для эпиляции всех фототипов", en: "Hair-removal laser for every skin type" },
  }], "end");

  await setHeroImage("laser-hair-removal", "laser-bikini", IMG.laserBikini, { focal: "50% 40%" });
  await cloneClinicGallery("laser-hair-removal", "laser-women", "laser-hair-removal", "laser-bikini");
  await setHeroImage("laser-hair-removal", "laser-legs", IMG.laserLegsProcedure, { focal: "50% 45%" });
  await cloneClinicGallery("laser-hair-removal", "laser-women", "laser-hair-removal", "laser-legs");

  await setHeroImage("longevity", "check-up-40", IMG.checkUp40);
  await setHeroImage("longevity", "longevity-program", IMG.longevityProgram);
  await setHeroImage("longevity", "hormonal-balance", IMG.hormonalBalance);
  await setHeroImage("longevity", "iv-therapy", IMG.ivTherapy);
  await setHeroImage("longevity", "nutraceuticals", IMG.nutraceuticals);
  await setHeroImage("longevity", "exosome-iv-drip", IMG.exosomeIvDrip);

  await setHeroImage("diagnostics", "bioimpedance", IMG.inbody, { focal: "50% 45%" });
  await setHeroImage("diagnostics", "ultrasound", IMG.ultrasound, { focal: "50% 45%" });
  await setHeroImage("diagnostics", "cosmetologist", IMG.cosmetologistInjection, { focal: "50% 35%" });
}

async function pravka11_ivTherapyNaming() {
  log("\n── Правка №11 — уніфікація назви «IV-терапія»");
  const id = await serviceId("longevity", "iv-therapy");
  if (!id) return;

  const fix = (s: string) =>
    s
      .replace(/\bIV[  ]терапі/g, "IV-терапі")
      .replace(/\bIV[  ]терапи/g, "IV-терапи")
      .replace(/\bАйві[  ]терапі/g, "IV-терапі");

  const walk = (v: any): any => {
    if (typeof v === "string") return fix(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };

  for (const sec of await sections("service", id)) {
    const before = parse(sec.data);
    const after = walk(before);
    await writeSection(sec.id, before, after, `iv-therapy section ${sec.section_type} — «IV-терапія»`);
  }

  const cols = ["title_uk", "title_ru", "title_en", "h1_uk", "h1_ru", "h1_en", "summary_uk", "summary_ru", "summary_en",
    "seo_title_uk", "seo_title_ru", "seo_title_en", "seo_desc_uk", "seo_desc_ru", "seo_desc_en"];
  const row = (await sql`SELECT * FROM services WHERE id = ${id}`)[0] as any;
  for (const c of cols) {
    const before = row[c];
    if (typeof before !== "string") continue;
    const after = fix(before);
    if (after === before) continue;
    rollback.push({ table: "services", id, column: c, before });
    log(`  ✓ services.${c} — «IV-терапія»`);
    changes++;
    if (APPLY) await sql.query(`UPDATE services SET ${c} = $1, updated_at = now() WHERE id = $2`, [after, id]);
  }

  for (const t of ["faq_items"]) {
    const rows = (await sql`SELECT * FROM faq_items WHERE owner_type = 'service' AND owner_id = ${id}`) as any[];
    for (const r of rows) {
      for (const c of ["question_uk", "question_ru", "question_en", "answer_uk", "answer_ru", "answer_en"]) {
        if (typeof r[c] !== "string") continue;
        const after = fix(r[c]);
        if (after === r[c]) continue;
        rollback.push({ table: t, id: r.id, column: c, before: r[c] });
        log(`  ✓ faq_items.${c} — «IV-терапія»`);
        changes++;
        if (APPLY) await sql.query(`UPDATE faq_items SET ${c} = $1 WHERE id = $2`, [after, r.id]);
      }
    }
  }
}

async function pravka12_blockOrder() {
  log("\n── Правка №12 — опис послуги перед додатковими блоками (block_order)");
  const svcs = (await sql`SELECT s.id, s.slug, c.slug AS cat, s.block_order FROM services s
                          JOIN service_categories c ON c.id = s.category_id
                          WHERE s.block_order IS NOT NULL`) as any[];
  for (const s of svcs) {
    const order: string[] = s.block_order;
    const ids = new Set((await sections("service", s.id)).map((x) => x.id));
    // Legacy rows stored bare section UUIDs; the template only understands
    // "section:<id>", so it dropped them and rendered FAQ/doctors first.
    const needsFix = order.some((k) => ids.has(k));
    if (!needsFix) continue;
    const next = order.map((k) => (ids.has(k) ? `section:${k}` : k));
    rollback.push({ table: "services", id: s.id, column: "block_order", before: order });
    log(`  ✓ ${s.cat}/${s.slug}: normalised ${order.filter((k) => ids.has(k)).length} section key(s)`);
    changes++;
    if (APPLY) await sql`UPDATE services SET block_order = ${next as any}, updated_at = now() WHERE id = ${s.id}`;
  }
}

/** Правка №16 — сторінка «Апаратна косметологія для обличчя» як зразок: у блоці,
 *  що описує конкретний апарат, має стояти фото цього апарата. Сторінка «Корекція
 *  шкіри» побудована так само (три блоки — три апарати), але фото не мала. Як і на
 *  сторінці /face, тут використовується те саме фото апарата, що й на його сторінці. */
async function pravka16_skinPage() {
  log("\n── Правка №16 — «Корекція шкіри»: фото апарата у кожному блоці");
  const focal = { focal: "50% 45%" };
  await setHeroImage("apparatus-cosmetology", "skin", IMG.hydrafacial, { matchHeading: "Hydrafacial", ...focal });
  await setHeroImage("apparatus-cosmetology", "skin", IMG.acupulse, { matchHeading: "AcuPulse", ...focal });
  await setHeroImage("apparatus-cosmetology", "skin", IMG.m22, { matchHeading: "M22", ...focal });
}

/** Загальна перевірка фото (доповнення до правки №15): сторінки, де фото були
 *  відсутні, а зміст сторінки однозначно вказує на конкретний апарат/кабінет.
 *  Решта сторінок без фото перелічена у звіті — для них потрібні фото клієнта. */
async function generalPhotoSweep() {
  log("\n── Загальна перевірка — фото на сторінках, де їх бракувало");
  await setHeroImage("apparatus-cosmetology", "laser-rejuvenation", "/images/equipment/acupulse2.webp", { focal: "50% 45%" });
  await setHeroImage("apparatus-cosmetology", "laser-resurfacing", "/images/hero/AcuPulse.webp");
  await setHeroImage("apparatus-cosmetology", "couperose-treatment", "/images/equipment/Lumenis M22.webp", { focal: "50% 45%" });
  await setHeroImage("diagnostics", "endocrinologist", "/images/interior/doctor-office.webp");
}

// ── media library registration ───────────────────────────────────────────────

async function registerMedia() {
  log("\n── Медіатека: реєстрація нових файлів");
  const urls = Object.values(IMG);
  const existing = new Set(((await sql`SELECT url FROM media_assets`) as any[]).map((r) => r.url));
  for (const url of urls) {
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

// ── run ──────────────────────────────────────────────────────────────────────

log(APPLY ? "APPLYING corrections to the production database\n" : "DRY RUN — no writes (pass --apply to write)\n");

await pravka1_about();
await pravka2_splendorX();
await pravka4_apparatusHub();
await pravka5_injectableHub();
await pravka6_laserHub();
await pravka7_podology();
await pravka8_injectablePages();
await pravka10and20_apparatusPages();
await pravka11_ivTherapyNaming();
await pravka12_blockOrder();
await pravka13_plasticSurgeon();
await pravka14_skincare();
await pravka15_laboratory();
await pravka17_bodyPage();
await pravka18_longevityHub();
await pravka19_diagnosticsHub();
await pravka21_remainingPages();
await pravka16_skinPage();
await generalPhotoSweep();
await registerMedia();

log(`\n${APPLY ? "Applied" : "Would apply"} ${changes} change(s).`);

if (APPLY && rollback.length) {
  if (!existsSync("scripts/backups")) mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/website-corrections-rollback-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(rollback, null, 2));
  log(`Rollback data written to ${file}`);
}
