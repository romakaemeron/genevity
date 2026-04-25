"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { uploadRawOrKeep } from "./upload";
import { logChange } from "@/lib/audit";

// These seeded slugs are structural — the routes, DB data, and admin loader
// all assume they exist. Refuse to delete or rename them even if the UI is bypassed.
const PROTECTED_SLUGS = new Set([
  "home", "about", "contacts", "doctors", "prices",
  "stationary", "laboratory", "services",
]);

export async function saveStaticPage(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string | null;
  const isNew = !id;
  let slug = formData.get("slug") as string;

  if (!slug) return { error: "Slug is required" };

  // Protect core-page slugs: ignore any attempt to rename them via this action
  if (!isNew) {
    const existing = await sql`SELECT slug FROM static_pages WHERE id = ${id}`;
    const currentSlug = existing[0]?.slug as string | undefined;
    if (currentSlug && PROTECTED_SLUGS.has(currentSlug) && slug !== currentSlug) {
      slug = currentSlug;
    }
  }

  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "h1", "summary", "seo_title", "seo_desc", "seo_keywords"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  // Title_uk is mandatory — everywhere else in the app (breadcrumbs, admin lists,
  // Page Texts namespace) falls back to it, so NULL would produce blank UI.
  if (!fields.title_uk || !String(fields.title_uk).trim()) {
    return { error: "Ukrainian title is required." };
  }

  const ogFile = formData.get("seo_og_image") as File | null;
  const currentOg = formData.get("seo_og_image_current") as string;
  // OG images upload raw — social crawlers prefer JPEG/PNG over WebP
  const og = await uploadRawOrKeep(ogFile, "pages", currentOg);
  const noindex = formData.get("seo_noindex") === "on";

  const logAfter = { slug, title_uk: fields.title_uk, title_ru: fields.title_ru, title_en: fields.title_en, h1_uk: fields.h1_uk, seo_title_uk: fields.seo_title_uk };

  let logBefore: Record<string, any> | null = null;
  if (!isNew) {
    const beforeRows = await sql`SELECT slug, title_uk, title_ru, title_en, h1_uk, seo_title_uk FROM static_pages WHERE id = ${id}`;
    logBefore = beforeRows[0] ?? null;
  }

  if (isNew) {
    const newId = randomUUID();
    await sql`
      INSERT INTO static_pages (id, slug,
        title_uk, title_ru, title_en,
        h1_uk, h1_ru, h1_en,
        summary_uk, summary_ru, summary_en,
        seo_title_uk, seo_title_ru, seo_title_en,
        seo_desc_uk, seo_desc_ru, seo_desc_en,
        seo_keywords_uk, seo_keywords_ru, seo_keywords_en,
        seo_og_image, seo_noindex)
      VALUES (${newId}, ${slug},
        ${fields.title_uk}, ${fields.title_ru}, ${fields.title_en},
        ${fields.h1_uk}, ${fields.h1_ru}, ${fields.h1_en},
        ${fields.summary_uk}, ${fields.summary_ru}, ${fields.summary_en},
        ${fields.seo_title_uk}, ${fields.seo_title_ru}, ${fields.seo_title_en},
        ${fields.seo_desc_uk}, ${fields.seo_desc_ru}, ${fields.seo_desc_en},
        ${fields.seo_keywords_uk}, ${fields.seo_keywords_ru}, ${fields.seo_keywords_en},
        ${og}, ${noindex})
    `;
    await logChange({ action: "create", entityType: "static_page", entityId: newId, entityLabel: fields.title_uk ?? slug, after: logAfter });
    revalidatePath("/");
    redirect(`/admin/pages/${slug}`);
  } else {
    await sql`
      UPDATE static_pages SET
        slug = ${slug},
        title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
        h1_uk = ${fields.h1_uk}, h1_ru = ${fields.h1_ru}, h1_en = ${fields.h1_en},
        summary_uk = ${fields.summary_uk}, summary_ru = ${fields.summary_ru}, summary_en = ${fields.summary_en},
        seo_title_uk = ${fields.seo_title_uk}, seo_title_ru = ${fields.seo_title_ru}, seo_title_en = ${fields.seo_title_en},
        seo_desc_uk = ${fields.seo_desc_uk}, seo_desc_ru = ${fields.seo_desc_ru}, seo_desc_en = ${fields.seo_desc_en},
        seo_keywords_uk = ${fields.seo_keywords_uk}, seo_keywords_ru = ${fields.seo_keywords_ru}, seo_keywords_en = ${fields.seo_keywords_en},
        seo_og_image = ${og}, seo_noindex = ${noindex}
      WHERE id = ${id}
    `;
    await logChange({ action: "update", entityType: "static_page", entityId: id!, entityLabel: fields.title_uk ?? slug, before: logBefore, after: logAfter });
    revalidatePath("/");
    return { success: true };
  }
}

export async function deleteStaticPage(id: string) {
  const rows = await sql`SELECT slug, title_uk FROM static_pages WHERE id = ${id}`;
  const slug = rows[0]?.slug as string | undefined;
  if (slug && PROTECTED_SLUGS.has(slug)) {
    throw new Error(`"${slug}" is a core page and cannot be deleted`);
  }
  await sql`DELETE FROM content_sections WHERE owner_type = 'static_page' AND owner_id = ${id}`;
  await sql`DELETE FROM faq_items WHERE owner_type = 'static_page' AND owner_id = ${id}`;
  await sql`DELETE FROM static_pages WHERE id = ${id}`;
  await logChange({ action: "delete", entityType: "static_page", entityId: id, entityLabel: rows[0]?.title_uk ?? slug ?? id });
  revalidatePath("/");
  redirect("/admin/pages");
}
