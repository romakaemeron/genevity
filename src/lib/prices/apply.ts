import type { CatalogueCategory } from "./taxonomy";
import { translate } from "./translations";
import type { ExistingRow } from "./diff";

type SqlClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

/** Category slug that the importer must never create, update or delete. */
export const PROTECTED_CATEGORY_SLUGS = ["consultations"];

export async function loadExistingRows(sql: SqlClient): Promise<ExistingRow[]> {
  const rows = await sql`
    SELECT i.id, i.name_uk, i.price, i.roapp_service_id, i.source,
           c.slug AS category_slug, s.slug AS subcategory_slug
    FROM price_items i
    JOIN price_categories c ON c.id = i.category_id
    LEFT JOIN price_subcategories s ON s.id = i.subcategory_id
    WHERE c.slug <> ALL(${PROTECTED_CATEGORY_SLUGS})
  `;
  return rows.map((r) => ({
    id: String(r.id),
    categorySlug: String(r.category_slug),
    subcategorySlug: r.subcategory_slug ? String(r.subcategory_slug) : null,
    nameUk: String(r.name_uk ?? ""),
    price: String(r.price ?? ""),
    roappServiceId: r.roapp_service_id ? String(r.roapp_service_id) : null,
    source: String(r.source ?? "manual"),
  }));
}

