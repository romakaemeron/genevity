import { sanityClient } from "./client";

const localeField = (field: string, locale: string) =>
  `"${field}": coalesce(${field}.${locale === "ua" ? "uk" : locale}, ${field}.uk)`;

// ---- Equipment ----
export async function getEquipmentItems(locale: string) {
  return sanityClient.fetch(
    `*[_type == "equipment"] | order(order asc) {
      _id,
      "category": category,
      "name": name,
      ${localeField("shortDescription", locale)},
      ${localeField("description", locale)},
      "suits": coalesce(suits.${locale === "ua" ? "uk" : locale}, suits.uk),
      "results": coalesce(results.${locale === "ua" ? "uk" : locale}, results.uk),
      ${localeField("note", locale)},
    }`
  );
}

// ---- Doctors ----
export async function getDoctors(locale: string) {
  return sanityClient.fetch(
    `*[_type == "doctor"] | order(order asc) {
      _id,
      "name": coalesce(name.${locale === "ua" ? "uk" : locale}, name.uk),
      ${localeField("role", locale)},
      ${localeField("experience", locale)},
      "specialties": coalesce(specialties.${locale === "ua" ? "uk" : locale}, specialties.uk),
      "photoCard": photoCard.asset->url,
      "photoModal": photoModal.asset->url,
      "cardPosition": cardPosition,
      "modalPosition": modalPosition,
    }`
  );
}

// ---- FAQ ----
export async function getFaqItems(locale: string) {
  return sanityClient.fetch(
    `*[_type == "faq"] | order(order asc) {
      _id,
      ${localeField("question", locale)},
      ${localeField("answer", locale)},
    }`
  );
}

// ---- Site Settings ----
export async function getSiteSettings(locale: string) {
  return sanityClient.fetch(
    `*[_type == "siteSettings"][0] {
      phone1,
      phone2,
      ${localeField("address", locale)},
      instagram,
      ${localeField("hours", locale)},
    }`
  );
}
