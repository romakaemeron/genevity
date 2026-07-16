"use server";

import { sql } from "@/lib/db/client";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { logChange } from "@/lib/audit";

const SCALE_MIN = 0.5;
const SCALE_MAX = 4;

/**
 * Process and upload an image:
 *   - Resize to fit within `maxDim` (longest side) preserving aspect ratio (no crop, no upscale)
 *   - Convert to WebP at quality 88
 *   - Upload to Vercel Blob, return URL
 *
 * If `file` is empty or missing, returns `currentUrl` unchanged.
 */
async function processAndUpload(
  file: File | null,
  folder: string,
  maxDim: number,
  currentUrl?: string,
): Promise<string | null> {
  if (!file || file.size === 0) return currentUrl || null;

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(inputBuffer)
    .rotate() // auto-rotate based on EXIF
    .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 5 })
    .toBuffer();

  const result = await put(`${folder}/${randomUUID()}.webp`, processed, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/webp",
  });
  return result.url;
}

/**
 * Decide how uploaded file(s) should propagate to the card / modal slots.
 *
 *   • Both files uploaded — each slot uses its own file.
 *   • Only card uploaded + modal is CURRENTLY empty — fill both from the card
 *     source (card @900px, modal @1800px) so the admin doesn't have to upload
 *     twice when starting from zero or when only one slot had a photo.
 *   • Only card uploaded + modal already has a photo — only replace card,
 *     protect the admin's existing modal photo.
 *   • Symmetric rules for modal-only uploads.
 *   • Nothing uploaded — preserve both URLs as-is.
 */
async function processPair(
  cardFile: File | null,
  modalFile: File | null,
  folder: string,
  currentCard?: string,
  currentModal?: string,
): Promise<{ card: string | null; modal: string | null }> {
  const cardSrc = cardFile && cardFile.size > 0 ? cardFile : null;
  const modalSrc = modalFile && modalFile.size > 0 ? modalFile : null;

  // Both files — each gets its own source
  if (cardSrc && modalSrc) {
    const card = await processAndUpload(cardSrc, folder, 900, currentCard);
    const modal = await processAndUpload(modalSrc, folder, 1800, currentModal);
    return { card, modal };
  }

  // Only card uploaded — fill card, plus modal IF empty
  if (cardSrc && !modalSrc) {
    const card = await processAndUpload(cardSrc, folder, 900, currentCard);
    const modal = currentModal
      ? currentModal // protect existing modal photo
      : await processAndUpload(cardSrc, folder, 1800, undefined); // fill the gap
    return { card, modal };
  }

  // Only modal uploaded — symmetric
  if (modalSrc && !cardSrc) {
    const modal = await processAndUpload(modalSrc, folder, 1800, currentModal);
    const card = currentCard
      ? currentCard
      : await processAndUpload(modalSrc, folder, 900, undefined);
    return { card, modal };
  }

  // Nothing uploaded — preserve
  return { card: currentCard || null, modal: currentModal || null };
}

