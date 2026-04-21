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

function parseArray(val: string | null): string[] {
  if (!val) return [];
  return val.split("\n").map((s) => s.trim()).filter(Boolean);
}

export async function saveEquipment(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string | null;
  const isNew = !id;

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  const short_description_uk = formData.get("short_description_uk") as string;
  const short_description_ru = formData.get("short_description_ru") as string;
  const short_description_en = formData.get("short_description_en") as string;
  const description_uk = formData.get("description_uk") as string;
  const description_ru = formData.get("description_ru") as string;
  const description_en = formData.get("description_en") as string;
  const note_uk = formData.get("note_uk") as string;
  const note_ru = formData.get("note_ru") as string;
  const note_en = formData.get("note_en") as string;

  const suits_uk = parseArray(formData.get("suits_uk") as string);
  const suits_ru = parseArray(formData.get("suits_ru") as string);
  const suits_en = parseArray(formData.get("suits_en") as string);
  const results_uk = parseArray(formData.get("results_uk") as string);
  const results_ru = parseArray(formData.get("results_ru") as string);
  const results_en = parseArray(formData.get("results_en") as string);

  const photoFile = formData.get("photo") as File | null;
  const currentPhoto = formData.get("photo_current") as string;
  const photo = await uploadImage(photoFile, "equipment", currentPhoto);

  if (isNew) {
    await sql`
      INSERT INTO equipment (name, category, short_description_uk, short_description_ru, short_description_en, description_uk, description_ru, description_en, suits_uk, suits_ru, suits_en, results_uk, results_ru, results_en, note_uk, note_ru, note_en, photo, sort_order)
      VALUES (${name}, ${category}::equipment_category, ${short_description_uk}, ${short_description_ru}, ${short_description_en}, ${description_uk}, ${description_ru}, ${description_en}, ${suits_uk}, ${suits_ru}, ${suits_en}, ${results_uk}, ${results_ru}, ${results_en}, ${note_uk}, ${note_ru}, ${note_en}, ${photo}, ${sort_order})
    `;
  } else {
    await sql`
      UPDATE equipment SET
        name = ${name}, category = ${category}::equipment_category,
        short_description_uk = ${short_description_uk}, short_description_ru = ${short_description_ru}, short_description_en = ${short_description_en},
        description_uk = ${description_uk}, description_ru = ${description_ru}, description_en = ${description_en},
        suits_uk = ${suits_uk}, suits_ru = ${suits_ru}, suits_en = ${suits_en},
        results_uk = ${results_uk}, results_ru = ${results_ru}, results_en = ${results_en},
        note_uk = ${note_uk}, note_ru = ${note_ru}, note_en = ${note_en},
        photo = ${photo}, sort_order = ${sort_order}
      WHERE id = ${id}
    `;
  }

  revalidatePath("/");
  revalidatePath("/equipment");
  redirect("/equipment");
}

export async function deleteEquipment(id: string) {
  await sql`DELETE FROM equipment WHERE id = ${id}`;
  revalidatePath("/");
  redirect("/equipment");
}
