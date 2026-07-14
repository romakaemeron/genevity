import { sql } from "../client";

/** Single source of truth for FAQ category keys, shared by the admin editor/save action and the public FAQ page. */
export const FAQ_CATEGORY_KEYS = ["booking", "preparation", "payment", "safety", "lab", "visit"] as const;
export type FaqCategoryKey = (typeof FAQ_CATEGORY_KEYS)[number];

export type FaqPageGroup = {
  category: string;
  items: { question: string; answer: string }[];
};

/** Fetch curated FAQ-page items, resolved to locale and grouped by category (order preserved by first-seen sort_order) */
export async function getFaqPage(locale: string): Promise<FaqPageGroup[]> {
  const lang = locale === "ua" ? "uk" : locale;

  const rows = await sql`
    SELECT category, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en
    FROM faq_items
    WHERE owner_type = 'faq_page'
    ORDER BY sort_order
  `;

  const groups: FaqPageGroup[] = [];
  const byCategory = new Map<string, FaqPageGroup>();

  for (const r of rows) {
    const category = r.category;
    if (!category) continue;

    let group = byCategory.get(category);
    if (!group) {
      group = { category, items: [] };
      byCategory.set(category, group);
      groups.push(group);
    }

    group.items.push({
      question: (r as any)[`question_${lang}`] || r.question_uk || "",
      answer: (r as any)[`answer_${lang}`] || r.answer_uk || "",
    });
  }

  return groups;
}
