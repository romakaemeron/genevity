"use server";

import { sql } from "@/lib/db/client";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

async function uploadImage(file: File | null, folder: string, currentUrl?: string): Promise<string | null> {
  if (!file || file.size === 0) return currentUrl || null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "webp";
  const result = await put(`${folder}/${randomUUID()}.${ext}`, buffer, { access: "public", addRandomSuffix: false });
  return result.url;
}

export async function saveService(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string | null;
  const isNew = !id;

  const slug = formData.get("slug") as string;
  const category_id = formData.get("category_id") as string;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "h1", "summary", "procedure_length", "effect_duration", "sessions_recommended", "price_from", "price_unit", "seo_title", "seo_desc"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  const heroFile = formData.get("hero_image") as File | null;
  const currentHero = formData.get("hero_image_current") as string;
  const hero_image = await uploadImage(heroFile, "services", currentHero);

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
        seo_desc_uk, seo_desc_ru, seo_desc_en)
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
        ${fields.seo_desc_uk}, ${fields.seo_desc_ru}, ${fields.seo_desc_en})
    `;
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
        seo_desc_uk = ${fields.seo_desc_uk}, seo_desc_ru = ${fields.seo_desc_ru}, seo_desc_en = ${fields.seo_desc_en}
      WHERE id = ${id}
    `;
  }

  revalidatePath("/");
  redirect("/services");
}

export async function deleteService(id: string) {
  await sql`DELETE FROM content_sections WHERE owner_type = 'service' AND owner_id = ${id}`;
  await sql`DELETE FROM faq_items WHERE owner_type = 'service' AND owner_id = ${id}`;
  await sql`DELETE FROM services WHERE id = ${id}`;
  revalidatePath("/");
  redirect("/services");
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
