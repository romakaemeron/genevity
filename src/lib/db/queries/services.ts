import { sql } from "../client";
import type {
  ServiceData,
  ServiceCardData,
  DoctorItem,
  EquipmentItem,
  ServiceBlockHeadings,
  ServiceFinalCta,
} from "../types";
import { getSections, getFaqItems } from "./sections";

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: any, field: string, l: string) {
  return row[`${field}_${l}`] ?? row[`${field}_uk`] ?? null;
}

/** Resolve a `{uk, ru, en}` localized value to the request locale with UA
 *  fallback. Returns undefined when the entry is missing or blank so the
 *  template can cleanly fall back to the global ui_strings label. */
function pickLocalized(v: unknown, l: string): string | undefined {
  if (!v || typeof v !== "object") return undefined;
  const obj = v as Record<string, unknown>;
  const raw = obj[l] ?? obj.uk;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveBlockHeadings(raw: unknown, l: string): ServiceBlockHeadings {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as Record<string, unknown>;
  return {
    faq: pickLocalized(src.faq, l),
    doctors: pickLocalized(src.doctors, l),
    equipment: pickLocalized(src.equipment, l),
    relatedServices: pickLocalized(src.relatedServices, l),
    finalCTA: pickLocalized(src.finalCTA, l),
  };
}

function resolveFinalCta(raw: unknown): ServiceFinalCta {
  if (!raw || typeof raw !== "object") {
    return { bgType: null, bgColor: null, bgImage: null, bgFocalPoint: null };
  }
  const src = raw as Record<string, unknown>;
  const bgType = src.bgType === "color" || src.bgType === "image" ? src.bgType : null;
  return {
    bgType,
    bgColor: typeof src.bgColor === "string" && src.bgColor.trim() ? src.bgColor.trim() : null,
    bgImage: typeof src.bgImage === "string" && src.bgImage.trim() ? src.bgImage.trim() : null,
    bgFocalPoint:
      typeof src.bgFocalPoint === "string" && src.bgFocalPoint.trim() ? src.bgFocalPoint.trim() : null,
  };
}

export async function getServiceBySlug(
  locale: string,
  categorySlug: string,
  serviceSlug: string,
): Promise<ServiceData | null> {
  const l = lang(locale);

  const rows = await sql`
    SELECT s.*, c.slug AS cat_slug, c.id AS cat_id,
           c.title_uk AS cat_title_uk, c.title_ru AS cat_title_ru, c.title_en AS cat_title_en
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = ${serviceSlug} AND c.slug = ${categorySlug}
    LIMIT 1
  `;
  if (!rows.length) return null;
  const r = rows[0];

  const [sections, faq, relatedDoctors, relatedServices, relatedEquipment] = await Promise.all([
    getSections("service", r.id, l),
    getFaqItems("service", r.id, l),
    getRelatedDoctors(r.id, l),
    getRelatedServices(r.id, l),
    getRelatedEquipment(r.id, l),
  ]);

  return {
    _id: r.id,
    title: pick(r, "title", l) || "",
    h1: pick(r, "h1", l) || pick(r, "title", l) || "",
    slug: r.slug,
    category: {
      _id: r.cat_id,
      slug: r.cat_slug,
      title: pick(r, "cat_title", l) || "",
    },
    summary: pick(r, "summary", l) || "",
    heroImage: r.hero_image,
    procedureLength: pick(r, "procedure_length", l),
    effectDuration: pick(r, "effect_duration", l),
    sessionsRecommended: pick(r, "sessions_recommended", l),
    priceFrom: pick(r, "price_from", l),
    priceUnit: pick(r, "price_unit", l),
    seoTitle: pick(r, "seo_title", l),
    seoDescription: pick(r, "seo_desc", l),
    seoKeywords: pick(r, "seo_keywords", l),
    sections,
    faq,
    relatedDoctors,
    relatedServices,
    relatedEquipment,
    blockOrder: (r.block_order as string[] | null) || null,
    blockHeadings: resolveBlockHeadings(r.block_headings, l),
    finalCta: resolveFinalCta(r.final_cta),
  };
}

async function getRelatedDoctors(serviceId: string, l: string): Promise<DoctorItem[]> {
  const rows = await sql`
    SELECT d.*
    FROM doctors d
    JOIN service_doctors sd ON d.id = sd.doctor_id
    WHERE sd.service_id = ${serviceId}
    ORDER BY sd.sort_order
  `;
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

async function getRelatedServices(serviceId: string, l: string): Promise<ServiceData["relatedServices"]> {
  const rows = await sql`
    SELECT s.id, s.slug, s.hero_image,
           s.title_uk, s.title_ru, s.title_en,
           s.summary_uk, s.summary_ru, s.summary_en,
           s.price_from_uk, s.price_from_ru, s.price_from_en,
           c.slug AS category_slug
    FROM services s
    JOIN service_related sr ON s.id = sr.related_service_id
    JOIN service_categories c ON s.category_id = c.id
    WHERE sr.service_id = ${serviceId}
    ORDER BY sr.sort_order
  `;
  return rows.map((r) => ({
    _id: r.id,
    title: pick(r, "title", l) || "",
    slug: r.slug,
    summary: pick(r, "summary", l) || "",
    heroImage: r.hero_image,
    priceFrom: pick(r, "price_from", l),
    categorySlug: r.category_slug,
  }));
}

/**
 * Fetch equipment linked to a service. Returns full `EquipmentItem` data so
 * the service detail page can render the same card + modal UI as the homepage.
 */
async function getRelatedEquipment(serviceId: string, l: string): Promise<EquipmentItem[]> {
  const rows = await sql`
    SELECT e.*
    FROM equipment e
    JOIN service_equipment se ON e.id = se.equipment_id
    WHERE se.service_id = ${serviceId}
    ORDER BY se.sort_order
  `;
  return rows.map((r) => ({
    _id: r.id,
    category: r.category,
    name: r.name,
    shortDescription: pick(r, "short_description", l) || "",
    description: pick(r, "description", l) || "",
    suits: (r as any)[`suits_${l}`] || r.suits_uk || [],
    results: (r as any)[`results_${l}`] || r.results_uk || [],
    note: pick(r, "note", l) || "",
    photo: r.photo,
  }));
}

export async function getServicesByCategory(locale: string, categorySlug: string): Promise<ServiceCardData[]> {
  const l = lang(locale);
  const rows = await sql`
    SELECT s.id, s.slug, s.hero_image,
           s.title_uk, s.title_ru, s.title_en,
           s.summary_uk, s.summary_ru, s.summary_en,
           s.price_from_uk, s.price_from_ru, s.price_from_en,
           c.slug AS category_slug
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE c.slug = ${categorySlug}
    ORDER BY s.sort_order
  `;
  return rows.map((r) => ({
    _id: r.id,
    title: pick(r, "title", l) || "",
    slug: r.slug,
    summary: pick(r, "summary", l) || "",
    heroImage: r.hero_image,
    categorySlug: r.category_slug,
    priceFrom: pick(r, "price_from", l),
  }));
}

export async function getAllServiceSlugs(): Promise<{ slug: string; categorySlug: string }[]> {
  const rows = await sql`
    SELECT s.slug, c.slug AS category_slug
    FROM services s
    JOIN service_categories c ON s.category_id = c.id
  `;
  return rows.map((r) => ({ slug: r.slug, categorySlug: r.category_slug }));
}
