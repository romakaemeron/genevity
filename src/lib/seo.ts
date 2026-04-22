/**
 * Server-only SEO helpers: builds `next/metadata` objects and resolves the
 * cascading OG image from DB settings. This module imports the DB client, so
 * it must NOT be pulled into any client bundle. If a client component only
 * needs to build URLs, import from `@/lib/url` instead.
 */
import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteSettingsData } from "@/lib/db/queries";
import { BASE_URL, absoluteUrl, buildAlternates } from "@/lib/url";

// Re-export URL helpers so existing imports from "@/lib/seo" keep working on
// server components. Client components should import them from "@/lib/url".
export { BASE_URL, absoluteUrl, localizedPath } from "@/lib/url";

const HARDCODED_FALLBACK_OG = `${BASE_URL}/og/genevity-og.jpg`;

interface PageMetadataInput {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  ogImage?: string | null;
  noindex?: boolean;
  /** Comma-separated or array. Google ignores this; Bing / Yandex still use it. */
  keywords?: string | string[] | null;
}

/**
 * Absolute URL for the OG image. Cascade:
 *   1. Page-specific `ogImage` passed in by the caller
 *   2. Site-wide default from `site_settings.og_image` (admin-editable)
 *   3. Hardcoded fallback to /og/genevity-og.jpg (ships with the repo)
 */
async function resolveOgImage(pageOgImage: string | null | undefined): Promise<string> {
  const toAbs = (v: string) => (v.startsWith("http") ? v : `${BASE_URL}${v.startsWith("/") ? "" : "/"}${v}`);
  if (pageOgImage) return toAbs(pageOgImage);
  try {
    const settings = await getSiteSettingsData(routing.defaultLocale);
    if (settings.ogImage) return toAbs(settings.ogImage);
  } catch { /* ignore — fall through to hardcoded */ }
  return HARDCODED_FALLBACK_OG;
}

/** Centralized metadata generator for all pages. Handles hreflang, OG, Twitter, canonical. */
export async function generatePageMetadata({
  title,
  description,
  locale,
  path,
  ogImage,
  noindex = false,
  keywords,
}: PageMetadataInput): Promise<Metadata> {
  const url = absoluteUrl(path, locale);
  const image = await resolveOgImage(ogImage);
  const normalizedKeywords =
    keywords == null ? undefined :
    Array.isArray(keywords) ? keywords.filter(Boolean) :
    keywords.split(",").map((k) => k.trim()).filter(Boolean);

  return {
    title,
    description,
    keywords: normalizedKeywords,
    alternates: buildAlternates(path),
    openGraph: {
      title,
      description,
      url,
      siteName: "GENEVITY",
      type: "website",
      locale: locale === "ua" ? "uk_UA" : locale === "ru" ? "ru_UA" : "en_US",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
