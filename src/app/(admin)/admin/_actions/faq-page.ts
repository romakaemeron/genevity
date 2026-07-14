"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { logChange } from "@/lib/audit";
import type { FaqPageItem } from "./faq-page-constants";

/** Fixed owner_id for the curated /faq page content (single row per locale set) */
const FAQ_PAGE_OWNER_ID = "00000000-0000-0000-0000-0000000000fa";
const FAQ_PAGE_OWNER_TYPE = "faq_page";

function revalidateFaqPage() {
  revalidatePath("/faq");
  revalidatePath("/ru/faq");
  revalidatePath("/en/faq");
}

/**
 * Full replace of the curated FAQ-page items. `items` must already be in the
 * desired display order (category blocks first, items within a category
 * second) — sort_order is assigned from the array index.
 */
export async function saveFaqPageItems(items: FaqPageItem[]) {
  const beforeRows = await sql`
    SELECT category, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en
    FROM faq_items
    WHERE owner_type = ${FAQ_PAGE_OWNER_TYPE}
    ORDER BY sort_order
  `;
  const before = beforeRows.map((r: any) => ({
    category: r.category,
    question_uk: r.question_uk, question_ru: r.question_ru, question_en: r.question_en,
    answer_uk: r.answer_uk, answer_ru: r.answer_ru, answer_en: r.answer_en,
  }));

  await sql`DELETE FROM faq_items WHERE owner_type = ${FAQ_PAGE_OWNER_TYPE}`;
  for (let i = 0; i < items.length; i++) {
    const f = items[i];
    await sql`
      INSERT INTO faq_items
        (owner_type, owner_id, category, sort_order, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en)
      VALUES
        (${FAQ_PAGE_OWNER_TYPE}, ${FAQ_PAGE_OWNER_ID}, ${f.category}, ${i},
         ${f.question_uk || ""}, ${f.question_ru || null}, ${f.question_en || null},
         ${f.answer_uk || ""}, ${f.answer_ru || null}, ${f.answer_en || null})
    `;
  }

  await logChange({
    action: "update",
    entityType: "faq_page",
    entityId: FAQ_PAGE_OWNER_ID,
    entityLabel: "FAQ page content",
    before: { items: before },
    after: { items },
  });

  revalidateFaqPage();
  return { ok: true };
}
