import { t as localizeNavLabel, type NavLeaf } from "./navConfig";

/** The namespace-bound next-intl translator subset the nav components rely on. */
type NavTranslator = { (key: string): string; has: (key: string) => boolean };

/**
 * Resolve a mega-menu / footer nav label.
 *
 * Prefers the CMS-managed `nav_mega.<key>` string, but falls back to the
 * hardcoded localized label already present in `navConfig` when that key isn't
 * seeded (e.g. a newly added service page). Without this fallback next-intl
 * throws `MISSING_MESSAGE` for any nav item whose `nav_mega` key is absent.
 */
export function resolveNavLabel(
  tNav: NavTranslator,
  key: string,
  label: NavLeaf["label"],
  locale: string,
): string {
  return tNav.has(key) ? tNav(key) : localizeNavLabel(label, locale);
}
