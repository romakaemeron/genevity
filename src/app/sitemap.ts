import type { MetadataRoute } from "next";
import { getAllServiceSlugs, getLegalDocs, getAllDoctors } from "@/lib/db/queries";
import { getAllBlogSlugs } from "@/lib/db/queries/blog";
import { sql } from "@/lib/db/client";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

// SEO audit §1.6: only the mandatory tags (urlset/url/loc); no changeFreq/priority/lastMod.
//
// TZ №14, part 1 — every language version gets its OWN <url>/<loc> entry.
// Google attributes a URL to a sitemap only when it appears in a <loc>, so the
// previous shape (one entry per page, uk in <loc> with ru/en as xhtml:link
// alternates) left every /ru/* and /en/* page undiscovered — GSC reported
// "Sitemap: no matching sitemaps found" for them.
//
// TZ №14, part 2 — NO xhtml:link hreflang alternates here, deliberately.
// Declaring xmlns:xhtml makes WebKit/Blink skip their XML source viewer and
// render the document as markup instead: <loc> becomes an unknown inline
// element and the whole file displays as one run-on line of text. It also
// fails strict validation against the official sitemaps.org 0.9 XSD, since the
// hreflang extension is outside that schema. Dropping it costs no hreflang
// coverage — every page already emits the complete
// <link rel="alternate" hreflang> set (uk-UA/ru-UA/en-UA/x-default) in its
// <head> via buildAlternates(), which Google treats as equivalent. See §1.11.
function localeUrls(path: string): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: absoluteUrl(path, locale),
  }));
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
  entries.push(...localeUrls("/"));

  // Static pages (about, prices, stationary, laboratory, contacts)
  for (const page of staticPages) {
    if (page.slug === "home") continue;
    entries.push(...localeUrls(`/${page.slug}`));
  }

  // Services index + category hubs
  entries.push(...localeUrls("/services"));
  for (const cat of categories) {
    entries.push(...localeUrls(`/services/${cat.slug}`));
  }

  // Service detail pages. Skip self-referential hub services (slug === category):
  // /services/<cat>/<cat> 308-redirects to /services/<cat>, already listed above.
  for (const svc of services) {
    if (svc.slug === svc.categorySlug) continue;
    entries.push(...localeUrls(`/services/${svc.categorySlug}/${svc.slug}`));
  }

  // Doctors index + individual doctor pages
  entries.push(...localeUrls("/doctors"));
  for (const doc of doctors) {
    if (doc.slug) entries.push(...localeUrls(`/doctors/${doc.slug}`));
  }

  // Legal docs
  for (const doc of legalDocs) {
    entries.push(...localeUrls(`/legal/${doc.slug}`));
  }

  // Blog index + articles. Live on production since the 2026-09-25 launch;
  // getAllBlogSlugs() already returns only published, past-dated posts.
  entries.push(...localeUrls("/blog"));
  for (const slug of blogSlugs) {
    entries.push(...localeUrls(`/blog/${slug}`));
  }

  // Media/press mentions
  entries.push(...localeUrls("/media"));

  // TZ №14: /services and /doctors are pushed both explicitly and via
  // `static_pages`, which is why GSC reported 121 discovered URLs for 123
  // <loc> entries. Keep the first occurrence of each URL.
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
