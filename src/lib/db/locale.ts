/** Map app locale code to DB column suffix */
export function dbLang(locale: string): "uk" | "ru" | "en" {
  return locale === "ua" ? "uk" : (locale as "uk" | "ru" | "en");
}

/** Pick a locale-aware column with UK fallback */
export function loc<T>(row: Record<string, T>, field: string, l: string): T {
  const lang = l === "ua" ? "uk" : l;
  return row[`${field}_${lang}`] ?? row[`${field}_uk`];
}

/** Pick a locale-aware column, return null if missing */
export function locOpt<T>(row: Record<string, T>, field: string, l: string): T | null {
  const lang = l === "ua" ? "uk" : l;
  return row[`${field}_${lang}`] ?? row[`${field}_uk`] ?? null;
}
