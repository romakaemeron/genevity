import { FAQ_CATEGORY_KEYS, type FaqCategoryKey } from "@/lib/db/queries/faq";

export { FAQ_CATEGORY_KEYS };
export type { FaqCategoryKey };

export type FaqPageItem = {
  category: FaqCategoryKey;
  question_uk: string;
  question_ru: string;
  question_en: string;
  answer_uk: string;
  answer_ru: string;
  answer_en: string;
};
