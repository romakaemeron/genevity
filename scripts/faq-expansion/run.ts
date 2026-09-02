/**
 * Shared runner for the FAQ expansion batches (each page → 7 items).
 * Usage: npx tsx --env-file=.env.local scripts/faq-expansion/batch-XX.ts
 */
import { sql } from "@/lib/db/client";

export type L = { uk: string; ru: string; en: string };
export type Item = { q: L; a: L };
export type OwnerType = "service" | "category" | "static_page" | "faq_page";
export type Batch = { type: OwnerType; slug: string; category?: string; items: Item[] };

const FAQ_PAGE_OWNER = "00000000-0000-0000-0000-0000000000fa";

async function ownerId(type: OwnerType, slug: string): Promise<string> {
  if (type === "faq_page") return FAQ_PAGE_OWNER;
  const rows =
    type === "service"
      ? await sql`SELECT id FROM services WHERE slug = ${slug}`
      : type === "category"
        ? await sql`SELECT id FROM service_categories WHERE slug = ${slug}`
        : await sql`SELECT id FROM static_pages WHERE slug = ${slug}`;
  if (!rows[0]) throw new Error(`${type} not found: ${slug}`);
  return rows[0].id as string;
}

export async function seed(batches: Batch[]) {
  let added = 0;
  let skipped = 0;
  for (const b of batches) {
    const id = await ownerId(b.type, b.slug);
    const existing = await sql`
      SELECT question_uk, sort_order, category FROM faq_items
      WHERE owner_type = ${b.type} AND owner_id = ${id}
      ORDER BY sort_order
    `;
    const scope = b.category
      ? existing.filter((r: any) => r.category === b.category)
      : existing;
    const seen = new Set(scope.map((r: any) => norm(r.question_uk)));
    let order = existing.length ? Math.max(...existing.map((r: any) => r.sort_order ?? 0)) : 0;

    for (const it of b.items) {
      if (seen.has(norm(it.q.uk))) { skipped++; continue; }
      order++;
      await sql`
        INSERT INTO faq_items (owner_type, owner_id, category, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
        VALUES (${b.type}, ${id}, ${b.category ?? null}, ${it.q.uk}, ${it.q.ru}, ${it.q.en}, ${it.a.uk}, ${it.a.ru}, ${it.a.en}, ${order})
      `;
      seen.add(norm(it.q.uk));
      added++;
    }
    const total = scope.length + b.items.length;
    console.log(`${b.type}/${b.slug}${b.category ? ` [${b.category}]` : ""} → ${total} items`);
  }
  console.log(`\nAdded ${added} FAQ items (${skipped} skipped as duplicates).`);
}

function norm(s: string) {
  return (s || "").toLowerCase().replace(/[\s'’"«»?!.,-]/g, "");
}
