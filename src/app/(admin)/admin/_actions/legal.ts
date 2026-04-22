"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

export async function saveLegalDoc(_prevState: any, formData: FormData) {
  const id = formData.get("id") as string | null;
  const isNew = !id;
  const slug = formData.get("slug") as string;

  if (!slug) return { error: "Slug is required" };

  const fields: Record<string, any> = {};
  for (const suffix of ["uk", "ru", "en"]) {
    for (const f of ["title", "short_label", "body"]) {
      fields[`${f}_${suffix}`] = (formData.get(`${f}_${suffix}`) as string) || null;
    }
  }
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  if (isNew) {
    const newId = randomUUID();
    await sql`
      INSERT INTO legal_docs (id, slug, sort_order,
        title_uk, title_ru, title_en,
        short_label_uk, short_label_ru, short_label_en,
        body_uk, body_ru, body_en)
      VALUES (${newId}, ${slug}, ${sort_order},
        ${fields.title_uk}, ${fields.title_ru}, ${fields.title_en},
        ${fields.short_label_uk}, ${fields.short_label_ru}, ${fields.short_label_en},
        ${fields.body_uk}, ${fields.body_ru}, ${fields.body_en})
    `;
    revalidatePath("/");
    redirect(`/admin/legal/${slug}`);
  } else {
    await sql`
      UPDATE legal_docs SET
        slug = ${slug}, sort_order = ${sort_order},
        title_uk = ${fields.title_uk}, title_ru = ${fields.title_ru}, title_en = ${fields.title_en},
        short_label_uk = ${fields.short_label_uk}, short_label_ru = ${fields.short_label_ru}, short_label_en = ${fields.short_label_en},
        body_uk = ${fields.body_uk}, body_ru = ${fields.body_ru}, body_en = ${fields.body_en}
      WHERE id = ${id}
    `;
    revalidatePath("/");
    return { success: true };
  }
}

export async function deleteLegalDoc(id: string) {
  await sql`DELETE FROM legal_docs WHERE id = ${id}`;
  revalidatePath("/");
  redirect("/admin/pages");
}
