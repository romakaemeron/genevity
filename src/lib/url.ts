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
  // Root "/" → "/ru" not "/ru/" — avoid trailing slash on locale roots
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

/** Build full URL for a locale-prefixed path. */
export function absoluteUrl(path: string, locale: Locale): string {
  return `${BASE_URL}${localizedPath(path, locale)}`;
}

const HREFLANG: Record<string, string> = {
  ua: "uk-UA",
  ru: "ru-UA",
  en: "en-UA",
};

/** Generate hreflang alternates for all locales with region codes (e.g. uk-UA).
 *  Canonical points to the current locale's URL (self-referencing). */
export function buildAlternates(path: string, locale?: Locale) {
  const canonicalLocale = locale ?? routing.defaultLocale;
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[HREFLANG[loc] ?? loc] = absoluteUrl(path, loc);
  }
  languages["x-default"] = absoluteUrl(path, routing.defaultLocale);
  return {
    canonical: absoluteUrl(path, canonicalLocale),
    languages,
  };
}