export async function applyCatalogue(
  sql: SqlClient,
  cats: CatalogueCategory[],
): Promise<{ categories: number; subcategories: number; items: number; hidden: number }> {
  const seenItemIds: string[] = [];
  let categories = 0, subcategories = 0, items = 0, hidden = 0;

  for (let ci = 0; ci < cats.length; ci++) {
    const cat = cats[ci];
    if (PROTECTED_CATEGORY_SLUGS.includes(cat.slug)) continue;

    const t = translate(cat.labelUk);
    const catRows = await sql`
      INSERT INTO price_categories (slug, label_uk, label_ru, label_en, is_visible, sort_order)
      VALUES (${cat.slug}, ${cat.labelUk}, ${t.ru}, ${t.en}, ${cat.isVisible}, ${ci + 10})
      ON CONFLICT (slug) DO UPDATE SET
        label_uk = EXCLUDED.label_uk,
        label_ru = COALESCE(EXCLUDED.label_ru, price_categories.label_ru),
        label_en = COALESCE(EXCLUDED.label_en, price_categories.label_en),
        is_visible = EXCLUDED.is_visible,
        sort_order = EXCLUDED.sort_order,
        updated_at = now()
      RETURNING id
    `;
    const categoryId = String(catRows[0].id);
    categories++;

    for (let si = 0; si < cat.subcategories.length; si++) {
      const sub = cat.subcategories[si];
      let subcategoryId: string | null = null;

      if (sub.labelUk) {
        const st = translate(sub.labelUk);
        const subRows = await sql`
          INSERT INTO price_subcategories (category_id, slug, label_uk, label_ru, label_en, is_visible, sort_order)
          VALUES (${categoryId}, ${sub.slug}, ${sub.labelUk}, ${st.ru}, ${st.en}, ${sub.isVisible}, ${si})
          ON CONFLICT (category_id, slug) DO UPDATE SET
            label_uk = EXCLUDED.label_uk,
            label_ru = COALESCE(EXCLUDED.label_ru, price_subcategories.label_ru),
            label_en = COALESCE(EXCLUDED.label_en, price_subcategories.label_en),
            is_visible = EXCLUDED.is_visible,
            sort_order = EXCLUDED.sort_order,
            updated_at = now()
          RETURNING id
        `;
        subcategoryId = String(subRows[0].id);
        subcategories++;
      }

      for (let ii = 0; ii < sub.items.length; ii++) {
        const item = sub.items[ii];
        const it = translate(item.nameUk);
        const note = item.noteUk ? translate(item.noteUk) : { ru: null, en: null };

        // Match an existing row the same way the diff does.
        const found = await sql`
          SELECT id FROM price_items
          WHERE (${item.roappServiceId}::text IS NOT NULL AND roapp_service_id = ${item.roappServiceId})
             OR (category_id = ${categoryId}
                 AND subcategory_id IS NOT DISTINCT FROM ${subcategoryId}
                 AND name_uk = ${item.nameUk})
          LIMIT 1
        `;

        let itemId: string;
        if (found.length) {
          itemId = String(found[0].id);
          await sql`
            UPDATE price_items SET
              category_id = ${categoryId},
              subcategory_id = ${subcategoryId},
              name_uk = ${item.nameUk},
              name_ru = COALESCE(${it.ru}, name_ru),
              name_en = COALESCE(${it.en}, name_en),
              price = ${item.price},
              price_numeric = ${item.priceNumeric},
              duration = ${item.duration},
              roapp_service_id = ${item.roappServiceId},
              note_uk = ${item.noteUk},
              note_ru = ${note.ru},
              note_en = ${note.en},
              is_visible = ${item.isVisible},
              source = 'import',
              sort_order = ${ii},
              updated_at = now()
            WHERE id = ${itemId}
          `;
        } else {
          const inserted = await sql`
            INSERT INTO price_items (
              category_id, subcategory_id, name_uk, name_ru, name_en,
              price, price_numeric, duration, roapp_service_id,
              note_uk, note_ru, note_en, is_visible, source, sort_order)
            VALUES (
              ${categoryId}, ${subcategoryId}, ${item.nameUk}, ${it.ru}, ${it.en},
              ${item.price}, ${item.priceNumeric}, ${item.duration}, ${item.roappServiceId},
              ${item.noteUk}, ${note.ru}, ${note.en}, ${item.isVisible}, 'import', ${ii})
            RETURNING id
          `;
          itemId = String(inserted[0].id);
        }

        seenItemIds.push(itemId);
        items++;
        if (!item.isVisible) hidden++;
      }
    }
  }

  // Rows that vanished from the spreadsheet are hidden, never deleted.
  // Guard: with an empty seen-list the `<> ALL('{}')` below is true for every
  // row, so a parse that silently produced nothing would hide the entire
  // catalogue. An empty catalogue is never a legitimate import.
  if (seenItemIds.length === 0) {
    throw new Error(
      "Refusing to apply: the parsed catalogue contained no items. " +
      "Check the spreadsheet and the sheet name before retrying.");
  }

  // Plausibility gate against a shared production database: this is the ONLY
  // implementation of this rule (the CLI at scripts/import-prices.ts used to
  // duplicate a version of it; that copy is gone so this is the single
  // source of truth and both the admin upload and the CLI inherit it).
  // A wrong workbook, or a partially-corrupted one that still parses and
  // still contains a sheet with the right name, can yield a handful of items
  // instead of the full catalogue. Nothing about the shape of that data is
  // invalid, so nothing above would refuse it — it would faithfully hide
  // hundreds of rows that "vanished" and the live public price list would
  // collapse to a fraction of itself. Recoverable (nothing is deleted, only
  // hidden), but publicly visible and alarming, so refuse before it happens.
  // Gated on N >= 50 so a genuinely small catalogue can still be seeded from
  // scratch — the guard only engages once there is a substantial live
  // catalogue worth protecting.
  const visibleImportedRows = await sql`
    SELECT count(*)::int AS n FROM price_items i
    JOIN price_categories c ON c.id = i.category_id
    WHERE i.source = 'import' AND i.is_visible = true
      AND c.slug <> ALL(${PROTECTED_CATEGORY_SLUGS})
  `;
  const visibleImportedCount = Number(visibleImportedRows[0]?.n ?? 0);
  const incomingCount = seenItemIds.length;
  if (visibleImportedCount >= 50 && incomingCount < visibleImportedCount / 2) {
    throw new Error(
      `Refusing to apply: the parsed catalogue has only ${incomingCount} items, ` +
      `but ${visibleImportedCount} imported rows are currently visible. ` +
      "Check that you uploaded the right file before retrying.");
  }

  const orphaned = await sql`
    UPDATE price_items SET is_visible = false, updated_at = now()
    WHERE source = 'import'
      AND id <> ALL(${seenItemIds}::uuid[])
      AND category_id IN (SELECT id FROM price_categories WHERE slug <> ALL(${PROTECTED_CATEGORY_SLUGS}))
    RETURNING id
  `;
  hidden += orphaned.length;

  return { categories, subcategories, items, hidden };
}
