import { sql } from "../client";
import type { HomepageData, HeroData, AboutData, SiteSettingsData, UiStringsData, EquipmentItem, DoctorItem, FaqItem } from "../types";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }

function pick<T>(row: any, field: string, l: string): T {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

export async function getHomepageData(locale: string): Promise<HomepageData> {
  const l = lang(locale);
  const [equipment, doctors, faq, hero, about, settings, ui] = await Promise.all([
    getEquipment(l),
    getDoctors(l),
    getFaq(l),
    getHero(l),
    getAbout(l),
    getSiteSettings(l),
    getUiStrings(l),
  ]);
  return { equipment, doctors, faq, hero, about, settings, ui };
}

async function getEquipment(l: string): Promise<EquipmentItem[]> {
  const rows = await sql`SELECT * FROM equipment ORDER BY sort_order`;
  return rows.map((r) => ({
    _id: r.id,
    category: r.category,
    name: r.name,
    shortDescription: pick(r, "short_description", l),
    description: pick(r, "description", l),
    suits: (r as any)[`suits_${l}`] || r.suits_uk || [],
    results: (r as any)[`results_${l}`] || r.results_uk || [],
    note: pick(r, "note", l),
    photo: r.photo,
  }));
}

async function getDoctors(l: string): Promise<DoctorItem[]> {
  const rows = await sql`SELECT * FROM doctors ORDER BY sort_order`;
  return rows.map((r) => ({
    _id: r.id,
    name: pick(r, "name", l),
    role: pick(r, "role", l),
    experience: pick(r, "experience", l),
    specialties: (r as any)[`specialties_${l}`] || r.specialties_uk || [],
    photoCard: r.photo_card,
    photoModal: r.photo_full,
    cardPosition: r.card_position || "center center",
    modalPosition: r.modal_position || r.card_position || "center center",
  }));
}

async function getFaq(l: string): Promise<FaqItem[]> {
  const rows = await sql`
    SELECT * FROM faq_items
    WHERE owner_type = 'global'
    ORDER BY sort_order
  `;
  return rows.map((r) => ({
    _id: r.id,
    question: pick(r, "question", l),
    answer: pick(r, "answer", l),
  }));
}

async function getHero(l: string): Promise<HeroData> {
  const rows = await sql`SELECT * FROM hero WHERE id = 1`;
  const r = rows[0];
  if (!r) return { title: "", subtitle: "", cta: "", location: "" };
  return {
    title: pick(r, "title", l),
    subtitle: pick(r, "subtitle", l),
    cta: pick(r, "cta", l),
    location: pick(r, "location", l),
  };
}

async function getAbout(l: string): Promise<AboutData> {
  const rows = await sql`SELECT * FROM about WHERE id = 1`;
  const r = rows[0];
  if (!r) return { title: "", text1: "", text2: "", diagnostics: "" };
  return {
    title: pick(r, "title", l),
    text1: pick(r, "text1", l),
    text2: pick(r, "text2", l),
    diagnostics: pick(r, "diagnostics", l),
  };
}

/**
 * Build an embeddable Google Maps iframe URL from the single `maps_url` field
 * the admin configures. Supports the three shapes we see in practice:
 *
 *   1. `https://www.google.com/maps/place/<NAME>/@<LAT>,<LNG>,<ZOOM>z/...`
 *      → drops us at that exact pin by using the place name + coordinates.
 *   2. `https://www.google.com/maps/embed?pb=...` (the iframe URL copied
 *      directly from Google's "Embed a map" share dialog) → returned as-is.
 *   3. Anything else (short links, plain strings) → fall back to a textual
 *      search using the address, so the map is at least in the right city.
 *
 * Google's no-API-key embed only supports `q=<query>&output=embed`, so we
 * build that form whenever we need to synthesise a URL.
 */
function deriveMapsEmbed(mapsUrl: string, fallbackQuery: string): string {
  const trimmed = mapsUrl.trim();

  // Shape 2 — admin pasted the official embed URL
  if (/^https?:\/\/(www\.)?google\.com\/maps\/embed\?/i.test(trimmed)) {
    return trimmed;
  }

  // Shape 1 — extract place name + optional coordinates from a /maps/place/ URL
  const placeMatch = trimmed.match(/\/maps\/place\/([^/?#]+)/i);
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
    const coordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    // Combining "name @lat,lng" lets Google's embed zoom to the exact pin
    const q = coordMatch ? `${place}@${coordMatch[1]},${coordMatch[2]}` : place;
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
  }

  // Shape 3 — fall back to address-based search
  const query = (fallbackQuery || trimmed).trim();
  if (!query) return "";
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

async function getSiteSettings(l: string): Promise<SiteSettingsData> {
  const rows = await sql`SELECT * FROM site_settings WHERE id = 1`;
  const r = rows[0];
  if (!r) return {
    phone1: "", phone2: "", address: "", instagram: "", hours: "",
    mapsUrl: "", mapsEmbedUrl: "", ogImage: "/og/genevity-og.jpg",
  };
  const address = (pick(r, "address", l) as string) || "";
  const mapsUrl = (r.maps_url as string) || "";
  return {
    phone1: r.phone1 || "",
    phone2: r.phone2 || "",
    address,
    instagram: r.instagram || "",
    hours: pick(r, "hours", l),
    mapsUrl,
    mapsEmbedUrl: deriveMapsEmbed(mapsUrl, address),
    ogImage: (r.og_image as string) || "/og/genevity-og.jpg",
  };
}

async function getUiStrings(l: string): Promise<UiStringsData> {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const raw = rows[0]?.data;
  if (!raw) throw new Error("UI strings not found in database");
  const d = typeof raw === "string" ? JSON.parse(raw) : raw;

  const pick2 = (...path: string[]) => {
    let cur: any = d;
    for (const p of path) cur = cur?.[p];
    if (!cur) return "";
    return cur[l] ?? cur.uk ?? cur ?? "";
  };

  return {
    nav: {
      about: pick2("nav", "about"),
      services: pick2("nav", "services"),
      doctors: pick2("nav", "doctors"),
      contacts: pick2("nav", "contacts"),
      cta: pick2("nav", "cta"),
    },
    equipment: {
      title: pick2("equipment", "title"),
      details: pick2("equipment", "details"),
      showMore: pick2("equipment", "showMore"),
      showLess: pick2("equipment", "showLess"),
      suitsTitle: pick2("equipment", "suitsTitle"),
      resultsTitle: pick2("equipment", "resultsTitle"),
      tabs: {
        all: pick2("equipment", "tabs", "all"),
        face: pick2("equipment", "tabs", "face"),
        body: pick2("equipment", "tabs", "body"),
        skin: pick2("equipment", "tabs", "skin"),
        intimate: pick2("equipment", "tabs", "intimate"),
        laser: pick2("equipment", "tabs", "laser"),
      },
    },
    doctors: {
      title: pick2("doctors", "title"),
      subtitle: pick2("doctors", "subtitle"),
      cta: pick2("doctors", "cta"),
      experience: pick2("doctors", "experience"),
    },
    contacts: {
      title: pick2("contacts", "title"),
      instagramLabel: pick2("contacts", "instagramLabel"),
    },
    ctaForm: {
      title: pick2("ctaForm", "title"),
      titleAlt: pick2("ctaForm", "titleAlt"),
      name: pick2("ctaForm", "name"),
      phone: pick2("ctaForm", "phone"),
      submit: pick2("ctaForm", "submit"),
      success: pick2("ctaForm", "success"),
    },
    footer: {
      description: pick2("footer", "description"),
      license: pick2("footer", "license"),
      useful: pick2("footer", "useful"),
      contact: pick2("footer", "contact"),
      rights: pick2("footer", "rights"),
    },
    meta: {
      title: pick2("meta", "title"),
      description: pick2("meta", "description"),
    },
  };
}

export { getDoctors as getAllDoctorsRaw };
export async function getAllDoctors(locale: string): Promise<DoctorItem[]> {
  return getDoctors(lang(locale));
}

export async function getUiStringsData(locale: string): Promise<UiStringsData> {
  return getUiStrings(lang(locale));
}

export async function getSiteSettingsData(locale: string): Promise<SiteSettingsData> {
  return getSiteSettings(lang(locale));
}

export async function getAboutData(locale: string): Promise<AboutData> {
  return getAbout(lang(locale));
}
