import type { CatalogueCategory } from "./taxonomy";

export interface ExistingRow {
  id: string;
  categorySlug: string;
  subcategorySlug: string | null;
  nameUk: string;
  price: string;
  roappServiceId: string | null;
  source: string;
}

export type ChangeKind = "added" | "price-changed" | "renamed" | "removed" | "unchanged";

export interface Change {
  kind: ChangeKind;
  nameUk: string;
  categorySlug: string;
  previousName?: string;
  previousPrice?: string;
  nextPrice?: string;
  existingId?: string;
  isManualConflict: boolean;
}

export interface DiffResult {
  changes: Change[];
  counts: Record<ChangeKind, number>;
}

/** Secondary key when a row carries no RoApp service id. */
function nameKey(categorySlug: string, subSlug: string | null, name: string): string {
  return `${categorySlug}::${subSlug ?? ""}::${name.trim().toLowerCase()}`;
}

export function diffCatalogue(
  incoming: CatalogueCategory[],
  existing: ExistingRow[],
): DiffResult {
  const byId = new Map<string, ExistingRow>();
  const byName = new Map<string, ExistingRow>();
  for (const row of existing) {
    if (row.roappServiceId) byId.set(row.roappServiceId, row);
    byName.set(nameKey(row.categorySlug, row.subcategorySlug, row.nameUk), row);
  }

  const changes: Change[] = [];
  const matched = new Set<string>();

  for (const cat of incoming) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        const subSlug = sub.labelUk ? sub.slug : null;
        const hit =
          (item.roappServiceId ? byId.get(item.roappServiceId) : undefined) ??
          byName.get(nameKey(cat.slug, subSlug, item.nameUk));

        if (!hit) {
          changes.push({
            kind: "added", nameUk: item.nameUk, categorySlug: cat.slug,
            nextPrice: item.price, isManualConflict: false,
          });
          continue;
        }

        matched.add(hit.id);
        const renamed = hit.nameUk.trim() !== item.nameUk.trim();
        const repriced = hit.price.trim() !== item.price.trim();

        if (!renamed && !repriced) {
          changes.push({
            kind: "unchanged", nameUk: item.nameUk, categorySlug: cat.slug,
            existingId: hit.id, isManualConflict: false,
          });
          continue;
        }

        changes.push({
          kind: renamed ? "renamed" : "price-changed",
          nameUk: item.nameUk,
          categorySlug: cat.slug,
          previousName: renamed ? hit.nameUk : undefined,
          previousPrice: hit.price,
          nextPrice: item.price,
          existingId: hit.id,
          isManualConflict: hit.source === "manual",
        });
      }
    }
  }

  for (const row of existing) {
    if (matched.has(row.id)) continue;
    changes.push({
      kind: "removed", nameUk: row.nameUk, categorySlug: row.categorySlug,
      previousPrice: row.price, existingId: row.id,
      isManualConflict: row.source === "manual",
    });
  }

  const counts: Record<ChangeKind, number> = {
    added: 0, "price-changed": 0, renamed: 0, removed: 0, unchanged: 0,
  };
  for (const c of changes) counts[c.kind]++;

  return { changes, counts };
}
