"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { processAndUploadImage } from "./upload";
import { requireSession } from "./auth";

export async function uploadPhase2Image(formData: FormData): Promise<{ url: string }> {
  const file = formData.get("file") as File;
  const url = await processAndUploadImage(file, "phase2");
  if (!url) throw new Error("No file");
  return { url };
}

/* ==========  HERO SLIDES  ========== */
/** Crop settings for a single breakpoint. */
export type HeroFocalBPInput = { pos?: string; scale?: number };
/** Per-breakpoint focal + zoom. Callers may also send a legacy flat string
 *  (just a position) — normalized into a full {pos, scale: 1} object. */
export type HeroFocalInput = {
  desktop?: HeroFocalBPInput | string;
  tablet?: HeroFocalBPInput | string;
  mobile?: HeroFocalBPInput | string;
};

type HeroSlideInput = {
  id?: string;
  image_url: string;
  /** Accept any shape — normalizeFocal handles string, legacy per-bp
   *  strings, the current {pos, scale} per-bp objects, and null/undefined. */
  object_position: unknown;
  alt_uk: string;
  alt_ru: string;
  alt_en: string;
};

const FOCAL_FALLBACK_POS = "50% 50%";
const FOCAL_FALLBACK_SCALE = 1;

function coerceBP(v: HeroFocalBPInput | string | undefined | null): { pos: string; scale: number } {
  if (typeof v === "string") {
    const trimmed = v.trim();
    return { pos: trimmed || FOCAL_FALLBACK_POS, scale: FOCAL_FALLBACK_SCALE };
  }
  if (v && typeof v === "object") {
    const pos = typeof v.pos === "string" && v.pos.trim() ? v.pos.trim() : FOCAL_FALLBACK_POS;
    const rawScale = typeof v.scale === "number" ? v.scale : Number(v.scale);
    const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : FOCAL_FALLBACK_SCALE;
    return { pos, scale };
  }
  return { pos: FOCAL_FALLBACK_POS, scale: FOCAL_FALLBACK_SCALE };
}

function normalizeFocal(v: unknown): {
  desktop: { pos: string; scale: number };
  tablet: { pos: string; scale: number };
  mobile: { pos: string; scale: number };
} {
  if (!v) {
    const f = { pos: FOCAL_FALLBACK_POS, scale: FOCAL_FALLBACK_SCALE };
    return { desktop: f, tablet: f, mobile: f };
  }
  if (typeof v === "string") {
    const bp = coerceBP(v);
    return { desktop: bp, tablet: bp, mobile: bp };
  }
  const src = v as { desktop?: unknown; tablet?: unknown; mobile?: unknown };
  return {
    desktop: coerceBP(src.desktop as HeroFocalBPInput | string | undefined),
    tablet: coerceBP(src.tablet as HeroFocalBPInput | string | undefined),
    mobile: coerceBP(src.mobile as HeroFocalBPInput | string | undefined),
  };
}

