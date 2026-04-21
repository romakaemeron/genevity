/**
 * Migrate all data from Sanity → Neon Postgres + Vercel Blob
 *
 * Run: npx tsx scripts/migrate-from-sanity.ts
 */

import { createClient } from "@sanity/client";
import postgres from "postgres";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

/* ── Connections ── */
const sanity = createClient({
  projectId: "qzct6skk",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const sql = postgres(process.env.DATABASE_URL!, { max: 5 });

/* ── ID mapping: Sanity _id → Postgres UUID ── */
const idMap = new Map<string, string>();
function mapId(sanityId: string): string {
  if (!idMap.has(sanityId)) idMap.set(sanityId, randomUUID());
  return idMap.get(sanityId)!;
}

/* ── Image migration: Sanity CDN → Vercel Blob ── */
const imageCache = new Map<string, string>(); // sanity URL → blob URL
async function migrateImage(sanityUrl: string | null | undefined, folder: string): Promise<string | null> {
  if (!sanityUrl) return null;
  if (imageCache.has(sanityUrl)) return imageCache.get(sanityUrl)!;

  try {
    const res = await fetch(sanityUrl);
    if (!res.ok) { console.warn(`  ⚠ Failed to fetch image: ${sanityUrl}`); return null; }
    const blob = await res.blob();

    const ext = sanityUrl.includes(".webp") ? "webp" : sanityUrl.includes(".png") ? "png" : "jpg";
    const filename = `${folder}/${randomUUID()}.${ext}`;

    const result = await put(filename, blob, { access: "public", addRandomSuffix: false });
    imageCache.set(sanityUrl, result.url);
    console.log(`  📷 ${folder}: ${result.url.split("/").pop()}`);
    return result.url;
  } catch (e: any) {
    console.warn(`  ⚠ Image upload failed: ${e.message}`);
    return null;
  }
}

/* ── Helper: extract locale fields ── */
function loc(obj: any, field: string) {
  if (!obj?.[field]) return { uk: null, ru: null, en: null };
  const f = obj[field];
  return { uk: f.uk || f.ua || null, ru: f.ru || null, en: f.en || null };
}

function locArr(obj: any, field: string) {
  if (!obj?.[field]) return { uk: [], ru: [], en: [] };
  const f = obj[field];
  return { uk: f.uk || f.ua || [], ru: f.ru || [], en: f.en || [] };
}

/* ──────────────────────────────────────────────
   MIGRATE FUNCTIONS
   ────────────────────────────────────────────── */

async function migrateCategories() {
  console.log("\n🏷  Migrating service categories...");
  const cats = await sanity.fetch(`*[_type == "serviceCategory"] | order(order asc) {
    _id, slug, title, summary, "heroImage": heroImage.asset->url,
    parent, order, clickable, iconKey,
    seoTitle, seoDescription
  }`);

  for (const c of cats) {
    const id = mapId(c._id);
    const t = loc(c, "title");
    const s = loc(c, "summary");
    const seoT = loc(c, "seoTitle");
    const seoD = loc(c, "seoDescription");
    const heroImg = await migrateImage(c.heroImage, "categories");

    await sql`INSERT INTO service_categories (id, slug, title_uk, title_ru, title_en, summary_uk, summary_ru, summary_en, hero_image, sort_order, clickable, icon_key, seo_title_uk, seo_title_ru, seo_title_en, seo_desc_uk, seo_desc_ru, seo_desc_en)
    VALUES (${id}, ${c.slug?.current || c.slug}, ${t.uk}, ${t.ru}, ${t.en}, ${s.uk}, ${s.ru}, ${s.en}, ${heroImg}, ${c.order || 0}, ${c.clickable !== false}, ${c.iconKey || null}, ${seoT.uk}, ${seoT.ru}, ${seoT.en}, ${seoD.uk}, ${seoD.ru}, ${seoD.en})`;
  }
  console.log(`  ✓ ${cats.length} categories`);
}

async function migrateServices() {
  console.log("\n📋  Migrating services...");
  const services = await sanity.fetch(`*[_type == "service"] | order(order asc) {
    _id, slug, "categoryId": category._ref, title, h1, summary,
    "heroImage": heroImage.asset->url,
    procedureLength, effectDuration, sessionsRecommended,
    priceFrom, priceUnit,
    seoTitle, seoDescription, seoNoindex,
    order,
    "sections": sections[] {
      _key, _type,
      heading, body, items, steps,
      indicationsHeading, indications, contraindicationsHeading, contraindications,
      intro, ctaLabel, tone,
      columns, rows
    },
    "faq": faq[] { question, answer },
    "relatedDoctors": relatedDoctors[]._ref,
    "relatedServices": relatedServices[]._ref,
    "relatedEquipment": relatedEquipment[]._ref
  }`);

  for (const svc of services) {
    const id = mapId(svc._id);
    const catId = idMap.get(svc.categoryId);
    if (!catId) { console.warn(`  ⚠ No category for service ${svc._id}`); continue; }

    const t = loc(svc, "title");
    const h = loc(svc, "h1");
    const s = loc(svc, "summary");
    const pl = loc(svc, "procedureLength");
    const ed = loc(svc, "effectDuration");
    const sr = loc(svc, "sessionsRecommended");
    const pf = loc(svc, "priceFrom");
    const pu = loc(svc, "priceUnit");
    const seoT = loc(svc, "seoTitle");
    const seoD = loc(svc, "seoDescription");
    const heroImg = await migrateImage(svc.heroImage, "services");
    const slug = svc.slug?.current || svc.slug;

    await sql`INSERT INTO services (id, slug, category_id, title_uk, title_ru, title_en, h1_uk, h1_ru, h1_en, summary_uk, summary_ru, summary_en, hero_image, procedure_length_uk, procedure_length_ru, procedure_length_en, effect_duration_uk, effect_duration_ru, effect_duration_en, sessions_recommended_uk, sessions_recommended_ru, sessions_recommended_en, price_from_uk, price_from_ru, price_from_en, price_unit_uk, price_unit_ru, price_unit_en, seo_title_uk, seo_title_ru, seo_title_en, seo_desc_uk, seo_desc_ru, seo_desc_en, seo_noindex, sort_order)
    VALUES (${id}, ${slug}, ${catId}, ${t.uk}, ${t.ru}, ${t.en}, ${h.uk}, ${h.ru}, ${h.en}, ${s.uk}, ${s.ru}, ${s.en}, ${heroImg}, ${pl.uk}, ${pl.ru}, ${pl.en}, ${ed.uk}, ${ed.ru}, ${ed.en}, ${sr.uk}, ${sr.ru}, ${sr.en}, ${pf.uk}, ${pf.ru}, ${pf.en}, ${pu.uk}, ${pu.ru}, ${pu.en}, ${seoT.uk}, ${seoT.ru}, ${seoT.en}, ${seoD.uk}, ${seoD.ru}, ${seoD.en}, ${svc.seoNoindex || false}, ${svc.order || 0})`;

    // Sections
    if (svc.sections?.length) {
      for (let i = 0; i < svc.sections.length; i++) {
        const sec = svc.sections[i];
        const sectionType = sec._type?.replace("section.", "") || "richText";
        const data: any = {};

        if (sec.heading) data.heading = sec.heading;
        if (sec.body) data.body = sec.body;
        if (sec.items) data.items = sec.items;
        if (sec.steps) data.steps = sec.steps;
        if (sec.indicationsHeading) data.indicationsHeading = sec.indicationsHeading;
        if (sec.indications) data.indications = sec.indications;
        if (sec.contraindicationsHeading) data.contraindicationsHeading = sec.contraindicationsHeading;
        if (sec.contraindications) data.contraindications = sec.contraindications;
        if (sec.intro) data.intro = sec.intro;
        if (sec.ctaLabel) data.ctaLabel = sec.ctaLabel;
        if (sec.tone) data.tone = sec.tone;
        if (sec.columns) data.columns = sec.columns;
        if (sec.rows) data.rows = sec.rows;

        await sql`INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
        VALUES ('service', ${id}, ${i}, ${sectionType}::section_type, ${JSON.stringify(data)}::jsonb)`;
      }
    }

    // FAQ
    if (svc.faq?.length) {
      for (let i = 0; i < svc.faq.length; i++) {
        const f = svc.faq[i];
        const q = loc(f, "question");
        const a = loc(f, "answer");
        await sql`INSERT INTO faq_items (owner_type, owner_id, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
        VALUES ('service', ${id}, ${q.uk}, ${q.ru}, ${q.en}, ${a.uk}, ${a.ru}, ${a.en}, ${i})`;
      }
    }

    // Relations: doctors
    if (svc.relatedDoctors?.length) {
      for (let i = 0; i < svc.relatedDoctors.length; i++) {
        const docId = idMap.get(svc.relatedDoctors[i]);
        if (docId) {
          await sql`INSERT INTO service_doctors (service_id, doctor_id, sort_order) VALUES (${id}, ${docId}, ${i}) ON CONFLICT DO NOTHING`;
        }
      }
    }

    // Relations: related services
    if (svc.relatedServices?.length) {
      for (let i = 0; i < svc.relatedServices.length; i++) {
        const relId = idMap.get(svc.relatedServices[i]);
        if (relId) {
          await sql`INSERT INTO service_related (service_id, related_service_id, sort_order) VALUES (${id}, ${relId}, ${i}) ON CONFLICT DO NOTHING`;
        }
      }
    }

    // Relations: equipment
    if (svc.relatedEquipment?.length) {
      for (let i = 0; i < svc.relatedEquipment.length; i++) {
        const eqId = idMap.get(svc.relatedEquipment[i]);
        if (eqId) {
          await sql`INSERT INTO service_equipment (service_id, equipment_id, sort_order) VALUES (${id}, ${eqId}, ${i}) ON CONFLICT DO NOTHING`;
        }
      }
    }
  }
  console.log(`  ✓ ${services.length} services`);
}

async function migrateDoctors() {
  console.log("\n👨‍⚕️  Migrating doctors...");
  const doctors = await sanity.fetch(`*[_type == "doctor"] | order(order asc) {
    _id, name, role, experience, specialties,
    "photoCard": photo.asset->url,
    "photoFull": photoFull.asset->url,
    cardPosition, order
  }`);

  for (const d of doctors) {
    const id = mapId(d._id);
    const n = loc(d, "name");
    const r = loc(d, "role");
    const e = loc(d, "experience");
    const sp = locArr(d, "specialties");
    const photoCard = await migrateImage(d.photoCard, "doctors");
    const photoFull = await migrateImage(d.photoFull, "doctors");

    await sql`INSERT INTO doctors (id, name_uk, name_ru, name_en, role_uk, role_ru, role_en, experience_uk, experience_ru, experience_en, specialties_uk, specialties_ru, specialties_en, photo_card, photo_full, card_position, sort_order)
    VALUES (${id}, ${n.uk}, ${n.ru}, ${n.en}, ${r.uk}, ${r.ru}, ${r.en}, ${e.uk}, ${e.ru}, ${e.en}, ${sp.uk}, ${sp.ru}, ${sp.en}, ${photoCard}, ${photoFull}, ${d.cardPosition || "center center"}, ${d.order || 0})`;
  }
  console.log(`  ✓ ${doctors.length} doctors`);
}

async function migrateEquipment() {
  console.log("\n⚙️  Migrating equipment...");
  const items = await sanity.fetch(`*[_type == "equipment"] | order(order asc) {
    _id, name, category, shortDescription, description,
    suits, results, note,
    "photo": photo.asset->url,
    order
  }`);

  for (const eq of items) {
    const id = mapId(eq._id);
    const sd = loc(eq, "shortDescription");
    const desc = loc(eq, "description");
    const su = locArr(eq, "suits");
    const re = locArr(eq, "results");
    const no = loc(eq, "note");
    const photo = await migrateImage(eq.photo, "equipment");

    await sql`INSERT INTO equipment (id, name, category, short_description_uk, short_description_ru, short_description_en, description_uk, description_ru, description_en, suits_uk, suits_ru, suits_en, results_uk, results_ru, results_en, note_uk, note_ru, note_en, photo, sort_order)
    VALUES (${id}, ${eq.name}, ${eq.category}::equipment_category, ${sd.uk}, ${sd.ru}, ${sd.en}, ${desc.uk}, ${desc.ru}, ${desc.en}, ${su.uk}, ${su.ru}, ${su.en}, ${re.uk}, ${re.ru}, ${re.en}, ${no.uk}, ${no.ru}, ${no.en}, ${photo}, ${eq.order || 0})`;
  }
  console.log(`  ✓ ${items.length} equipment items`);
}

async function migrateSingletons() {
  console.log("\n🏠  Migrating singletons...");

  // Hero
  const hero = await sanity.fetch(`*[_type == "hero"][0]{ title, subtitle, cta, location }`);
  if (hero) {
    const t = loc(hero, "title");
    const s = loc(hero, "subtitle");
    const c = loc(hero, "cta");
    const l = loc(hero, "location");
    await sql`INSERT INTO hero (id, title_uk, title_ru, title_en, subtitle_uk, subtitle_ru, subtitle_en, cta_uk, cta_ru, cta_en, location_uk, location_ru, location_en)
    VALUES (1, ${t.uk}, ${t.ru}, ${t.en}, ${s.uk}, ${s.ru}, ${s.en}, ${c.uk}, ${c.ru}, ${c.en}, ${l.uk}, ${l.ru}, ${l.en})`;
    console.log("  ✓ hero");
  }

  // About
  const about = await sanity.fetch(`*[_type == "about"][0]{ title, text1, text2, diagnostics }`);
  if (about) {
    const t = loc(about, "title");
    const t1 = loc(about, "text1");
    const t2 = loc(about, "text2");
    const d = loc(about, "diagnostics");
    await sql`INSERT INTO about (id, title_uk, title_ru, title_en, text1_uk, text1_ru, text1_en, text2_uk, text2_ru, text2_en, diagnostics_uk, diagnostics_ru, diagnostics_en)
    VALUES (1, ${t.uk}, ${t.ru}, ${t.en}, ${t1.uk}, ${t1.ru}, ${t1.en}, ${t2.uk}, ${t2.ru}, ${t2.en}, ${d.uk}, ${d.ru}, ${d.en})`;
    console.log("  ✓ about");
  }

  // Site settings
  const settings = await sanity.fetch(`*[_type == "siteSettings"][0]{ phone1, phone2, address, instagram, hours, mapsUrl }`);
  if (settings) {
    const a = loc(settings, "address");
    const h = loc(settings, "hours");
    await sql`INSERT INTO site_settings (id, phone1, phone2, address_uk, address_ru, address_en, instagram, hours_uk, hours_ru, hours_en, maps_url)
    VALUES (1, ${settings.phone1}, ${settings.phone2}, ${a.uk}, ${a.ru}, ${a.en}, ${settings.instagram}, ${h.uk}, ${h.ru}, ${h.en}, ${settings.mapsUrl})`;
    console.log("  ✓ site_settings");
  }

  // UI strings
  const uiStrings = await sanity.fetch(`*[_type == "uiStrings"][0]`);
  if (uiStrings) {
    const { _id, _type, _createdAt, _updatedAt, _rev, ...data } = uiStrings;
    await sql`INSERT INTO ui_strings (id, data) VALUES (1, ${JSON.stringify(data)}::jsonb)`;
    console.log("  ✓ ui_strings");
  }

  // Navigation
  const nav = await sanity.fetch(`*[_type == "navigation"][0]{ cta, items[] { label, href, isMegaMenu, "categoryId": category._ref, order } }`);
  if (nav) {
    const cta = loc(nav, "cta");
    await sql`INSERT INTO navigation (id, cta_label_uk, cta_label_ru, cta_label_en, cta_href)
    VALUES (1, ${cta.uk}, ${cta.ru}, ${cta.en}, ${null})`;

    if (nav.items?.length) {
      for (const item of nav.items) {
        const l = loc(item, "label");
        const catId = item.categoryId ? idMap.get(item.categoryId) : null;
        await sql`INSERT INTO nav_items (label_uk, label_ru, label_en, href, is_mega_menu, category_id, sort_order)
        VALUES (${l.uk}, ${l.ru}, ${l.en}, ${item.href || null}, ${item.isMegaMenu || false}, ${catId}, ${item.order || 0})`;
      }
    }
    console.log("  ✓ navigation + nav_items");
  }
}

async function migrateLegalDocs() {
  console.log("\n📄  Migrating legal docs...");
  const docs = await sanity.fetch(`*[_type == "legalDoc"] | order(order asc) {
    _id, slug, title, shortLabel, body, order
  }`);

  for (const d of docs) {
    const t = loc(d, "title");
    const sl = loc(d, "shortLabel");
    const b = loc(d, "body");
    await sql`INSERT INTO legal_docs (slug, title_uk, title_ru, title_en, short_label_uk, short_label_ru, short_label_en, body_uk, body_ru, body_en, sort_order)
    VALUES (${d.slug?.current || d.slug}, ${t.uk}, ${t.ru}, ${t.en}, ${sl.uk}, ${sl.ru}, ${sl.en}, ${b.uk}, ${b.ru}, ${b.en}, ${d.order || 0})`;
  }
  console.log(`  ✓ ${docs.length} legal docs`);
}

async function migrateCategorySections() {
  console.log("\n📑  Migrating category sections & FAQ...");
  const cats = await sanity.fetch(`*[_type == "serviceCategory"] {
    _id,
    "sections": sections[] {
      _key, _type,
      heading, body, items, steps,
      indicationsHeading, indications, contraindicationsHeading, contraindications,
      intro, ctaLabel, tone, columns, rows
    },
    "faq": faq[] { question, answer }
  }`);

  let secCount = 0, faqCount = 0;
  for (const c of cats) {
    const catId = idMap.get(c._id);
    if (!catId) continue;

    if (c.sections?.length) {
      for (let i = 0; i < c.sections.length; i++) {
        const sec = c.sections[i];
        const sectionType = sec._type?.replace("section.", "") || "richText";
        const data: any = {};
        for (const key of ["heading", "body", "items", "steps", "indicationsHeading", "indications", "contraindicationsHeading", "contraindications", "intro", "ctaLabel", "tone", "columns", "rows"]) {
          if (sec[key] !== undefined) data[key] = sec[key];
        }
        await sql`INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
        VALUES ('category', ${catId}, ${i}, ${sectionType}::section_type, ${JSON.stringify(data)}::jsonb)`;
        secCount++;
      }
    }

    if (c.faq?.length) {
      for (let i = 0; i < c.faq.length; i++) {
        const f = c.faq[i];
        const q = loc(f, "question");
        const a = loc(f, "answer");
        await sql`INSERT INTO faq_items (owner_type, owner_id, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
        VALUES ('category', ${catId}, ${q.uk}, ${q.ru}, ${q.en}, ${a.uk}, ${a.ru}, ${a.en}, ${i})`;
        faqCount++;
      }
    }
  }
  console.log(`  ✓ ${secCount} category sections, ${faqCount} category FAQ items`);
}

/* ── Upload local images that are used on the site ── */
async function migrateLocalImages() {
  console.log("\n🖼  Uploading local images to Vercel Blob...");
  const { readFileSync, readdirSync, existsSync } = await import("fs");
  const { join } = await import("path");

  const folders = [
    { local: "public/images/hero", blob: "hero", exts: [".webp"] },
    { local: "public/images/bento", blob: "bento", exts: [".webp"] },
    { local: "public/images/interior", blob: "interior", exts: [".webp"] },
    { local: "public/images/equipment", blob: "equipment-local", exts: [".webp"] },
  ];

  let count = 0;
  for (const { local, blob, exts } of folders) {
    if (!existsSync(local)) continue;
    const files = readdirSync(local).filter(f => exts.some(e => f.endsWith(e)));
    for (const file of files) {
      const filePath = join(local, file);
      const buffer = readFileSync(filePath);
      const blobPath = `${blob}/${file}`;
      try {
        const result = await put(blobPath, buffer, { access: "public", addRandomSuffix: false });
        console.log(`  📷 ${blobPath}: ${(buffer.length / 1024).toFixed(0)}KB`);
        count++;
      } catch (e: any) {
        console.warn(`  ⚠ Failed ${blobPath}: ${e.message}`);
      }
    }
  }
  console.log(`  ✓ ${count} local images uploaded`);
}

/* ──────────────────────────────────────────────
   MAIN
   ────────────────────────────────────────────── */
async function main() {
  console.log("=".repeat(60));
  console.log("GENEVITY — Sanity → Postgres + Vercel Blob Migration");
  console.log("=".repeat(60));

  // Order matters: categories before services (FK), doctors before service_doctors
  await migrateDoctors();
  await migrateEquipment();
  await migrateCategories();
  await migrateServices();
  await migrateCategorySections();
  await migrateSingletons();
  await migrateLegalDocs();
  await migrateLocalImages();

  // Final verification
  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION");
  console.log("=".repeat(60));

  const counts = await sql`
    SELECT
      (SELECT count(*) FROM service_categories) AS categories,
      (SELECT count(*) FROM services) AS services,
      (SELECT count(*) FROM doctors) AS doctors,
      (SELECT count(*) FROM equipment) AS equipment,
      (SELECT count(*) FROM content_sections) AS sections,
      (SELECT count(*) FROM faq_items) AS faq,
      (SELECT count(*) FROM legal_docs) AS legal,
      (SELECT count(*) FROM service_doctors) AS svc_doctors,
      (SELECT count(*) FROM service_related) AS svc_related,
      (SELECT count(*) FROM service_equipment) AS svc_equipment,
      (SELECT count(*) FROM nav_items) AS nav_items
  `;
  const c = counts[0];
  console.log(`  Categories:     ${c.categories}`);
  console.log(`  Services:       ${c.services}`);
  console.log(`  Doctors:        ${c.doctors}`);
  console.log(`  Equipment:      ${c.equipment}`);
  console.log(`  Sections:       ${c.sections}`);
  console.log(`  FAQ items:      ${c.faq}`);
  console.log(`  Legal docs:     ${c.legal}`);
  console.log(`  Svc↔Doctors:    ${c.svc_doctors}`);
  console.log(`  Svc↔Related:    ${c.svc_related}`);
  console.log(`  Svc↔Equipment:  ${c.svc_equipment}`);
  console.log(`  Nav items:      ${c.nav_items}`);
  console.log(`  Images cached:  ${imageCache.size}`);

  // Check singletons
  const hero = await sql`SELECT count(*) FROM hero`;
  const about = await sql`SELECT count(*) FROM about`;
  const settings = await sql`SELECT count(*) FROM site_settings`;
  const uiStr = await sql`SELECT count(*) FROM ui_strings`;
  console.log(`  Hero:           ${hero[0].count > 0 ? "✓" : "✗"}`);
  console.log(`  About:          ${about[0].count > 0 ? "✓" : "✗"}`);
  console.log(`  Site settings:  ${settings[0].count > 0 ? "✓" : "✗"}`);
  console.log(`  UI strings:     ${uiStr[0].count > 0 ? "✓" : "✗"}`);

  console.log("\n✅ Migration complete!");
  await sql.end();
}

main().catch(async (e) => {
  console.error("\n❌ Migration failed:", e);
  await sql.end();
  process.exit(1);
});
