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

  // Photos
  const photoCardFile = formData.get("photo_card") as File | null;
  const photoFullFile = formData.get("photo_full") as File | null;
  const currentCard = formData.get("photo_card_current") as string;
  const currentFull = formData.get("photo_full_current") as string;

  const photo_card = await uploadImage(photoCardFile, "doctors", currentCard);
  const photo_full = await uploadImage(photoFullFile, "doctors", currentFull);

  if (isNew) {
    await sql`
      INSERT INTO doctors (name_uk, name_ru, name_en, role_uk, role_ru, role_en, experience_uk, experience_ru, experience_en, photo_card, photo_full, sort_order)
      VALUES (${name_uk}, ${name_ru}, ${name_en}, ${role_uk}, ${role_ru}, ${role_en}, ${experience_uk}, ${experience_ru}, ${experience_en}, ${photo_card}, ${photo_full}, ${sort_order})
    `;
  } else {
    await sql`
      UPDATE doctors SET
        name_uk = ${name_uk}, name_ru = ${name_ru}, name_en = ${name_en},
        role_uk = ${role_uk}, role_ru = ${role_ru}, role_en = ${role_en},
        experience_uk = ${experience_uk}, experience_ru = ${experience_ru}, experience_en = ${experience_en},
        photo_card = ${photo_card}, photo_full = ${photo_full},
        sort_order = ${sort_order}
      WHERE id = ${id}
    `;
  }

  revalidatePath("/");
  revalidatePath("/doctors");
  redirect("/doctors");
}

export async function deleteDoctor(id: string) {
  await sql`DELETE FROM doctors WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/doctors");
  redirect("/doctors");
}
