"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { processAndUploadImage, processUploadOrKeep, uploadRawOrKeep } from "./upload";
import { logChange } from "@/lib/audit";

/**
 * Slugify a Ukrainian/Latin string into a URL-safe lowercase slug.
 * Converts Ukrainian Cyrillic to Latin via a simple transliteration table
 * so the resulting URL is consistent with the site's other slugs.
 */
function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh",
    з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
    о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu", я: "ia", "'": "", "’": "",
    ы: "y", ъ: "", э: "e",
  };
  return input
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "service";
}

/**
 * Creates a skeleton service row with just the fields the "Add service" screen
 * collects (UA title + category), auto-generates a slug, and redirects to the
 * full page editor where the admin fills everything else in.
 */
export async function createDraftService(_prevState: any, formData: FormData) {
  const title_uk = (formData.get("title_uk") as string | null)?.trim();
  const category_id = formData.get("category_id") as string | null;

  if (!title_uk) return { error: "Service title (UA) is required." };
  if (!category_id) return { error: "Category is required." };

  // Guarantee (slug, category_id) uniqueness — append -2, -3… if needed
  const baseSlug = slugify(title_uk);
  let slug = baseSlug;
  for (let i = 2; i < 100; i++) {
    const existing = await sql`SELECT 1 FROM services WHERE slug = ${slug} AND category_id = ${category_id} LIMIT 1`;
    if (existing.length === 0) break;
    slug = `${baseSlug}-${i}`;
  }

  const newId = randomUUID();
  await sql`
    INSERT INTO services (id, slug, category_id, title_uk)
    VALUES (${newId}, ${slug}, ${category_id}, ${title_uk})
  `;
  revalidatePath("/");
  redirect(`/admin/pages/services/${newId}`);
}

