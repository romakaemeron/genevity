import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

const BASE_URL = "https://genevity.com.ua";

/** Build a locale-prefixed path. Default locale (ua) has no prefix. */
export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalized;
  return `/${locale}${normalized}`;
}

/** Build full URL for a locale-prefixed path. */
export function absoluteUrl(path: string, locale: Locale): string {
  return `${BASE_URL}${localizedPath(path, locale)}`;
}

/** Generate hreflang alternates for all locales. */
function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale === "ua" ? "uk" : locale] = absoluteUrl(path, locale);
  }
  languages["x-default"] = absoluteUrl(path, routing.defaultLocale);
  return {
    canonical: absoluteUrl(path, routing.defaultLocale),
    languages,
  };
}

interface PageMetadataInput {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  ogImage?: string;
  noindex?: boolean;
}

/** Centralized metadata generator for all pages. Handles hreflang, OG, Twitter, canonical. */
export function generatePageMetadata({
  title,
  description,
  locale,
  path,
  ogImage,
  noindex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path, locale);
  const image = ogImage || `${BASE_URL}/og/genevity-og.jpg`;

  return {
    title,
    description,
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
