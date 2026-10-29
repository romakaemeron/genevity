export type PluralLocale = "uk" | "ru" | "en";

/** Plural form of "card" for a count, in the admin locales. */
export function pluralCards(locale: PluralLocale, n: number): string {
  if (locale === "en") return n === 1 ? "card" : "cards";
  const m100 = n % 100;
  const m10 = n % 10;
  const one = m10 === 1 && m100 !== 11;
  const few = m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14);
  if (locale === "uk") return one ? "картка" : few ? "картки" : "карток";
  return one ? "карта" : few ? "карты" : "карт";
}