export async function saveService(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string | null;
  const isNew = !id;

  const slug = formData.get("slug") as string;
  const category_id = formData.get("category_id") as string;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "h1", "summary", "procedure_length", "effect_duration", "sessions_recommended", "price_from", "price_unit", "seo_title", "seo_desc", "seo_keywords"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  const heroFile = formData.get("hero_image") as File | null;
  const currentHero = formData.get("hero_image_current") as string;
  const hero_image = await processUploadOrKeep(heroFile, "services", currentHero);

  const ogFile = formData.get("seo_og_image") as File | null;
  const currentOg = formData.get("seo_og_image_current") as string;
  // OG images are uploaded raw so Facebook / LinkedIn / Twitter crawlers
  // reliably render them (their WebP support is inconsistent).
  const seo_og_image = await uploadRawOrKeep(ogFile, "services", currentOg);
  const seo_noindex = formData.get("seo_noindex") === "on";

  const logAfter = { slug, category_id, sort_order, ...fields };

  let logBefore: Record<string, any> | null = null;
  if (!isNew) {
    const beforeRows = await sql`
      SELECT slug, category_id, sort_order,
        title_uk, title_ru, title_en, h1_uk, h1_ru, h1_en,
        summary_uk, summary_ru, summary_en,
        procedure_length_uk, procedure_length_ru, procedure_length_en,
        effect_duration_uk, effect_duration_ru, effect_duration_en,
        sessions_recommended_uk, sessions_recommended_ru, sessions_recommended_en,
        price_from_uk, price_from_ru, price_from_en,
        price_unit_uk, price_unit_ru, price_unit_en,
        seo_title_uk, seo_title_ru, seo_title_en,
        seo_desc_uk, seo_desc_ru, seo_desc_en,
        seo_keywords_uk, seo_keywords_ru, seo_keywords_en
      FROM services WHERE id = ${id}
    `;
    logBefore = beforeRows[0] ?? null;
  }

  if (isNew) {
    const newId = randomUUID();
    await sql`
      INSERT INTO services (id, slug, category_id, sort_order, hero_image,
        title_uk, title_ru, title_en, h1_uk, h1_ru, h1_en,
        summary_uk, summary_ru, summary_en,
        procedure_length_uk, procedure_length_ru, procedure_length_en,
        effect_duration_uk, effect_duration_ru, effect_duration_en,
        sessions_recommended_uk, sessions_recommended_ru, sessions_recommended_en,
        price_from_uk, price_from_ru, price_from_en,
        price_unit_uk, price_unit_ru, price_unit_en,
        seo_title_uk, seo_title_ru, seo_title_en,
        seo_desc_uk, seo_desc_ru, seo_desc_en,
        seo_keywords_uk, seo_keywords_ru, seo_keywords_en,
        seo_og_image, seo_noindex)
      VALUES (${newId}, ${slug}, ${category_id}, ${sort_order}, ${hero_image},
        ${fields.title_uk}, ${fields.title_ru}, ${fields.title_en},
        ${fields.h1_uk}, ${fields.h1_ru}, ${fields.h1_en},
        ${fields.summary_uk}, ${fields.summary_ru}, ${fields.summary_en},
        ${fields.procedure_length_uk}, ${fields.procedure_length_ru}, ${fields.procedure_length_en},
        ${fields.effect_duration_uk}, ${fields.effect_duration_ru}, ${fields.effect_duration_en},
        ${fields.sessions_recommended_uk}, ${fields.sessions_recommended_ru}, ${fields.sessions_recommended_en},
        ${fields.price_from_uk}, ${fields.price_from_ru}, ${fields.price_from_en},
        ${fields.price_unit_uk}, ${fields.price_unit_ru}, ${fields.price_unit_en},
        ${fields.seo_title_uk}, ${fields.seo_title_ru}, ${fields.seo_title_en},
        ${fields.seo_desc_uk}, ${fields.seo_desc_ru}, ${fields.seo_desc_en},
        ${fields.seo_keywords_uk}, ${fields.seo_keywords_ru}, ${fields.seo_keywords_en},
        ${seo_og_image}, ${seo_noindex})
    `;
    await logChange({ action: "create", entityType: "service", entityId: newId, entityLabel: fields.title_uk ?? slug, after: logAfter });
    revalidatePath("/");
    redirect(`/admin/pages/services/${newId}`);
  } else {
    await sql`
      UPDATE services SET
        slug = ${slug}, category_id = ${category_id}, sort_order = ${sort_order}, hero_image = ${hero_image},
        title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
        h1_uk = ${fields.h1_uk}, h1_ru = ${fields.h1_ru}, h1_en = ${fields.h1_en},
        summary_uk = ${fields.summary_uk}, summary_ru = ${fields.summary_ru}, summary_en = ${fields.summary_en},
        procedure_length_uk = ${fields.procedure_length_uk}, procedure_length_ru = ${fields.procedure_length_ru}, procedure_length_en = ${fields.procedure_length_en},
        effect_duration_uk = ${fields.effect_duration_uk}, effect_duration_ru = ${fields.effect_duration_ru}, effect_duration_en = ${fields.effect_duration_en},
        sessions_recommended_uk = ${fields.sessions_recommended_uk}, sessions_recommended_ru = ${fields.sessions_recommended_ru}, sessions_recommended_en = ${fields.sessions_recommended_en},
        price_from_uk = ${fields.price_from_uk}, price_from_ru = ${fields.price_from_ru}, price_from_en = ${fields.price_from_en},
        price_unit_uk = ${fields.price_unit_uk}, price_unit_ru = ${fields.price_unit_ru}, price_unit_en = ${fields.price_unit_en},
        seo_title_uk = ${fields.seo_title_uk}, seo_title_ru = ${fields.seo_title_ru}, seo_title_en = ${fields.seo_title_en},
        seo_desc_uk = ${fields.seo_desc_uk}, seo_desc_ru = ${fields.seo_desc_ru}, seo_desc_en = ${fields.seo_desc_en},
        seo_keywords_uk = ${fields.seo_keywords_uk}, seo_keywords_ru = ${fields.seo_keywords_ru}, seo_keywords_en = ${fields.seo_keywords_en},
        seo_og_image = ${seo_og_image}, seo_noindex = ${seo_noindex}
      WHERE id = ${id}
    `;
    await logChange({ action: "update", entityType: "service", entityId: id!, entityLabel: fields.title_uk ?? slug, before: logBefore, after: logAfter });
    revalidatePath("/");
    return { success: true };
  }
}

