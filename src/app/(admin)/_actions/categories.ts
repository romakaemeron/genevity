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

export async function saveCategory(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string;

  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "summary", "seo_title", "seo_desc"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  const heroFile = formData.get("hero_image") as File | null;
  const currentHero = formData.get("hero_image_current") as string;
  const hero_image = await uploadImage(heroFile, "categories", currentHero);
  const icon_key = formData.get("icon_key") as string || null;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  await sql`
    UPDATE service_categories SET
      hero_image = ${hero_image}, icon_key = ${icon_key}, sort_order = ${sort_order},
      title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
      summary_uk = ${fields.summary_uk}, summary_ru = ${fields.summary_ru}, summary_en = ${fields.summary_en},
      seo_title_uk = ${fields.seo_title_uk}, seo_title_ru = ${fields.seo_title_ru}, seo_title_en = ${fields.seo_title_en},
      seo_desc_uk = ${fields.seo_desc_uk}, seo_desc_ru = ${fields.seo_desc_ru}, seo_desc_en = ${fields.seo_desc_en}
    WHERE id = ${id}
  `;

  revalidatePath("/");
  redirect("/categories");
}