export async function saveHeroSlides(slides: HeroSlideInput[]) {
  await sql`DELETE FROM hero_slides`;
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    if (!s.image_url) continue;
    const focal = JSON.stringify(normalizeFocal(s.object_position));
    await sql`
      INSERT INTO hero_slides (image_url, object_position, alt_uk, alt_ru, alt_en, sort_order)
      VALUES (${s.image_url}, ${focal}::jsonb, ${s.alt_uk || null}, ${s.alt_ru || null}, ${s.alt_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  revalidatePath("/sitemap-images");
  return { ok: true };
}

/* ==========  GALLERY ITEMS  ========== */
type GalleryItemInput = {
  id?: string;
  image_url: string;
  alt_uk: string; alt_ru: string; alt_en: string;
  title_uk: string; title_ru: string; title_en: string;
  label_uk: string; label_ru: string; label_en: string;
  sublabel_uk: string; sublabel_ru: string; sublabel_en: string;
  description_uk: string; description_ru: string; description_en: string;
};

export async function saveGallery(ownerKey: string, items: GalleryItemInput[]) {
  await sql`DELETE FROM gallery_items WHERE owner_key = ${ownerKey}`;
  for (let i = 0; i < items.length; i++) {
    const g = items[i];
    if (!g.image_url) continue;
    await sql`
      INSERT INTO gallery_items (owner_key, image_url, alt_uk, alt_ru, alt_en, title_uk, title_ru, title_en, label_uk, label_ru, label_en, sublabel_uk, sublabel_ru, sublabel_en, description_uk, description_ru, description_en, sort_order)
      VALUES (${ownerKey}, ${g.image_url},
        ${g.alt_uk || null}, ${g.alt_ru || null}, ${g.alt_en || null},
        ${g.title_uk || null}, ${g.title_ru || null}, ${g.title_en || null},
        ${g.label_uk || null}, ${g.label_ru || null}, ${g.label_en || null},
        ${g.sublabel_uk || null}, ${g.sublabel_ru || null}, ${g.sublabel_en || null},
        ${g.description_uk || null}, ${g.description_ru || null}, ${g.description_en || null},
        ${i})
    `;
  }
  revalidatePath("/");
  revalidatePath("/sitemap-images");
  return { ok: true };
}

/* ==========  PRICES  ========== */

function revalidatePrices() {
  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/ru/prices");
  revalidatePath("/en/prices");
}

/**
 * Update a single price row. Marks the row `manual` so the next spreadsheet
 * import reports it as a conflict instead of silently overwriting the edit.
 */
export async function updatePriceItem(input: {
  id: string;
  name_uk: string;
  name_ru: string;
  name_en: string;
  price: string;
  is_visible: boolean;
}) {
  await requireSession();
  const cleaned = String(input.price).replace(/[\s\u00A0]/g, "").replace(",", ".");
  // An empty (or whitespace-only) price field means "no price", not "priced at
  // zero" -- Number("") is 0 in JS, which would otherwise store price_numeric
  // = 0 and surface as a genuine "0 UAH" offer in structured data / sorting.
  const numeric = cleaned === "" ? NaN : Number(cleaned);
  await sql`
    UPDATE price_items SET
      name_uk = ${input.name_uk},
      name_ru = ${input.name_ru || null},
      name_en = ${input.name_en || null},
      price = ${input.price},
      price_numeric = ${Number.isFinite(numeric) ? Math.round(numeric) : null},
      is_visible = ${input.is_visible},
      source = 'manual',
      updated_at = now()
    WHERE id = ${input.id}
  `;
  revalidatePrices();
  return { ok: true as const };
}

export async function setPriceCategoryVisibility(id: string, isVisible: boolean) {
  await requireSession();
  await sql`UPDATE price_categories SET is_visible = ${isVisible}, updated_at = now() WHERE id = ${id}`;
  revalidatePrices();
  return { ok: true as const };
}

export async function setPriceSubcategoryVisibility(id: string, isVisible: boolean) {
  await requireSession();
  await sql`UPDATE price_subcategories SET is_visible = ${isVisible}, updated_at = now() WHERE id = ${id}`;
  revalidatePrices();
  return { ok: true as const };
}

/* ==========  LAB SERVICES / PREP / CHECKUPS  ========== */
type LabServiceInput = {
  id?: string;
  icon_key: string;
  label_uk: string; label_ru: string; label_en: string;
  items_uk: string[]; items_ru: string[]; items_en: string[];
  price_uk: string; price_ru: string; price_en: string;
};

export async function saveLabServices(services: LabServiceInput[]) {
  await sql`DELETE FROM lab_services`;
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await sql`
      INSERT INTO lab_services (icon_key, label_uk, label_ru, label_en, items_uk, items_ru, items_en, price_uk, price_ru, price_en, sort_order)
      VALUES (${s.icon_key}, ${s.label_uk}, ${s.label_ru || null}, ${s.label_en || null},
        ${s.items_uk || []}, ${s.items_ru || []}, ${s.items_en || []},
        ${s.price_uk || null}, ${s.price_ru || null}, ${s.price_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}

type LabPrepStepInput = {
  icon_key: string;
  label_uk: string; label_ru: string; label_en: string;
  desc_uk: string; desc_ru: string; desc_en: string;
};

export async function saveLabPrepSteps(steps: LabPrepStepInput[]) {
  await sql`DELETE FROM lab_prep_steps`;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    await sql`
      INSERT INTO lab_prep_steps (icon_key, label_uk, label_ru, label_en, desc_uk, desc_ru, desc_en, sort_order)
      VALUES (${s.icon_key}, ${s.label_uk}, ${s.label_ru || null}, ${s.label_en || null},
        ${s.desc_uk || null}, ${s.desc_ru || null}, ${s.desc_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}

type LabCheckupInput = {
  label_uk: string; label_ru: string; label_en: string;
  price_uk: string; price_ru: string; price_en: string;
  desc_uk: string; desc_ru: string; desc_en: string;
};

export async function saveLabCheckups(checkups: LabCheckupInput[]) {
  await sql`DELETE FROM lab_checkups`;
  for (let i = 0; i < checkups.length; i++) {
    const c = checkups[i];
    await sql`
      INSERT INTO lab_checkups (label_uk, label_ru, label_en, price_uk, price_ru, price_en, desc_uk, desc_ru, desc_en, sort_order)
      VALUES (${c.label_uk}, ${c.label_ru || null}, ${c.label_en || null},
        ${c.price_uk || null}, ${c.price_ru || null}, ${c.price_en || null},
        ${c.desc_uk || null}, ${c.desc_ru || null}, ${c.desc_en || null}, ${i})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}