/**
 * Persist an admin-chosen block order for a service detail page. Valid entries:
 *   - one of the fixed keys: faq | doctors | equipment | relatedServices | finalCTA
 *   - section:<uuid> — references an individual content_sections row
 * Unknown keys are filtered defensively before write; template also re-validates.
 */
export async function saveServiceBlockOrder(serviceId: string, order: string[]) {
  const FIXED = new Set(["faq", "doctors", "equipment", "relatedServices", "finalCTA"]);
  const cleaned = order.filter((k) => FIXED.has(k) || k.startsWith("section:"));
  await sql`UPDATE services SET block_order = ${cleaned} WHERE id = ${serviceId}`;
  revalidatePath("/");
  return { ok: true };
}

/**
 * Apply the structural layout of one service to every service in the DB.
 * Extracts the pattern (sections-as-group + static key order) from `templateOrder`,
 * then rebuilds each service's block_order using their own section IDs (by sort_order).
 */
export async function applyLayoutToAllServices(templateOrder: string[], skipServiceId?: string) {
  const FIXED = new Set(["faq", "doctors", "equipment", "relatedServices", "finalCTA"]);

  // Build structural pattern: collapse all section:* into a single __S__ marker
  const pattern: string[] = [];
  let sectionGroupAdded = false;
  for (const key of templateOrder) {
    if (key.startsWith("section:")) {
      if (!sectionGroupAdded) { pattern.push("__S__"); sectionGroupAdded = true; }
    } else if (FIXED.has(key)) {
      pattern.push(key);
    }
  }
  if (!sectionGroupAdded) pattern.unshift("__S__");

  console.log("[applyLayoutToAllServices] pattern=", pattern, "skipServiceId=", skipServiceId);
  const services = await sql`SELECT id FROM services`;
  console.log("[applyLayoutToAllServices] total services=", services.length);
  let updated = 0;
  for (const svc of services) {
    // Skip the source service — its exact order was already saved by saveServiceBlockOrder.
    if (skipServiceId && svc.id === skipServiceId) { console.log("[applyLayoutToAllServices] skipping", svc.id); continue; }
    const sectionRows = await sql`
      SELECT id FROM content_sections
      WHERE owner_type = 'service' AND owner_id = ${svc.id}
      ORDER BY sort_order
    `;
    const sectionIds = sectionRows.map((s) => `section:${s.id as string}`);
    const newOrder = pattern.flatMap((k) => (k === "__S__" ? sectionIds : [k]));
    console.log("[applyLayoutToAllServices] updating", svc.id, "newOrder=", newOrder);
    await sql`UPDATE services SET block_order = ${newOrder} WHERE id = ${svc.id}`;
    updated++;
  }
  console.log("[applyLayoutToAllServices] done, updated=", updated);

  revalidatePath("/");
  return { ok: true, updated };
}

/** Upload a service asset (e.g. Final CTA background) to Vercel Blob and
 *  return its URL. Processed through the standard WebP pipeline. */
export async function uploadServiceImage(formData: FormData): Promise<{ url: string }> {
  const file = formData.get("file") as File;
  const url = await processAndUploadImage(file, "services");
  if (!url) throw new Error("No file");
  return { url };
}

export type LocaleString = { uk?: string; ru?: string; en?: string };
export type ServiceBlockHeadingsInput = {
  faq?: LocaleString;
  doctors?: LocaleString;
  equipment?: LocaleString;
  relatedServices?: LocaleString;
  finalCTA?: LocaleString;
};
export type ServiceFinalCtaInput = {
  bgType?: "color" | "image" | null;
  bgColor?: string | null;
  bgImage?: string | null;
  bgFocalPoint?: string | null;
  heading?: LocaleString | null;
  subtitle?: LocaleString | null;
  buttonText?: LocaleString | null;
};

/** Strip empty-string values from a LocaleString so the JSONB stays compact
 *  and `pickLocalized` on read reliably returns undefined for "no override". */
