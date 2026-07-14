/**
 * Format an ISO date string ("YYYY-MM-DD") for display in the given locale.
 * Mirrors the style used by the blog article's publish-date (`PostMeta` in
 * `blog/[slug]/page.tsx`) so the two dates on a blog article look consistent.
 * Returns null when `iso` is null/empty so callers can render nothing.
 */
export function formatReviewDate(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const localeTag = locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return new Date(iso).toLocaleDateString(localeTag, { year: "numeric", month: "long", day: "numeric" });
}