export async function saveDoctor(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string | null;
  const isNew = !id;

  const name_uk = formData.get("name_uk") as string;
  const name_ru = formData.get("name_ru") as string;
  const name_en = formData.get("name_en") as string;
  const role_uk = formData.get("role_uk") as string;
  const role_ru = formData.get("role_ru") as string;
  const role_en = formData.get("role_en") as string;
  const experience_uk = formData.get("experience_uk") as string;
  const experience_ru = formData.get("experience_ru") as string;
  const experience_en = formData.get("experience_en") as string;
  const slug = (formData.get("slug") as string)?.trim().toLowerCase() || null;
  const seo_title_uk = formData.get("seo_title_uk") as string || null;
  const seo_title_ru = formData.get("seo_title_ru") as string || null;
  const seo_title_en = formData.get("seo_title_en") as string || null;
  const seo_desc_uk = formData.get("seo_desc_uk") as string || null;
  const seo_desc_ru = formData.get("seo_desc_ru") as string || null;
  const seo_desc_en = formData.get("seo_desc_en") as string || null;
  const bio_uk = formData.get("bio_uk") as string || null;
  const bio_ru = formData.get("bio_ru") as string || null;
  const bio_en = formData.get("bio_en") as string || null;
  const educationRaw = formData.get("education_json") as string;
  const certificationsRaw = formData.get("certifications_json") as string;
  let education = null, certifications = null;
  try { education = educationRaw ? JSON.parse(educationRaw) : null; } catch { education = null; }
  try { certifications = certificationsRaw ? JSON.parse(certificationsRaw) : null; } catch { certifications = null; }
  const is_published = formData.get("is_published") === "1";
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;
  const card_position = (formData.get("card_position") as string) || "center center";
  const modal_position = (formData.get("modal_position") as string) || card_position;
  // Booking-form circle thumbnail — own image + focal + zoom so a tight
  // face crop can differ from the main card photo's framing. Falls back
  // to photo_card at render time when photo_circle is null.
  const circle_focal_point = (formData.get("circle_focal_point") as string) || card_position;
  const profile_focal_point = (formData.get("profile_focal_point") as string) || "center top";
  const profileScaleRaw = parseFloat((formData.get("profile_scale") as string) || "1");
  const profile_scale = Number.isFinite(profileScaleRaw) && profileScaleRaw > 0
    ? Math.min(SCALE_MAX, Math.max(SCALE_MIN, profileScaleRaw))
    : 1;
  const circleScaleRaw = parseFloat((formData.get("circle_scale") as string) || "1");
  const circle_scale = Number.isFinite(circleScaleRaw) && circleScaleRaw > 0
    ? Math.min(5, Math.max(0.5, circleScaleRaw))
    : 1;

  const photoCardFile = formData.get("photo_card") as File | null;
  const photoFullFile = formData.get("photo_full") as File | null;
  const photoCircleFile = formData.get("photo_circle") as File | null;
  const currentCard = (formData.get("photo_card_current") as string) || undefined;
  const currentFull = (formData.get("photo_full_current") as string) || undefined;
  const currentCircle = (formData.get("photo_circle_current") as string) || undefined;

  const { card: photo_card, modal: photo_full } = await processPair(
    photoCardFile,
    photoFullFile,
    "doctors",
    currentCard,
    currentFull,
  );

  // Circle photo — optional independent slot; we resize aggressively
  // because it renders at 36 px in the booking combobox. When the field
  // is empty (`_current` hidden input holds the old URL), processAndUpload
  // returns the existing URL so clearing / keeping works naturally.
  const photo_circle = await processAndUpload(photoCircleFile, "doctors", 600, currentCircle);

  const after = {
    name_uk, name_ru, name_en,
    role_uk, role_ru, role_en,
    experience_uk, experience_ru, experience_en,
    slug,
    bio_uk: bio_uk?.slice(0, 120) ?? null,
    seo_title_uk: seo_title_uk ?? null,
    sort_order,
  };

  let before: Record<string, any> | null = null;
  if (!isNew) {
    const beforeRows = await sql`
      SELECT name_uk, name_ru, name_en, role_uk, role_ru, role_en,
             experience_uk, experience_ru, experience_en,
             slug, LEFT(COALESCE(bio_uk,''),120) AS bio_uk, seo_title_uk, sort_order
      FROM doctors WHERE id = ${id}
    `;
    before = beforeRows[0] ?? null;
  }

  if (isNew) {
    await sql`
      INSERT INTO doctors (name_uk, name_ru, name_en, role_uk, role_ru, role_en, experience_uk, experience_ru, experience_en,
        slug, seo_title_uk, seo_title_ru, seo_title_en, seo_desc_uk, seo_desc_ru, seo_desc_en,
        bio_uk, bio_ru, bio_en, education, certifications,
        photo_card, photo_full, photo_circle, card_position, modal_position, circle_focal_point, circle_scale,
        profile_focal_point, profile_scale, sort_order, is_published)
      VALUES (${name_uk}, ${name_ru}, ${name_en}, ${role_uk}, ${role_ru}, ${role_en}, ${experience_uk}, ${experience_ru}, ${experience_en},
        ${slug}, ${seo_title_uk}, ${seo_title_ru}, ${seo_title_en}, ${seo_desc_uk}, ${seo_desc_ru}, ${seo_desc_en},
        ${bio_uk}, ${bio_ru}, ${bio_en}, ${JSON.stringify(education)}, ${JSON.stringify(certifications)},
        ${photo_card}, ${photo_full}, ${photo_circle}, ${card_position}, ${modal_position}, ${circle_focal_point}, ${circle_scale},
        ${profile_focal_point}, ${profile_scale}, ${sort_order}, ${is_published})
    `;
    await logChange({ action: "create", entityType: "doctor", entityId: "new", entityLabel: name_uk, after });
  } else {
    await sql`
      UPDATE doctors SET
        name_uk = ${name_uk}, name_ru = ${name_ru}, name_en = ${name_en},
        role_uk = ${role_uk}, role_ru = ${role_ru}, role_en = ${role_en},
        experience_uk = ${experience_uk}, experience_ru = ${experience_ru}, experience_en = ${experience_en},
        slug = ${slug},
        seo_title_uk = ${seo_title_uk}, seo_title_ru = ${seo_title_ru}, seo_title_en = ${seo_title_en},
        seo_desc_uk = ${seo_desc_uk}, seo_desc_ru = ${seo_desc_ru}, seo_desc_en = ${seo_desc_en},
        bio_uk = ${bio_uk}, bio_ru = ${bio_ru}, bio_en = ${bio_en},
        education = ${JSON.stringify(education)}, certifications = ${JSON.stringify(certifications)},
        photo_card = ${photo_card}, photo_full = ${photo_full}, photo_circle = ${photo_circle},
        card_position = ${card_position}, modal_position = ${modal_position},
        circle_focal_point = ${circle_focal_point}, circle_scale = ${circle_scale},
        profile_focal_point = ${profile_focal_point}, profile_scale = ${profile_scale},
        sort_order = ${sort_order}, is_published = ${is_published}
      WHERE id = ${id}
    `;
    await logChange({ action: "update", entityType: "doctor", entityId: id!, entityLabel: name_uk, before, after });

    // Service/blog pages embed this doctor's name/role/photo (reviewer byline +
    // reviewedBy JSON-LD, author byline, related-doctor cards) but only the
    // `doctors` row's updated_at gets bumped above — those pages' own
    // `updated_at` stays stale, so a cached copy would 304 with outdated
    // content. Bump every row that references this doctor.
    await sql`
      UPDATE services SET updated_at = now()
      WHERE reviewer_doctor_id = ${id}
         OR id IN (SELECT service_id FROM service_doctors WHERE doctor_id = ${id})
    `;
    await sql`
      UPDATE blog_posts SET updated_at = now()
      WHERE author_id = ${id} OR reviewer_doctor_id = ${id}
    `;
  }

  revalidatePath("/");
  revalidatePath("/doctors");
  revalidatePath("/ru/doctors");
  revalidatePath("/en/doctors");
  revalidatePath("/sitemap-images");
  redirect("/admin/doctors");
}

