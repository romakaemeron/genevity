"use server";

import { sql } from "@/lib/db/client";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import sharp from "sharp";

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
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;
  const card_position = (formData.get("card_position") as string) || "center center";
  const modal_position = (formData.get("modal_position") as string) || card_position;
  // Booking-form circle thumbnail — own image + focal + zoom so a tight
  // face crop can differ from the main card photo's framing. Falls back
  // to photo_card at render time when photo_circle is null.
  const circle_focal_point = (formData.get("circle_focal_point") as string) || card_position;
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

  if (isNew) {
    await sql`
      INSERT INTO doctors (name_uk, name_ru, name_en, role_uk, role_ru, role_en, experience_uk, experience_ru, experience_en, photo_card, photo_full, photo_circle, card_position, modal_position, circle_focal_point, circle_scale, sort_order)
      VALUES (${name_uk}, ${name_ru}, ${name_en}, ${role_uk}, ${role_ru}, ${role_en}, ${experience_uk}, ${experience_ru}, ${experience_en}, ${photo_card}, ${photo_full}, ${photo_circle}, ${card_position}, ${modal_position}, ${circle_focal_point}, ${circle_scale}, ${sort_order})
    `;
  } else {
    await sql`
      UPDATE doctors SET
        name_uk = ${name_uk}, name_ru = ${name_ru}, name_en = ${name_en},
        role_uk = ${role_uk}, role_ru = ${role_ru}, role_en = ${role_en},
        experience_uk = ${experience_uk}, experience_ru = ${experience_ru}, experience_en = ${experience_en},
        photo_card = ${photo_card}, photo_full = ${photo_full}, photo_circle = ${photo_circle},
        card_position = ${card_position}, modal_position = ${modal_position},
        circle_focal_point = ${circle_focal_point}, circle_scale = ${circle_scale},
        sort_order = ${sort_order}
      WHERE id = ${id}
    `;
  }

  revalidatePath("/");
  revalidatePath("/doctors");
  redirect("/admin/doctors");
}

export async function deleteDoctor(id: string) {
  await sql`DELETE FROM doctors WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/doctors");
  redirect("/admin/doctors");
}
