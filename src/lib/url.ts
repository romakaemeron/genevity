/**
 * Pure URL helpers — safe for both server and client bundles because they
 * don't pull in the DB client or any server-only dependency. Anything that
 * builds `next/metadata` lives in `@/lib/seo` (server only); client
 * components that just need to format a URL import from here.
 */
import { routing, type Locale } from "@/i18n/routing";

export const BASE_URL = "https://genevity.com.ua";

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
export function buildAlternates(path: string) {
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