export type DoctorFinalCtaInput = {
  bgType?: "color" | "image" | null;
  bgColor?: string | null;
  bgImage?: string | null;
  bgFocalPoint?: string | null;
  heading?: { uk?: string; ru?: string; en?: string } | null;
  subtitle?: { uk?: string; ru?: string; en?: string } | null;
  buttonText?: { uk?: string; ru?: string; en?: string } | null;
};

export async function saveDoctorFinalCtaData(doctorId: string, finalCta: DoctorFinalCtaInput) {
  const bgType = finalCta.bgType === "color" || finalCta.bgType === "image" ? finalCta.bgType : null;
  const cleaned: Record<string, unknown> = {
    bgType,
    bgColor: bgType === "color" && finalCta.bgColor ? finalCta.bgColor.trim() : null,
    bgImage: bgType === "image" && finalCta.bgImage ? finalCta.bgImage.trim() : null,
    bgFocalPoint: bgType === "image" && finalCta.bgFocalPoint ? finalCta.bgFocalPoint.trim() : null,
  };
  for (const f of ["heading", "subtitle", "buttonText"] as const) {
    const v = finalCta[f] as Record<string, string> | undefined;
    if (v) {
      const out: Record<string, string> = {};
      for (const l of ["uk", "ru", "en"]) { if (v[l]?.trim()) out[l] = v[l].trim(); }
      if (Object.keys(out).length > 0) cleaned[f] = out;
    }
  }
  const hasData = cleaned.bgType || cleaned.bgColor || cleaned.bgImage
    || cleaned.heading || cleaned.subtitle || cleaned.buttonText;
  const ctaJson = hasData ? JSON.stringify(cleaned) : null;
  await sql`UPDATE doctors SET final_cta = ${ctaJson}::jsonb WHERE id = ${doctorId}`;
  revalidatePath("/");
  revalidatePath("/doctors");
  return { ok: true };
}

