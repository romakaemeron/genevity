"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { processAndUploadImage } from "./upload";

type SectionRow = { id?: string; type: string; data: any };

/**
 * Persist the ordered list of sections for an owner (service, category, static_page).
 * Instead of DELETE + INSERT (which regenerates IDs and breaks section references
 * from `block_order`), we UPSERT: existing rows keep their IDs so block_order
 * entries like `section:<uuid>` stay stable.
 */
export async function saveSections(ownerType: string, ownerId: string, sections: SectionRow[]) {
  const keepIds = sections.map((s) => s.id).filter((v): v is string => Boolean(v));
  // Delete any rows that were removed from the list
  if (keepIds.length > 0) {
    await sql`
      DELETE FROM content_sections
      WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}
        AND NOT (id = ANY(${keepIds}::uuid[]))
    `;
  } else {
    await sql`DELETE FROM content_sections WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}`;
  }

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (s.id) {
      await sql`
        UPDATE content_sections
        SET sort_order = ${i}, section_type = ${s.type}::section_type, data = ${JSON.stringify(s.data)}::jsonb
        WHERE id = ${s.id}
      `;
    } else {
      await sql`
        INSERT INTO content_sections (owner_type, owner_id, sort_order, section_type, data)
        VALUES (${ownerType}, ${ownerId}, ${i}, ${s.type}::section_type, ${JSON.stringify(s.data)}::jsonb)
      `;
    }
  }
  revalidatePath("/");
  return { ok: true };
}

export async function uploadSectionImage(formData: FormData): Promise<{ url: string }> {
  const file = formData.get("file") as File;
  const url = await processAndUploadImage(file, "sections");
  if (!url) throw new Error("No file");
  return { url };
}

type FaqRow = { question_uk: string; question_ru: string; question_en: string; answer_uk: string; answer_ru: string; answer_en: string };

export async function saveFaq(ownerType: string, ownerId: string, items: FaqRow[]) {
  await sql`DELETE FROM faq_items WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}`;
  for (let i = 0; i < items.length; i++) {
    const f = items[i];
    await sql`
      INSERT INTO faq_items (owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
      VALUES (${ownerType}, ${ownerId}, ${i}, ${f.question_uk || ""}, ${f.question_ru || null}, ${f.question_en || null}, ${f.answer_uk || ""}, ${f.answer_ru || null}, ${f.answer_en || null})
    `;
  }
  revalidatePath("/");
  return { ok: true };
}
