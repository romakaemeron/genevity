import { describe, it, expect } from "vitest";
import { pickMatch, isImplausibleShrink, mergeManualPreservedFields } from "./apply";

describe("pickMatch", () => {
  it("prefers the id match over the name match when both exist", () => {
    expect(pickMatch("by-id", "by-name")).toBe("by-id");
  });

  it("falls back to the name match when there is no id match", () => {
    expect(pickMatch(undefined, "by-name")).toBe("by-name");
  });

  it("returns undefined when neither matched", () => {
    expect(pickMatch(undefined, undefined)).toBeUndefined();
  });

  // This is the exact precedence diff.ts uses:
  //   (item.roappServiceId ? byId.get(...) : undefined) ?? byName.get(...)
  // apply.ts's two-query id-first-then-name-fallback must agree with it, or
  // the preview and the write can land on two different rows for one
  // incoming item.
  it("matches diff.ts's `idMatch ?? nameMatch` precedence", () => {
    const idMatch = { id: "row-a" };
    const nameMatch = { id: "row-b" };
    expect(pickMatch(idMatch, nameMatch)).toBe(idMatch);
    expect(pickMatch(undefined, nameMatch)).toBe(nameMatch);
  });
});

describe("isImplausibleShrink", () => {
  it("does not engage below the 50-row threshold, however small the incoming catalogue is", () => {
    expect(isImplausibleShrink(0, 49)).toBe(false);
    expect(isImplausibleShrink(1, 49)).toBe(false);
  });

  it("engages once the baseline reaches 50 and the incoming count is under half", () => {
    expect(isImplausibleShrink(24, 50)).toBe(true);
  });

  it("does not engage when the incoming catalogue is at least half the baseline", () => {
    expect(isImplausibleShrink(25, 50)).toBe(false); // exactly half is not "under half"
    expect(isImplausibleShrink(26, 50)).toBe(false);
    expect(isImplausibleShrink(1165, 1165)).toBe(false);
  });

  it("does not engage when there is no live catalogue yet (baseline 0)", () => {
    expect(isImplausibleShrink(0, 0)).toBe(false);
  });
});

describe("mergeManualPreservedFields", () => {
  const existing = {
    id: "row-1",
    source: "manual",
    price: "1000",
    price_numeric: 1000,
    name_uk: "Hand-edited name",
    name_ru: "Ручное имя",
    name_en: "Manual name",
    note_uk: "Hand-edited note",
    note_ru: "Ручная заметка",
    note_en: "Manual note",
    is_visible: true,
  };
  const incoming = { nameUk: "Sheet name", price: "2000", priceNumeric: 2000, noteUk: "Sheet note" };
  const translated = { nameRu: "Имя из листа", nameEn: "Sheet-translated name", noteRu: "Заметка из листа", noteEn: "Sheet note en" };

  it("preserves name_uk, note_* and price fields on a manual row, and keeps source manual", () => {
    const merged = mergeManualPreservedFields(existing, incoming, translated);
    expect(merged).toEqual({
      nameUk: "Hand-edited name",
      nameRu: "Ручное имя",
      nameEn: "Manual name",
      price: "1000",
      priceNumeric: 1000,
      noteUk: "Hand-edited note",
      noteRu: "Ручная заметка",
      noteEn: "Manual note",
      source: "manual",
    });
  });

  it("takes the incoming sheet values on a non-manual (import) row, and sets source import", () => {
    const merged = mergeManualPreservedFields({ ...existing, source: "import" }, incoming, translated);
    expect(merged).toEqual({
      nameUk: "Sheet name",
      nameRu: "Имя из листа",
      nameEn: "Sheet-translated name",
      price: "2000",
      priceNumeric: 2000,
      noteUk: "Sheet note",
      noteRu: "Заметка из листа",
      noteEn: "Sheet note en",
      source: "import",
    });
  });

  it("falls back to the existing translation on an import row when the translator returns null", () => {
    const merged = mergeManualPreservedFields(
      { ...existing, source: "import" },
      incoming,
      { nameRu: null, nameEn: null, noteRu: null, noteEn: null },
    );
    expect(merged.nameRu).toBe("Ручное имя");
    expect(merged.nameEn).toBe("Manual name");
    // Notes have no such fallback — a null translation of a present note is
    // still the correct outcome for that locale, unlike names.
    expect(merged.noteRu).toBeNull();
    expect(merged.noteEn).toBeNull();
  });
});
