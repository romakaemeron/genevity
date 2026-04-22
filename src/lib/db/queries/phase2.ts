import { sql } from "../client";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  objectPosition: string;
  alt: string;
}

export async function getHeroSlides(locale: string): Promise<HeroSlide[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM hero_slides ORDER BY sort_order`;
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url,
    objectPosition: r.object_position || "center center",
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
