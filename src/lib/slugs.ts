import type { Locale } from "@/i18n/routing";
import { localizedPath } from "./seo";

/** Single source of truth for URL composition across the site. */

export function serviceHref(locale: Locale, categorySlug: string, serviceSlug: string) {
  return localizedPath(`/services/${categorySlug}/${serviceSlug}`, locale);
}

export function categoryHref(locale: Locale, slug: string) {
  return localizedPath(`/services/${slug}`, locale);
}

export function servicesIndexHref(locale: Locale) {
  return localizedPath("/services", locale);
}

export function doctorsHref(locale: Locale) {
  return localizedPath("/doctors", locale);
}

export function staticPageHref(locale: Locale, slug: string) {
  return localizedPath(`/${slug}`, locale);
}
