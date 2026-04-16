import type { MetadataRoute } from "next";
import { sanityClient } from "@/sanity/client";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

function localeUrls(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale === "ua" ? "uk" : locale] = absoluteUrl(path, locale);
  }
  return {
    url: absoluteUrl(path, routing.defaultLocale),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, services, staticPages, legalDocs] = await Promise.all([
    sanityClient.fetch<{ slug: string }[]>(`*[_type == "serviceCategory"]{ "slug": slug.current }`),
    sanityClient.fetch<{ slug: string; categorySlug: string }[]>(`*[_type == "service"]{ "slug": slug.current, "categorySlug": category->slug.current }`),
    sanityClient.fetch<{ slug: string }[]>(`*[_type == "staticPage"]{ slug }`),
    sanityClient.fetch<{ slug: string }[]>(`*[_type == "legalDoc"]{ "slug": slug.current }`),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Home
  entries.push(localeUrls("/", 1.0));

  // Static pages (about, prices, stationary, laboratory, contacts)
  for (const page of staticPages) {
    if (page.slug === "home") continue; // home is handled above
    entries.push(localeUrls(`/${page.slug}`, 0.8));
  }

  // Services index
  entries.push(localeUrls("/services", 0.9));

  // Category hubs
  for (const cat of categories) {
    entries.push(localeUrls(`/services/${cat.slug}`, 0.8));
  }

  // Service detail pages
  for (const svc of services) {
    entries.push(localeUrls(`/services/${svc.categorySlug}/${svc.slug}`, 0.7));
  }

  // Doctors
  entries.push(localeUrls("/doctors", 0.7));

  // Legal docs
  for (const doc of legalDocs) {
    entries.push(localeUrls(`/legal/${doc.slug}`, 0.3, "monthly"));
  }

  return entries;
}
