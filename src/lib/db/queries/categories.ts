import { sql } from "../client";
import type { ServiceCategoryData } from "../types";
import { getSections, getFaqItems } from "./sections";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

function mapCategory(r: any, l: string, parent?: any): ServiceCategoryData {
  return {
    _id: r.id,
    title: pick(r, "title", l) || "",
    slug: r.slug,
    summary: pick(r, "summary", l) || "",
    heroImage: r.hero_image,
    parent: parent ? { _id: parent.id, slug: parent.slug, title: pick(parent, "title", l) || "" } : null,
    order: r.sort_order || 0,
    clickable: r.clickable !== false,
    iconKey: r.icon_key,
    seoTitle: pick(r, "seo_title", l),
    seoDescription: pick(r, "seo_desc", l),
  };
}

export async function getCategoryBySlug(locale: string, slug: string): Promise<ServiceCategoryData | null> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM service_categories WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0];

  let parent = null;
  if (r.parent_id) {
    const parentRows = await sql`SELECT * FROM service_categories WHERE id = ${r.parent_id}`;
    if (parentRows.length) parent = parentRows[0];
  }

  const [sections, faq] = await Promise.all([
    getSections("category", r.id, l),
    getFaqItems("category", r.id, l),
  ]);

  return { ...mapCategory(r, l, parent), sections, faq };
}

export async function getAllCategories(locale: string): Promise<ServiceCategoryData[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM service_categories ORDER BY sort_order`;

  const catMap = new Map(rows.map((r) => [r.id, r]));

  return rows.map((r) => {
    const parent = r.parent_id ? catMap.get(r.parent_id) : null;
    return mapCategory(r, l, parent);
  });
}

export async function getAllCategorySlugs(): Promise<{ slug: string }[]> {
  const rows = await sql`SELECT slug FROM service_categories`;
  return rows.map((r) => ({ slug: r.slug }));
}
