import { sql } from "../client";
import type { ContentSection, FaqItemData } from "../types";
import { randomUUID } from "crypto";

/** Fetch content sections for an owner, resolve locale from JSONB data */
export async function getSections(ownerType: string, ownerId: string, l: string): Promise<ContentSection[]> {
  const lang = l === "ua" ? "uk" : l;
  const rows = await sql`
    SELECT id, section_type, data, sort_order
    FROM content_sections
    WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}
    ORDER BY sort_order
  `;

  return rows.map((row) => {
    const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
    const type = `section.${row.section_type}` as ContentSection["_type"];

    const resolve = (val: any): any => {
      if (val === null || val === undefined) return "";
      if (typeof val === "object" && !Array.isArray(val) && ("uk" in val || "ru" in val || "en" in val)) {
        return val[lang] ?? val.uk ?? "";
      }
      if (Array.isArray(val)) {
        return val.map((item: any) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            const resolved: any = {};
            for (const [k, v] of Object.entries(item)) {
              resolved[k] = resolve(v);
            }
            return resolved;
          }
          return item;
        });
      }
      return val;
    };

    const resolved: any = { _type: type, _key: row.id || randomUUID() };
    for (const [key, val] of Object.entries(data)) {
      resolved[key] = resolve(val);
    }

    return resolved as ContentSection;
  });
}

/** Fetch FAQ items for an owner */
export async function getFaqItems(ownerType: string, ownerId: string, l: string): Promise<FaqItemData[]> {
  const lang = l === "ua" ? "uk" : l;

  // Fetch all columns, pick locale in JS (neon tagged template doesn't support dynamic column names)
  const rows = await sql`
    SELECT question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en
    FROM faq_items
    WHERE owner_type = ${ownerType} AND owner_id = ${ownerId}
    ORDER BY sort_order
  `;

  return rows.map((r) => ({
    question: (r as any)[`question_${lang}`] || r.question_uk || "",
    answer: (r as any)[`answer_${lang}`] || r.answer_uk || "",
  }));
}
