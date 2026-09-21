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

/**
 * Decide which of two candidate matches for an incoming row wins: an id
 * match or a (category, subcategory, name) match. Pulled out so it can be
 * unit-tested without a database. Must stay in lockstep with `diff.ts`'s
 * `(item.roappServiceId ? byId.get(...) : undefined) ?? byName.get(...)` —
 * the diff always prefers the id match, so the write path must too, or the
 * preview and the actual write can land on two different rows for the same
 * incoming item.
 */
export function pickMatch<T>(idMatch: T | undefined, nameMatch: T | undefined): T | undefined {
  return idMatch ?? nameMatch;
}

/**
 * Plausibility guard arithmetic, pulled out so it can be unit-tested without
 * a database. Gated on `visibleImportedCount >= 50` so a genuinely small
 * catalogue can still be seeded from scratch — the guard only engages once
 * there is a substantial live catalogue worth protecting. Above that
 * threshold, an incoming catalogue under half the current visible count is
 * treated as implausible (wrong file, or a corrupt-but-parseable workbook).
 */
export function isImplausibleShrink(totalIncoming: number, visibleImportedCount: number): boolean {
  return visibleImportedCount >= 50 && totalIncoming < visibleImportedCount / 2;
}

interface ExistingItemRow {
  id: string;
  source: string;
  price: string;
  price_numeric: number | null;
  name_uk: string;
  name_ru: string | null;
  name_en: string | null;
  note_uk: string | null;
  note_ru: string | null;
  note_en: string | null;
  is_visible: boolean;
}

interface IncomingItemFields {
  nameUk: string;
  price: string;
  priceNumeric: number | null;
  noteUk: string | null;
}

interface TranslatedFields {
  nameRu: string | null;
  nameEn: string | null;
  noteRu: string | null;
  noteEn: string | null;
}

export interface MergedItemFields {
  nameUk: string;
  nameRu: string | null;
  nameEn: string | null;
  price: string;
  priceNumeric: number | null;
  noteUk: string | null;
  noteRu: string | null;
  noteEn: string | null;
  source: "manual" | "import";
}

/**
 * Decide, for an existing row matched by an incoming import row, which
 * fields the import is allowed to overwrite. Pulled out so it can be
 * unit-tested without a database.
 *
 * A `manual` row is the record of a hand-edit made in the admin editor. The
 * editor lets an operator change name_uk, price, and the note fields (in
 * whichever locale they're editing) — every one of those is a promise, made
 * on screen, that the next import will not silently revert it. So all of
 * them are preserved here, the same way, for the same reason: name_uk and
 * note_* get exactly the treatment price/price_numeric/name_ru/name_en
 * already had. Structural fields the sheet legitimately owns — category/
 * subcategory placement, duration, the RoApp link, sort order — are applied
 * unconditionally by the caller and are not part of this merge.
 */
export function mergeManualPreservedFields(
  existing: ExistingItemRow,
  incoming: IncomingItemFields,
  translated: TranslatedFields,
): MergedItemFields {
  const isManual = existing.source === "manual";
  if (isManual) {
    return {
      nameUk: existing.name_uk,
      nameRu: existing.name_ru,
      nameEn: existing.name_en,
      price: existing.price,
      priceNumeric: existing.price_numeric,
      noteUk: existing.note_uk,
      noteRu: existing.note_ru,
      noteEn: existing.note_en,
      source: "manual",
    };
  }
  return {
    nameUk: incoming.nameUk,
    nameRu: translated.nameRu ?? existing.name_ru,
    nameEn: translated.nameEn ?? existing.name_en,
    price: incoming.price,
    priceNumeric: incoming.priceNumeric,
    noteUk: incoming.noteUk,
    noteRu: translated.noteRu,
    noteEn: translated.noteEn,
    source: "import",
  };
}

