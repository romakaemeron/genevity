"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { processUploadOrKeep, uploadRawOrKeep } from "./upload";

export async function saveCategory(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string;

  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "summary", "seo_title", "seo_desc", "seo_keywords"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  const heroFile = formData.get("hero_image") as File | null;
  const currentHero = formData.get("hero_image_current") as string;
  const hero_image = await processUploadOrKeep(heroFile, "categories", currentHero);

  const ogFile = formData.get("seo_og_image") as File | null;
  const currentOg = formData.get("seo_og_image_current") as string;
  // OG images upload raw — social crawlers prefer JPEG/PNG over WebP
  const seo_og_image = await uploadRawOrKeep(ogFile, "categories", currentOg);
  const seo_noindex = formData.get("seo_noindex") === "on";
  const applyOgToServices = formData.get("apply_og_to_services") === "on";

  const icon_key = formData.get("icon_key") as string || null;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  await sql`
    UPDATE service_categories SET
      hero_image = ${hero_image}, icon_key = ${icon_key}, sort_order = ${sort_order},
      title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
      summary_uk = ${fields.summary_uk}, summary_ru = ${fields.summary_ru}, summary_en = ${fields.summary_en},
      seo_title_uk = ${fields.seo_title_uk}, seo_title_ru = ${fields.seo_title_ru}, seo_title_en = ${fields.seo_title_en},
      seo_desc_uk = ${fields.seo_desc_uk}, seo_desc_ru = ${fields.seo_desc_ru}, seo_desc_en = ${fields.seo_desc_en},
      seo_keywords_uk = ${fields.seo_keywords_uk}, seo_keywords_ru = ${fields.seo_keywords_ru}, seo_keywords_en = ${fields.seo_keywords_en},
      seo_og_image = ${seo_og_image}, seo_noindex = ${seo_noindex}
    WHERE id = ${id}
  `;

  // Cascade to every service under this category when the admin asked for it
  if (applyOgToServices && seo_og_image) {
    await sql`UPDATE services SET seo_og_image = ${seo_og_image} WHERE category_id = ${id}`;
  }

  revalidatePath("/");
  return { success: true };
}
