import type { MetadataRoute } from "next";
import { getAllServiceSlugs, getLegalDocs, getAllDoctors } from "@/lib/db/queries";
import { getAllBlogSlugs } from "@/lib/db/queries/blog";
import { sql } from "@/lib/db/client";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

// SEO audit §1.6: only mandatory tags (urlset/url/loc) + alternates; no changeFreq/priority/lastMod
function localeUrls(path: string): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    // SEO audit §1.11: region-qualified hreflang codes (uk-UA, ru-UA, en-UA)
    const tag = locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-UA" : "en-UA";
    languages[tag] = absoluteUrl(path, locale);
  }
  languages["x-default"] = absoluteUrl(path, routing.defaultLocale);
  return {
    url: absoluteUrl(path, routing.defaultLocale),
    alternates: { languages },
  };
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, services, staticPages, legalDocs, doctors, blogSlugs] = await Promise.all([
    sql`SELECT slug FROM service_categories WHERE seo_noindex IS NOT TRUE ORDER BY sort_order`,
    getAllServiceSlugs(),
    sql`SELECT slug FROM static_pages`,
    getLegalDocs("ua"),
    getAllDoctors("ua"),
    getAllBlogSlugs(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Home
  entries.push(localeUrls("/"));

  // Static pages (about, prices, stationary, laboratory, contacts)
  for (const page of staticPages) {
    if (page.slug === "home") continue;
    entries.push(localeUrls(`/${page.slug}`));
  }

  // Services index + category hubs
  entries.push(localeUrls("/services"));
  for (const cat of categories) {
    entries.push(localeUrls(`/services/${cat.slug}`));
  }

  // Service detail pages
  for (const svc of services) {
    entries.push(localeUrls(`/services/${svc.categorySlug}/${svc.slug}`));
  }

  // Doctors index + individual doctor pages
  entries.push(localeUrls("/doctors"));
  for (const doc of doctors) {
    if (doc.slug) entries.push(localeUrls(`/doctors/${doc.slug}`));
  }

  // Legal docs
  for (const doc of legalDocs) {
    entries.push(localeUrls(`/legal/${doc.slug}`));
  }

  // Blog index + individual posts
  entries.push(localeUrls('/blog'));
  for (const slug of blogSlugs) {
    entries.push(localeUrls(`/blog/${slug}`));
  }

  return entries;
}
