import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";
import FaqPageEditor from "./_components/faq-page-editor";
import { FAQ_CATEGORY_KEYS, type FaqPageItem } from "../_actions/faq-page-constants";

export default async function AdminFaqPage() {
  await requireSession();

  const rows = await sql`
    SELECT category, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en
    FROM faq_items
    WHERE owner_type = 'faq_page'
    ORDER BY sort_order
  `;

  const byCategory: Record<string, FaqPageItem[]> = {};
  for (const key of FAQ_CATEGORY_KEYS) byCategory[key] = [];
  for (const r of rows as any[]) {
    const category = (FAQ_CATEGORY_KEYS as readonly string[]).includes(r.category) ? r.category : "booking";
    byCategory[category].push({
      category,
      question_uk: r.question_uk || "",
      question_ru: r.question_ru || "",
      question_en: r.question_en || "",
      answer_uk: r.answer_uk || "",
      answer_ru: r.answer_ru || "",
      answer_en: r.answer_en || "",
    });
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <AdminPageHeader
        title="FAQ Page"
        subtitle="Curated questions & answers shown on the public /faq page, grouped by category."
      />
      <FaqPageEditor initialByCategory={byCategory} />
    </div>
  );
}
