import { describe, it, expect } from "vitest";
import { diffCatalogue, type ExistingRow } from "./diff";
import type { CatalogueCategory } from "./taxonomy";

function cat(items: { name: string; price: string; id?: string | null }[]): CatalogueCategory[] {
  return [{
    slug: "test", labelUk: "Test", isVisible: true,
    subcategories: [{
      slug: "sub", labelUk: "Sub", isVisible: true,
      items: items.map((i) => ({
        roappServiceId: i.id === undefined ? "100" : i.id,
        nameUk: i.name, duration: null, price: i.price,
        priceNumeric: Number(i.price), noteUk: null, isVisible: true,
      })),
    }],
  }];
}

const existing = (over: Partial<ExistingRow> = {}): ExistingRow => ({
  id: "row-1", categorySlug: "test", subcategorySlug: "sub",
  nameUk: "Процедура", price: "500", roappServiceId: "100",
  source: "import", ...over,
});

describe("diffCatalogue", () => {
  it("reports an identical row as unchanged", () => {
    const d = diffCatalogue(cat([{ name: "Процедура", price: "500" }]), [existing()]);
    expect(d.counts.unchanged).toBe(1);
    expect(d.counts.added).toBe(0);
  });

  it("detects a price change matched by service id", () => {
    const d = diffCatalogue(cat([{ name: "Процедура", price: "800" }]), [existing()]);
    const change = d.changes.find((c) => c.kind === "price-changed")!;
    expect(change.previousPrice).toBe("500");
    expect(change.nextPrice).toBe("800");
    expect(change.existingId).toBe("row-1");
  });

  it("detects a rename matched by service id", () => {
    const d = diffCatalogue(cat([{ name: "Процедура нова", price: "500" }]), [existing()]);
    const change = d.changes.find((c) => c.kind === "renamed")!;
    expect(change.previousName).toBe("Процедура");
    expect(change.nameUk).toBe("Процедура нова");
  });

  it("reports rename when name and price both change", () => {
    const d = diffCatalogue(cat([{ name: "Нова", price: "900" }]), [existing()]);
    const change = d.changes.find((c) => c.kind === "renamed")!;
    expect(change.previousPrice).toBe("500");
    expect(change.nextPrice).toBe("900");
  });

  it("falls back to name matching when there is no service id", () => {
    const d = diffCatalogue(
      cat([{ name: "Процедура", price: "800", id: null }]),
      [existing({ roappServiceId: null })]);
    expect(d.counts["price-changed"]).toBe(1);
    expect(d.counts.added).toBe(0);
  });

  it("reports an unmatched incoming row as added", () => {
    const d = diffCatalogue(cat([{ name: "Зовсім нова", price: "100", id: "999" }]), [existing()]);
    expect(d.counts.added).toBe(1);
    expect(d.counts.removed).toBe(1);
  });

  it("reports an existing row missing from the sheet as removed", () => {
    const d = diffCatalogue(cat([]), [existing()]);
    const change = d.changes.find((c) => c.kind === "removed")!;
    expect(change.nameUk).toBe("Процедура");
    expect(change.existingId).toBe("row-1");
  });

  it("flags a change over a hand-edited row as a manual conflict", () => {
    const d = diffCatalogue(
      cat([{ name: "Процедура", price: "800" }]),
      [existing({ source: "manual" })]);
    expect(d.changes.find((c) => c.kind === "price-changed")!.isManualConflict).toBe(true);
  });

  it("does not flag an unchanged manual row as a conflict", () => {
    const d = diffCatalogue(
      cat([{ name: "Процедура", price: "500" }]),
      [existing({ source: "manual" })]);
    expect(d.changes.every((c) => !c.isManualConflict)).toBe(true);
  });
});
