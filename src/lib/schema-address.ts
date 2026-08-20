/**
 * Clinic postal address for JSON-LD, localized.
 *
 * The markup a crawler reads must speak the page's language — an EN or RU page
 * carrying a Ukrainian streetAddress was flagged in Технічне завдання №7 (п. 3).
 * Kept in code rather than the CMS: the address changes roughly never, and every
 * schema block needs it synchronously.
 */
export type SchemaLocale = "ua" | "ru" | "en";

const ADDRESSES: Record<SchemaLocale, { streetAddress: string; addressLocality: string; addressRegion: string }> = {
  ua: {
    streetAddress: "вул. Олеся Гончара, 12",
    addressLocality: "Дніпро",
    addressRegion: "Дніпропетровська область",
  },
  ru: {
    streetAddress: "ул. Олеся Гончара, 12",
    addressLocality: "Днепр",
    addressRegion: "Днепропетровская область",
  },
  en: {
    streetAddress: "12 Oles Honchar St.",
    addressLocality: "Dnipro",
    addressRegion: "Dnipropetrovsk Oblast",
  },
};

function pick(locale: string | undefined): SchemaLocale {
  return locale === "ru" || locale === "en" ? locale : "ua";
}

/** PostalAddress node in the page's language. `region: false` drops addressRegion. */
export function postalAddress(locale?: string, opts: { region?: boolean } = {}) {
  const a = ADDRESSES[pick(locale)];
  return {
    "@type": "PostalAddress",
    streetAddress: a.streetAddress,
    addressLocality: a.addressLocality,
    ...(opts.region === false ? {} : { addressRegion: a.addressRegion }),
    postalCode: "49000",
    addressCountry: "UA",
  };
}
