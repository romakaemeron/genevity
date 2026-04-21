"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function saveHero(_prevState: any, formData: FormData) {
  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "subtitle", "cta", "location"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  await sql`
    UPDATE hero SET
      title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
      subtitle_uk = ${fields.subtitle_uk}, subtitle_ru = ${fields.subtitle_ru}, subtitle_en = ${fields.subtitle_en},
      cta_uk = ${fields.cta_uk}, cta_ru = ${fields.cta_ru}, cta_en = ${fields.cta_en},
      location_uk = ${fields.location_uk}, location_ru = ${fields.location_ru}, location_en = ${fields.location_en}
    WHERE id = 1
  `;

  revalidatePath("/");
  return { success: true };
}

export async function saveAbout(_prevState: any, formData: FormData) {
  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "text1", "text2", "diagnostics"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  await sql`
    UPDATE about SET
      title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
      text1_uk = ${fields.text1_uk}, text1_ru = ${fields.text1_ru}, text1_en = ${fields.text1_en},
      text2_uk = ${fields.text2_uk}, text2_ru = ${fields.text2_ru}, text2_en = ${fields.text2_en},
      diagnostics_uk = ${fields.diagnostics_uk}, diagnostics_ru = ${fields.diagnostics_ru}, diagnostics_en = ${fields.diagnostics_en}
    WHERE id = 1
  `;

  revalidatePath("/");
  return { success: true };
}

export async function saveSiteSettings(_prevState: any, formData: FormData) {
  const phone1 = formData.get("phone1") as string;
  const phone2 = formData.get("phone2") as string;
  const instagram = formData.get("instagram") as string;
  const maps_url = formData.get("maps_url") as string;
  const address_uk = formData.get("address_uk") as string;
  const address_ru = formData.get("address_ru") as string;
  const address_en = formData.get("address_en") as string;
  const hours_uk = formData.get("hours_uk") as string;
  const hours_ru = formData.get("hours_ru") as string;
  const hours_en = formData.get("hours_en") as string;

  await sql`
    UPDATE site_settings SET
      phone1 = ${phone1}, phone2 = ${phone2}, instagram = ${instagram}, maps_url = ${maps_url},
      address_uk = ${address_uk}, address_ru = ${address_ru}, address_en = ${address_en},
      hours_uk = ${hours_uk}, hours_ru = ${hours_ru}, hours_en = ${hours_en}
    WHERE id = 1
  `;

  revalidatePath("/");
  return { success: true };
}