export async function applyCatalogue(
  sql: SqlClient,
  cats: CatalogueCategory[],
): Promise<{
  categories: number;
  subcategories: number;
  items: number;
  hidden: number;
  manualSkipped: number;
}> {
  // Guards below refuse before any write happens. They used to run at the end
  // of this function, after ~1,165 sequential upserts had already landed —
  // "refuse before it happens" only holds if the check runs before the first
  // write, so it moved here. The baseline count is measured now too, before
  // this run's upserts land, so incoming rows are never counted into the
  // number they get compared against.
  const totalIncoming = cats.reduce(
    (n, cat) => n + cat.subcategories.reduce((m, sub) => m + sub.items.length, 0), 0);

  // Guard: an empty catalogue is never a legitimate import. Without this, a
  // parse that silently produced nothing would fall through to the
  // orphan-hiding UPDATE below, whose `<> ALL('{}')` is true for every row —
  // hiding the entire live catalogue.
  if (totalIncoming === 0) {
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
  if (isImplausibleShrink(totalIncoming, visibleImportedCount)) {
    throw new Error(
      `Refusing to apply: the parsed catalogue has only ${totalIncoming} items, ` +
      `but ${visibleImportedCount} imported rows are currently visible. ` +
      "Check that you uploaded the right file before retrying.");
  }

  // TODO(follow-up, deliberately deferred): the writes below are sequential
  // and untransacted — roughly 1,165 individual upserts for the full sheet.
  // A failure partway through (a dropped connection, a bad row) leaves a
  // partially-applied catalogue: some categories/items updated to the new
  // sheet, the rest still on the previous one, with no rollback. This must
  // be fixed (batching + a transaction) before the admin import surface
  // ships to the client; it is out of scope for this fix wave.

  const seenItemIds: string[] = [];
  let categories = 0, subcategories = 0, items = 0, hidden = 0, manualSkipped = 0;

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

        // Match an existing row the same way diff.ts does: id match first,
        // name match only as a fallback. Two separate queries (rather than a
        // single OR ... LIMIT 1 with no ORDER BY) so the outcome is
        // deterministic — Postgres cannot pick "the other" row when both an
        // id match and a name match exist for the same incoming item. See
        // `pickMatch` above and diff.ts's `idMatch ?? nameMatch`.
        let found: ExistingItemRow[] = [];
        if (item.roappServiceId) {
          found = (await sql`
            SELECT i.id, i.source, i.price, i.price_numeric, i.name_uk, i.name_ru, i.name_en,
                   i.note_uk, i.note_ru, i.note_en, i.is_visible
            FROM price_items i
            JOIN price_categories c ON c.id = i.category_id
            WHERE i.roapp_service_id = ${item.roappServiceId}
              AND c.slug <> ALL(${PROTECTED_CATEGORY_SLUGS})
            LIMIT 1
          `) as unknown as ExistingItemRow[];
        }
        if (!found.length) {
          found = (await sql`
            SELECT id, source, price, price_numeric, name_uk, name_ru, name_en,
                   note_uk, note_ru, note_en, is_visible
            FROM price_items
            WHERE category_id = ${categoryId}
              AND subcategory_id IS NOT DISTINCT FROM ${subcategoryId}
              AND name_uk = ${item.nameUk}
            LIMIT 1
          `) as unknown as ExistingItemRow[];
        }

        let itemId: string;
        if (found.length) {
          const existing = found[0];
          itemId = String(existing.id);
          const isManual = existing.source === "manual";
          if (isManual) manualSkipped++;

          // Visibility is an admin decision, never the importer's — is_visible
          // is never written on an existing row, no matter its source, and
          // (since it never changes here) matching an already-hidden row is
          // not this import newly hiding anything — see `hidden` below.
          //
          // A manual row also keeps its name_uk, price, price_numeric,
          // name_ru, name_en and note_* fields: those are exactly the fields
          // the admin edit screen lets an operator override, and
          // source = 'manual' is the promise (made on screen and in the
          // design spec) that the next import will not silently overwrite
          // them. Structural fields the sheet legitimately owns — category/
          // subcategory placement, duration, the RoApp link, sort order —
          // still update, and source stays 'manual' so the row keeps being
          // flagged on every future import.
          const merged = mergeManualPreservedFields(
            existing,
            { nameUk: item.nameUk, price: item.price, priceNumeric: item.priceNumeric, noteUk: item.noteUk },
            { nameRu: it.ru, nameEn: it.en, noteRu: note.ru, noteEn: note.en },
          );

          await sql`
            UPDATE price_items SET
              category_id = ${categoryId},
              subcategory_id = ${subcategoryId},
              name_uk = ${merged.nameUk},
              name_ru = ${merged.nameRu},
              name_en = ${merged.nameEn},
              price = ${merged.price},
              price_numeric = ${merged.priceNumeric},
              duration = ${item.duration},
              roapp_service_id = ${item.roappServiceId},
              note_uk = ${merged.noteUk},
              note_ru = ${merged.noteRu},
              note_en = ${merged.noteEn},
              is_visible = ${existing.is_visible},
              source = ${merged.source},
              sort_order = ${ii},
              updated_at = now()
            WHERE id = ${itemId}
          `;
          // `hidden` counts rows this import newly hid. A matched existing
          // row's is_visible never changes (see above), so it is never
          // "newly" hidden here, no matter which way it was already set —
          // counting it would report months-old hides as if this run caused
          // them. Only the orphan-hiding pass below and brand-new hidden
          // inserts are genuinely new.
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
          if (!item.isVisible) hidden++;
        }

        seenItemIds.push(itemId);
        items++;
      }
    }
  }

  const orphaned = await sql`
    UPDATE price_items SET is_visible = false, updated_at = now()
    WHERE source = 'import'
      AND id <> ALL(${seenItemIds}::uuid[])
      AND category_id IN (SELECT id FROM price_categories WHERE slug <> ALL(${PROTECTED_CATEGORY_SLUGS}))
    RETURNING id
  `;
  hidden += orphaned.length;

  return { categories, subcategories, items, hidden, manualSkipped };
}
