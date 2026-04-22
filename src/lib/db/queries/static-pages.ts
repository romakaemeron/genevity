import { sql } from "../client";
import type { StaticPageData } from "../types";
import { getSections, getFaqItems } from "./sections";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

export async function getStaticPage(locale: string, slug: string): Promise<StaticPageData | null> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM static_pages WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0];

  const [sections, faq] = await Promise.all([
    getSections("static_page", r.id, l),
    getFaqItems("static_page", r.id, l),
  ]);

  return {
    _id: r.id,
    slug: r.slug,
    title: pick(r, "title", l) || "",
    h1: pick(r, "h1", l) || pick(r, "title", l) || "",
    summary: pick(r, "summary", l) || "",
    sections,
    faq,
  };
}

export interface StaticPageSeo {
  title: string;
  description: string;
  keywords: string | null;
  ogImage: string | null;
  noindex: boolean;
}

/**
 * Read per-locale SEO values for a static page, with sensible fallbacks:
 *   - seo_title falls back to title (content H1)
 *   - seo_desc falls back to summary
 *   - noindex and ogImage are global (not localized)
 * Use this from public-route `generateMetadata`.
 */
export async function getStaticPageSeo(locale: string, slug: string): Promise<StaticPageSeo | null> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM static_pages WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    title: pick(r, "seo_title", l) || pick(r, "title", l) || "",
    description: pick(r, "seo_desc", l) || pick(r, "summary", l) || "",
    keywords: pick(r, "seo_keywords", l),
    ogImage: (r.seo_og_image as string) || null,
    noindex: Boolean(r.seo_noindex),
  };
}