function cleanLocaleString(v: LocaleString | undefined): LocaleString | undefined {
  if (!v) return undefined;
  const out: LocaleString = {};
  for (const l of ["uk", "ru", "en"] as const) {
    const val = v[l];
    if (typeof val === "string" && val.trim().length > 0) out[l] = val.trim();
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Persist per-service heading overrides for the four reorderable blocks
 *  (faq, doctors, equipment, relatedServices). Lives on the Layout tab. */
export async function saveServiceOverrides(
  serviceId: string,
  headings: ServiceBlockHeadingsInput,
) {
  const cleanedHeadings: ServiceBlockHeadingsInput = {};
  for (const k of ["faq", "doctors", "equipment", "relatedServices"] as const) {
    const cleaned = cleanLocaleString(headings[k]);
    if (cleaned) cleanedHeadings[k] = cleaned;
  }
  const headingsJson = Object.keys(cleanedHeadings).length > 0 ? JSON.stringify(cleanedHeadings) : null;
  await sql`UPDATE services SET block_headings = ${headingsJson}::jsonb WHERE id = ${serviceId}`;
  revalidatePath("/");
  return { ok: true };
}

/** Persist Final CTA content + background. Lives on the Sections tab. */
export async function saveFinalCtaData(serviceId: string, finalCta: ServiceFinalCtaInput) {
  const bgType = finalCta.bgType === "color" || finalCta.bgType === "image" ? finalCta.bgType : null;
  const cleanedCta: Record<string, unknown> = {
    bgType,
    bgColor: bgType === "color" && finalCta.bgColor ? finalCta.bgColor.trim() : null,
    bgImage: bgType === "image" && finalCta.bgImage ? finalCta.bgImage.trim() : null,
    bgFocalPoint: bgType === "image" && finalCta.bgFocalPoint ? finalCta.bgFocalPoint.trim() : null,
  };
  for (const f of ["heading", "subtitle", "buttonText"] as const) {
    const cleaned = cleanLocaleString(finalCta[f] as LocaleString | undefined);
    if (cleaned) cleanedCta[f] = cleaned;
  }
  const hasData = cleanedCta.bgType || cleanedCta.bgColor || cleanedCta.bgImage
    || cleanedCta.heading || cleanedCta.subtitle || cleanedCta.buttonText;
  const ctaJson = hasData ? JSON.stringify(cleanedCta) : null;
  await sql`UPDATE services SET final_cta = ${ctaJson}::jsonb WHERE id = ${serviceId}`;
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFinalCta(serviceId: string) {
  await sql`UPDATE services SET final_cta = NULL, block_order = array_remove(block_order, 'finalCTA') WHERE id = ${serviceId}`;
  revalidatePath("/");
  return { ok: true };
}

export async function deleteService(id: string) {
  const rows = await sql`SELECT title_uk FROM services WHERE id = ${id}`;
  await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${id}`;
  await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${id}`;
  await sql`DELETE FROM services WHERE id = ${id}`;
  await logChange({ action: "delete", entityType: "service", entityId: id, entityLabel: rows[0]?.title_uk ?? id });
  revalidatePath("/");
  redirect("/admin/pages");
}

export async function saveSections(serviceId: string, ownerType: string, sections: { type: string; data: any }[]) {
  // Delete existing, insert new
  await sql`DELETE FROM content_sections WHERE owner_type = ${ownerType} AND owner_id = ${serviceId}`;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    await sql`
      INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
      VALUES (${ownerType}, ${serviceId}, ${i}, ${s.type}::section_type, ${JSON.stringify(s.data)}::jsonb)
    `;
  }
  revalidatePath("/");
}

export async function saveFaq(ownerId: string, ownerType: string, items: { question_uk: string; question_ru: string; question_en: string; answer_uk: string; answer_ru: string; answer_en: string }[]) {
  await sql`DELETE FROM faq_items WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}`;
  for (let i = 0; i < items.length; i++) {
    const f = items[i];
    await sql`
      INSERT INTO faq_items (owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
      VALUES (${ownerType}, ${ownerId}, ${i}, ${f.question_uk}, ${f.question_ru}, ${f.question_en}, ${f.answer_uk}, ${f.answer_ru}, ${f.answer_en})
    `;
  }
  revalidatePath("/");
}
