"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { processAndUploadImage } from "./upload";
import { logChange } from "@/lib/audit";

type SectionRow = { id?: string; type: string; data: any };

export async function saveSections(ownerType: string, ownerId: string, sections: SectionRow[]) {
  // Read current state before mutating
  const beforeRows = await sql`
    SELECT id, section_type AS type, data FROM content_sections
    WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}
    ORDER BY sort_order
  `;
  const before = beforeRows.map((r: any) => ({ id: r.id, type: r.type, data: r.data }));

  const keepIds = sections.map((s) => s.id).filter((v): v is string => Boolean(v));
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

  const after = sections.map((s) => ({ id: s.id, type: s.type, data: s.data }));
  await logChange({
    action: "update",
    entityType: "sections",
    entityId: ownerId,
    entityLabel: `${ownerType} sections`,
    before: { sections: before },
    after: { sections: after },
  });
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
  const beforeRows = await sql`
    SELECT question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en
    FROM faq_items
    WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}
    ORDER BY sort_order
  `;
  const before = beforeRows.map((r: any) => ({
    question_uk: r.question_uk, question_ru: r.question_ru, question_en: r.question_en,
    answer_uk: r.answer_uk, answer_ru: r.answer_ru, answer_en: r.answer_en,
  }));

  await sql`DELETE FROM faq_items WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}`;
  for (let i = 0; i < items.length; i++) {
    const f = items[i];
    await sql`
      INSERT INTO faq_items (owner_type, owner_id, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
      VALUES (${ownerType}, ${ownerId}, ${i}, ${f.question_uk || ""}, ${f.question_ru || null}, ${f.question_en || null}, ${f.answer_uk || ""}, ${f.answer_ru || null}, ${f.answer_en || null})
    `;
  }

  await logChange({
    action: "update",
    entityType: "faq",
    entityId: ownerId,
    entityLabel: `${ownerType} FAQ`,
    before: { items: before },
    after: { items },
  });
  revalidatePath("/");
  return { ok: true };
}