export async function deleteDoctor(id: string) {
  const rows = await sql`SELECT name_uk FROM doctors WHERE id = ${id}`;

  // Bump referencing service/blog rows before the doctor row disappears —
  // `reviewer_doctor_id` FKs SET NULL on delete (which itself bumps
  // `services`/`blog_posts.updated_at` via the trigger), but the
  // `service_doctors` junction CASCADE-deletes without touching
  // `services.updated_at`, so a related-doctor card removal wouldn't
  // otherwise invalidate that page's cached Last-Modified.
  await sql`
    UPDATE services SET updated_at = now()
    WHERE reviewer_doctor_id = ${id}
       OR id IN (SELECT service_id FROM service_doctors WHERE doctor_id = ${id})
  `;
  await sql`
    UPDATE blog_posts SET updated_at = now()
    WHERE author_id = ${id} OR reviewer_doctor_id = ${id}
  `;

  await sql`DELETE FROM doctors WHERE id = ${id}`;
  await logChange({ action: "delete", entityType: "doctor", entityId: id, entityLabel: rows[0]?.name_uk ?? id });
  revalidatePath("/");
  revalidatePath("/doctors");
  redirect("/admin/doctors");
}

/* ─── Certificate image actions ─────────────────────────────────────────── */

type CertImg = { url: string; type: "image" | "pdf"; alt_uk: string; alt_ru: string; alt_en: string };

export async function rotateCertificateImage(
  doctorId: string,
  certUrl: string,
  direction: "cw" | "ccw",
): Promise<{ error?: string }> {
  try {
    const rows = await sql`SELECT certificate_images, slug FROM doctors WHERE id = ${doctorId}`;
    if (!rows.length) return { error: "Doctor not found" };
    const imgs: CertImg[] = rows[0].certificate_images ?? [];
    const entry = imgs.find((c) => c.url === certUrl);
    if (!entry) return { error: "Image not found" };

    const res = await fetch(certUrl);
    if (!res.ok) return { error: "Failed to fetch image" };
    const buf = Buffer.from(await res.arrayBuffer());

    const degrees = direction === "cw" ? 90 : 270;
    const rotated = await sharp(buf).rotate(degrees).webp({ quality: 88, effort: 4 }).toBuffer();

    const slug: string = rows[0].slug;
    const { url: newUrl } = await put(
      `doctors/certificates/${slug}/${randomUUID()}.webp`,
      rotated,
      { access: "public", contentType: "image/webp" },
    );

    const updated = imgs.map((c) => (c.url === certUrl ? { ...c, url: newUrl } : c));
    await sql`UPDATE doctors SET certificate_images = ${JSON.stringify(updated)}::jsonb WHERE id = ${doctorId}`;
    revalidatePath(`/doctors/${slug}`);
    revalidatePath(`/admin/doctors/${doctorId}`);
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deleteCertificateImage(
  doctorId: string,
  certUrl: string,
): Promise<{ error?: string }> {
  try {
    const rows = await sql`SELECT certificate_images, slug FROM doctors WHERE id = ${doctorId}`;
    if (!rows.length) return { error: "Doctor not found" };
    const imgs: CertImg[] = rows[0].certificate_images ?? [];
    const updated = imgs.filter((c) => c.url !== certUrl);
    await sql`UPDATE doctors SET certificate_images = ${JSON.stringify(updated)}::jsonb WHERE id = ${doctorId}`;
    const slug: string = rows[0].slug;
    revalidatePath(`/doctors/${slug}`);
    revalidatePath(`/admin/doctors/${doctorId}`);
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}

export async function uploadCertificateImage(
  doctorId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || !file.size) return { error: "No file provided" };

    const rows = await sql`SELECT certificate_images, slug, name_uk, name_ru, name_en FROM doctors WHERE id = ${doctorId}`;
    if (!rows.length) return { error: "Doctor not found" };
    const slug: string = rows[0].slug;

    const raw = Buffer.from(await file.arrayBuffer());
    const webp = await sharp(raw)
      .rotate()
      .resize({ width: 2000, height: 2800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toBuffer();

    const { url } = await put(
      `doctors/certificates/${slug}/${randomUUID()}.webp`,
      webp,
      { access: "public", contentType: "image/webp" },
    );

    const imgs: CertImg[] = rows[0].certificate_images ?? [];
    const entry: CertImg = {
      url,
      type: "image",
      alt_uk: `Сертифікат лікаря ${rows[0].name_uk}`,
      alt_ru: `Сертификат врача ${rows[0].name_ru}`,
      alt_en: `Certificate of ${rows[0].name_en}`,
    };
    const updated = [...imgs, entry];
    await sql`UPDATE doctors SET certificate_images = ${JSON.stringify(updated)}::jsonb WHERE id = ${doctorId}`;
    revalidatePath(`/doctors/${slug}`);
    revalidatePath(`/admin/doctors/${doctorId}`);
    return {};
  } catch (e) {
    return { error: String(e) };
  }
}
