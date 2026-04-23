import { sql } from "../client";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

/** Per-breakpoint focal point for a hero slide. Each value is a CSS
 *  `object-position` string (e.g. "50% 30%"). All three keys are always
 *  populated by the loader (fall back to "50% 50%") so consumers never have
 *  to handle partial data. */
export interface HeroFocalPoint {
  desktop: string;
  tablet: string;
  mobile: string;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  /** Responsive focal point — maps to different `object-position` values at
   *  the mobile / tablet / desktop breakpoints (< 768, 768–1023, ≥ 1024). */
  objectPosition: HeroFocalPoint;
  alt: string;
}

function resolveHeroFocal(raw: unknown): HeroFocalPoint {
  const fallback = "50% 50%";
  if (!raw) return { desktop: fallback, tablet: fallback, mobile: fallback };
  // Post-migration the column is JSONB, but the driver may still hand it to
  // us as a string (escaped JSON) depending on transport. Accept either.
  const obj = typeof raw === "string" ? safeParse(raw) : raw;
  if (typeof obj === "string") {
    // Legacy: flat position string applied to every breakpoint.
    return { desktop: obj, tablet: obj, mobile: obj };
  }
  if (obj && typeof obj === "object") {
    const src = obj as Record<string, unknown>;
    const take = (k: string) => (typeof src[k] === "string" && (src[k] as string).trim()) ? (src[k] as string) : fallback;
    return { desktop: take("desktop"), tablet: take("tablet"), mobile: take("mobile") };
  }
  return { desktop: fallback, tablet: fallback, mobile: fallback };
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}

export async function getHeroSlides(locale: string): Promise<HeroSlide[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM hero_slides ORDER BY sort_order`;
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url,
    objectPosition: resolveHeroFocal(r.object_position),
    alt: pick(r, "alt", l) || "",
  }));
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
  label: string;
  sublabel: string;
  description: string;
}

export async function getGalleryItems(ownerKey: string, locale: string): Promise<GalleryItem[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM gallery_items WHERE owner_key = ${ownerKey} ORDER BY sort_order`;
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url,
    alt: pick(r, "alt", l) || "",
    label: pick(r, "label", l) || "",
    sublabel: pick(r, "sublabel", l) || "",
    description: pick(r, "description", l) || "",
  }));
}

export interface PriceCategory {
  id: string;
  slug: string;
  label: string;
  link: string | null;
  items: { id: string; name: string; price: string; currency: string }[];
}

export async function getPriceCategoriesWithItems(locale: string): Promise<PriceCategory[]> {
  const l = lang(locale);
  const categories = await sql`SELECT * FROM price_categories ORDER BY sort_order`;
  const items = await sql`SELECT * FROM price_items ORDER BY sort_order`;
  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    label: pick(c, "label", l) || "",
    link: c.link,
    items: items
      .filter((it) => it.category_id === c.id)
      .map((it) => ({
        id: it.id,
        name: pick(it, "name", l) || "",
        price: it.price,
        currency: it.currency || "₴",
      })),
  }));
}

export interface LabService {
  id: string;
  iconKey: string;
  label: string;
  items: string[];
  price: string;
}

export async function getLabServices(locale: string): Promise<LabService[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM lab_services ORDER BY sort_order`;
  return rows.map((r) => ({
    id: r.id,
    iconKey: r.icon_key,
    label: pick(r, "label", l) || "",
    items: (r as any)[`items_${l}`] || r.items_uk || [],
    price: pick(r, "price", l) || "",
  }));
}

export interface LabPrepStep {
  id: string;
  iconKey: string;
  label: string;
  desc: string;
}

export async function getLabPrepSteps(locale: string): Promise<LabPrepStep[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM lab_prep_steps ORDER BY sort_order`;
  return rows.map((r) => ({
    id: r.id,
    iconKey: r.icon_key,
    label: pick(r, "label", l) || "",
    desc: pick(r, "desc", l) || "",
  }));
}

export interface LabCheckup {
  id: string;
  label: string;
  price: string;
  desc: string;
}

export async function getLabCheckups(locale: string): Promise<LabCheckup[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM lab_checkups ORDER BY sort_order`;
  return rows.map((r) => ({
    id: r.id,
    label: pick(r, "label", l) || "",
    price: pick(r, "price", l) || "",
    desc: pick(r, "desc", l) || "",
  }));
}
