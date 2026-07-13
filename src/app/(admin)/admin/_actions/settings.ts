"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { uploadRawOrKeep, uploadFileOrKeep, processUploadOrKeep } from "./upload";
import { logChange } from "@/lib/audit";

export async function saveHero(_prevState: any, formData: FormData) {
  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "subtitle", "cta", "location"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  const beforeRows = await sql`SELECT title_uk, title_ru, title_en, subtitle_uk, subtitle_ru, subtitle_en, cta_uk, cta_ru, cta_en, location_uk, location_ru, location_en FROM hero WHERE id = 1`;
  const before = beforeRows[0] ?? null;

  await sql`
    UPDATE hero SET
      title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
      subtitle_uk = ${fields.subtitle_uk}, subtitle_ru = ${fields.subtitle_ru}, subtitle_en = ${fields.subtitle_en},
      cta_uk = ${fields.cta_uk}, cta_ru = ${fields.cta_ru}, cta_en = ${fields.cta_en},
      location_uk = ${fields.location_uk}, location_ru = ${fields.location_ru}, location_en = ${fields.location_en}
    WHERE id = 1
  `;

  await logChange({ action: "update", entityType: "hero", entityId: "1", entityLabel: "Homepage hero", before, after: fields });
  revalidatePath("/");
  return { success: true };
}

export async function saveAbout(_prevState: any, formData: FormData) {
  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "text1", "text2", "diagnostics", "requisites", "director_name", "director_role", "stats_note"]) {
      fields[`${f}_${suffix}`] = formData.get(`${f}_${suffix}`) as string || null;
    }
  }

  const licenseFile = formData.get("license_image") as File | null;
  const currentLicense = (formData.get("license_image_current") as string) || undefined;
  const license_image = await processUploadOrKeep(licenseFile, "about", currentLicense);

  const directorPhotoFile = formData.get("director_photo") as File | null;
  const currentDirectorPhoto = (formData.get("director_photo_current") as string) || undefined;
  const director_photo = await processUploadOrKeep(directorPhotoFile, "about", currentDirectorPhoto);

  const beforeRows = await sql`SELECT title_uk, title_ru, title_en, text1_uk, text1_ru, text1_en, text2_uk, text2_ru, text2_en, diagnostics_uk, diagnostics_ru, diagnostics_en, requisites_uk, requisites_ru, requisites_en, license_image, director_photo, director_name_uk, director_name_ru, director_name_en, director_role_uk, director_role_ru, director_role_en, stats_note_uk, stats_note_ru, stats_note_en FROM about WHERE id = 1`;
  const before = beforeRows[0] ?? null;

  await sql`
    UPDATE about SET
      title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
      text1_uk = ${fields.text1_uk}, text1_ru = ${fields.text1_ru}, text1_en = ${fields.text1_en},
      text2_uk = ${fields.text2_uk}, text2_ru = ${fields.text2_ru}, text2_en = ${fields.text2_en},
      diagnostics_uk = ${fields.diagnostics_uk}, diagnostics_ru = ${fields.diagnostics_ru}, diagnostics_en = ${fields.diagnostics_en},
      requisites_uk = ${fields.requisites_uk}, requisites_ru = ${fields.requisites_ru}, requisites_en = ${fields.requisites_en},
      license_image = ${license_image}, director_photo = ${director_photo},
      director_name_uk = ${fields.director_name_uk}, director_name_ru = ${fields.director_name_ru}, director_name_en = ${fields.director_name_en},
      director_role_uk = ${fields.director_role_uk}, director_role_ru = ${fields.director_role_ru}, director_role_en = ${fields.director_role_en},
      stats_note_uk = ${fields.stats_note_uk}, stats_note_ru = ${fields.stats_note_ru}, stats_note_en = ${fields.stats_note_en}
    WHERE id = 1
  `;

  await logChange({ action: "update", entityType: "about", entityId: "1", entityLabel: "Homepage about section", before, after: { ...fields, license_image, director_photo } });
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/ru/about");
  revalidatePath("/en/about");
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

  const ogFile = formData.get("og_image") as File | null;
  const currentOg = formData.get("og_image_current") as string;
  const og_image = await uploadRawOrKeep(ogFile, "site", currentOg);

  const beforeRows = await sql`SELECT phone1, phone2, instagram, maps_url, address_uk, address_ru, address_en, hours_uk, hours_ru, hours_en FROM site_settings WHERE id = 1`;
  const before = beforeRows[0] ?? null;

  await sql`
    UPDATE site_settings SET
      phone1 = ${phone1}, phone2 = ${phone2}, instagram = ${instagram}, maps_url = ${maps_url},
      address_uk = ${address_uk}, address_ru = ${address_ru}, address_en = ${address_en},
      hours_uk = ${hours_uk}, hours_ru = ${hours_ru}, hours_en = ${hours_en},
      og_image = ${og_image}
    WHERE id = 1
  `;

  await logChange({ action: "update", entityType: "site_settings", entityId: "1", entityLabel: "Site settings", before, after: { phone1, phone2, instagram, maps_url, address_uk, address_ru, address_en, hours_uk, hours_ru, hours_en } });
  revalidatePath("/");
  return { success: true };
}

export async function savePricelistPdf(_prevState: any, formData: FormData) {
  const file = formData.get("pricelist_pdf") as File | null;
  const currentUrl = (formData.get("pricelist_pdf_current") as string) || undefined;
  const pdfUrl = await uploadFileOrKeep(file, "site", currentUrl);

  const beforeRows = await sql`SELECT pricelist_pdf FROM site_settings WHERE id = 1`;
  const before = { pricelist_pdf: beforeRows[0]?.pricelist_pdf ?? null };

  await sql`UPDATE site_settings SET pricelist_pdf = ${pdfUrl} WHERE id = 1`;
  await logChange({ action: "update", entityType: "site_settings", entityId: "1", entityLabel: "Pricelist PDF", before, after: { pricelist_pdf: pdfUrl } });
  revalidatePath("/prices");
  return { success: true };
}
