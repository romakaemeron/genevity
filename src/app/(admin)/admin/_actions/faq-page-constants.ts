export const FAQ_CATEGORY_KEYS = ["booking", "preparation", "payment", "safety", "lab", "visit"] as const;
export type FaqCategoryKey = (typeof FAQ_CATEGORY_KEYS)[number];

export type FaqPageItem = {
  category: FaqCategoryKey;
  question_uk: string;
  question_ru: string;
  question_en: string;
  answer_uk: string;
  answer_ru: string;
  answer_en: string;
};
