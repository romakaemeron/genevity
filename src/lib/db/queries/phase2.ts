import { sql } from "../client";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

/** Crop settings for a single breakpoint. `pos` is a CSS object-position
 *  string (e.g. "50% 30%"); `scale` is a transform scale applied on top so
 *  the admin can zoom in when the default cover crop has no vertical/
 *  horizontal slack to work with (e.g. a landscape image on a tall phone). */
export interface HeroFocalBP {
  pos: string;
  scale: number;
}

/** Per-breakpoint focal configuration. All three keys are always populated
 *  by the loader so consumers never have to handle partial data. */
export interface HeroFocalPoint {
  desktop: HeroFocalBP;
  tablet: HeroFocalBP;
  mobile: HeroFocalBP;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  /** Responsive focal point — one crop per mobile / tablet / desktop
   *  breakpoint (< 768, 768–1023, ≥ 1024). */
  objectPosition: HeroFocalPoint;
  alt: string;
}

const FALLBACK_POS = "50% 50%";
const FALLBACK_SCALE = 1;

function coerceBP(v: unknown): HeroFocalBP {
  // Legacy flat string → assumed to be a position, scale = 1.
  if (typeof v === "string" && v.trim()) return { pos: v.trim(), scale: FALLBACK_SCALE };
  if (v && typeof v === "object") {
    const src = v as Record<string, unknown>;
    const pos = typeof src.pos === "string" && src.pos.trim() ? src.pos.trim() : FALLBACK_POS;
    const rawScale = typeof src.scale === "number" ? src.scale : Number(src.scale);
    const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : FALLBACK_SCALE;
    return { pos, scale };
  }
  return { pos: FALLBACK_POS, scale: FALLBACK_SCALE };
}

function resolveHeroFocal(raw: unknown): HeroFocalPoint {
  if (!raw) {
    const f: HeroFocalBP = { pos: FALLBACK_POS, scale: FALLBACK_SCALE };
    return { desktop: f, tablet: f, mobile: f };
  }
  // Post-migration the column is JSONB; some drivers hand back a string.
  const obj = typeof raw === "string" ? safeParse(raw) : raw;
  if (typeof obj === "string") {
    // Legacy column stored a single flat position string — fan out.
    const bp = coerceBP(obj);
    return { desktop: bp, tablet: bp, mobile: bp };
  }
  if (obj && typeof obj === "object") {
    const src = obj as Record<string, unknown>;
    return {
      desktop: coerceBP(src.desktop),
      tablet: coerceBP(src.tablet),
      mobile: coerceBP(src.mobile),
    };
  }
  const f: HeroFocalBP = { pos: FALLBACK_POS, scale: FALLBACK_SCALE };
  return { desktop: f, tablet: f, mobile: f };
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
