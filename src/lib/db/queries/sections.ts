import { sql } from "../client";
import type { ContentSection, FaqItemData, DoctorItem } from "../types";
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
          for (const [k, v] of Object.entries(item)) resolved[k] = resolve(v);
          return resolved;
        }
        return item;
      });
    }
    return val;
  };

  const sections = rows.map((row) => {
    const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
    const type = `section.${row.section_type}` as ContentSection["_type"];
    const resolved: any = { _type: type, _key: row.id || randomUUID() };
    for (const [key, val] of Object.entries(data)) resolved[key] = resolve(val);
    return resolved;
  });

  // Hydrate relatedDoctors sections: replace doctorIds with full doctor data
  const allIds = new Set<string>();
  for (const s of sections) {
    if (s._type === "section.relatedDoctors" && Array.isArray(s.doctorIds)) {
      for (const id of s.doctorIds) allIds.add(id);
    }
  }

  if (allIds.size > 0) {
    const idArr = Array.from(allIds);
    const doctorRows = await sql`SELECT * FROM doctors WHERE id = ANY(${idArr}::uuid[])`;
    const byId = new Map<string, DoctorItem>();
    for (const r of doctorRows) {
      byId.set(r.id, {
        _id: r.id,
        name: (r as any)[`name_${lang}`] || r.name_uk,
        role: (r as any)[`role_${lang}`] || r.role_uk,
        experience: (r as any)[`experience_${lang}`] || r.experience_uk,
        specialties: (r as any)[`specialties_${lang}`] || r.specialties_uk || [],
        photoCard: r.photo_card,
        photoModal: r.photo_full,
        cardPosition: r.card_position || "center center",
        modalPosition: r.modal_position || r.card_position || "center center",
      });
    }
    for (const s of sections) {
      if (s._type === "section.relatedDoctors" && Array.isArray(s.doctorIds)) {
        s.doctors = s.doctorIds.map((id: string) => byId.get(id)).filter(Boolean);
        delete s.doctorIds;
      }
    }
  }

  return sections as ContentSection[];
}

/** Fetch FAQ items for an owner */
export async function getFaqItems(ownerType: string, ownerId: string, l: string): Promise<FaqItemData[]> {
  const lang = l === "ua" ? "uk" : l;

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
