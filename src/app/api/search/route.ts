import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

const SYNONYMS: Record<string, string> = {
  "ботокс": "ботулін",
  "ботулін": "ботокс",
  "плазма": "prp",
  "prp": "плазма",
  "лазер": "splendor",
  "splendor": "епіляц",
  "iv": "крапельниц",
  "крапельниц": "iv",
  "инъекц": "ін'єкц",
  "ін'єкц": "инъекц",
  "стволов": "стовбур",
  "стовбур": "стволов",
  "чистк": "hydrafacial",
  "hydrafacial": "чистк",
  "шліфовк": "co2",
  "co2": "шліфовк",
  "филлер": "філер",
  "філер": "филлер",
};

export interface SearchResult {
  type: "service" | "category" | "doctor" | "page";
  title: string;
  subtitle: string;
  path: string;
  photo?: string | null;
  photoFocalPoint?: string;
  photoScale?: number;
}

function pick(row: Record<string, unknown>, field: string, lang: string): string {
  return (row[`${field}_${lang}`] ?? row[`${field}_uk`] ?? "") as string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const locale = req.nextUrl.searchParams.get("locale") ?? "ua";
  const lang = locale === "ua" ? "uk" : locale;

  if (q.length < 2) return NextResponse.json({ results: [] });

  const primary = `%${q}%`;
  const qLower = q.toLowerCase();
  let altPattern: string | null = null;
  for (const [key, val] of Object.entries(SYNONYMS)) {
    if (qLower.includes(key)) { altPattern = `%${val}%`; break; }
  }
  const p2 = altPattern ?? primary;

  const [services, categories, doctors, pages] = await Promise.all([
    sql`
      SELECT s.slug, s.title_uk, s.title_ru, s.title_en,
             s.summary_uk, s.summary_ru, s.summary_en,
             c.slug AS cat_slug,
             c.title_uk AS cat_uk, c.title_ru AS cat_ru, c.title_en AS cat_en
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      WHERE s.title_uk ILIKE ${primary} OR s.title_ru ILIKE ${primary} OR s.title_en ILIKE ${primary}
         OR s.summary_uk ILIKE ${primary} OR s.summary_ru ILIKE ${primary} OR s.summary_en ILIKE ${primary}
         OR s.h1_uk ILIKE ${primary}
         OR s.title_uk ILIKE ${p2} OR s.title_ru ILIKE ${p2} OR s.title_en ILIKE ${p2}
      LIMIT 5
    `,
    sql`
      SELECT slug, title_uk, title_ru, title_en, summary_uk, summary_ru, summary_en
      FROM service_categories
      WHERE seo_noindex IS NOT TRUE
        AND (
          title_uk ILIKE ${primary} OR title_ru ILIKE ${primary} OR title_en ILIKE ${primary}
          OR summary_uk ILIKE ${primary} OR summary_ru ILIKE ${primary} OR summary_en ILIKE ${primary}
          OR title_uk ILIKE ${p2} OR title_ru ILIKE ${p2} OR title_en ILIKE ${p2}
        )
      LIMIT 3
    `,
    sql`
      SELECT id, slug, name_uk, name_ru, name_en, role_uk, role_ru, role_en,
             photo_card, photo_circle, card_position, circle_focal_point, circle_scale
      FROM doctors
      WHERE name_uk ILIKE ${primary} OR name_ru ILIKE ${primary} OR name_en ILIKE ${primary}
         OR role_uk ILIKE ${primary} OR role_ru ILIKE ${primary} OR role_en ILIKE ${primary}
         OR name_uk ILIKE ${p2} OR name_ru ILIKE ${p2} OR name_en ILIKE ${p2}
      LIMIT 2
    `,
    sql`
      SELECT slug, title_uk, title_ru, title_en, seo_desc_uk, seo_desc_ru, seo_desc_en
      FROM static_pages
      WHERE slug NOT IN ('home')
        AND (
          title_uk ILIKE ${primary} OR title_ru ILIKE ${primary} OR title_en ILIKE ${primary}
          OR seo_desc_uk ILIKE ${primary} OR seo_desc_ru ILIKE ${primary} OR seo_desc_en ILIKE ${primary}
          OR title_uk ILIKE ${p2} OR title_ru ILIKE ${p2} OR title_en ILIKE ${p2}
        )
      LIMIT 2
    `,
  ]);

  const results: SearchResult[] = [];

  for (const s of services as Record<string, unknown>[]) {
    results.push({
      type: "service",
      title: pick(s, "title", lang) || pick(s, "title", "uk"),
      subtitle: pick(s, "cat", lang) || pick(s, "cat", "uk"),
      path: `/services/${s.cat_slug}/${s.slug}`,
    });
  }

  for (const c of categories as Record<string, unknown>[]) {
    results.push({
      type: "category",
      title: pick(c, "title", lang) || pick(c, "title", "uk"),
      subtitle: (pick(c, "summary", lang) || "").slice(0, 60),
      path: `/services/${c.slug}`,
    });
  }

  for (const d of doctors as Record<string, unknown>[]) {
    const circleUrl = (d.photo_circle as string | null) || (d.photo_card as string | null) || null;
    const focal = (d.circle_focal_point as string | null) || (d.card_position as string | null) || "50% 50%";
    const rawScale = d.circle_scale;
    const scale = typeof rawScale === "number" ? rawScale : typeof rawScale === "string" ? parseFloat(rawScale) : NaN;
    results.push({
      type: "doctor",
      title: pick(d, "name", lang) || pick(d, "name", "uk"),
      subtitle: pick(d, "role", lang) || pick(d, "role", "uk"),
      path: d.slug ? `/doctors/${d.slug}` : "/doctors",
      photo: circleUrl,
      photoFocalPoint: focal,
      photoScale: Number.isFinite(scale) && scale > 0 ? scale : 1,
    });
  }

  for (const p of pages as Record<string, unknown>[]) {
    results.push({
      type: "page",
      title: pick(p, "title", lang) || pick(p, "title", "uk"),
      subtitle: (pick(p, "seo_desc", lang) || "").slice(0, 60),
      path: `/${p.slug}`,
    });
  }

  return NextResponse.json({ results });
}
