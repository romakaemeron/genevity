import { sql } from "../client";

export interface LegalDocLink {
  _id: string;
  slug: string;
  label: string;
}

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }

export async function getLegalDocs(locale: string): Promise<LegalDocLink[]> {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM legal_docs ORDER BY sort_order`;
  return rows.map((r) => ({
    _id: r.id,
    slug: r.slug,
    label: (r as any)[`short_label_${l}`] || r.short_label_uk || (r as any)[`title_${l}`] || r.title_uk || "",
  }));
}

export async function getLegalDocBySlug(locale: string, slug: string) {
  const l = lang(locale);
  const rows = await sql`SELECT * FROM legal_docs WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    _id: r.id,
    slug: r.slug,
    title: (r as any)[`title_${l}`] || r.title_uk || "",
    body: (r as any)[`body_${l}`] || r.body_uk || "",
  };
}
