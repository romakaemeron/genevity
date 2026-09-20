import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "./parse-xlsx";
import { applyTaxonomy } from "./taxonomy";
import { PRICE_TRANSLATIONS, translate } from "./translations";

const XLSX = path.resolve(__dirname, "../../../Прайс Геліос-4.xlsx");

describe("translate", () => {
  it("returns nulls for an unknown string so pick() falls back to uk", () => {
    expect(translate("не існує в каталозі")).toEqual({ ru: null, en: null });
  });

  it("keeps device brand names unchanged", () => {
    expect(translate("SMAS-ліфтінг ULTRAFORMER").en).toContain("ULTRAFORMER");
    expect(translate("SMAS-ліфтінг ULTRAFORMER").ru).toContain("ULTRAFORMER");
  });

  it("translates anatomy into medical Russian and English", () => {
    expect(translate("Обличчя")).toEqual({ ru: "Лицо", en: "Face" });
    expect(translate("Шия")).toEqual({ ru: "Шея", en: "Neck" });
  });

  it("translates parenthetical qualifiers", () => {
    const t = translate("Full face (щоки, очі, лоб)");
    expect(t.ru).toBe("Full face (щёки, глаза, лоб)");
    expect(t.en).toBe("Full face (cheeks, eyes, forehead)");
  });
});

describe("coverage", () => {
  it("covers every distinct string in the catalogue", async () => {
    const cats = applyTaxonomy(await parseGenevitySheet(fs.readFileSync(XLSX)));
    const missing: string[] = [];
    for (const c of cats) {
      if (!PRICE_TRANSLATIONS[c.labelUk]) missing.push(c.labelUk);
      for (const s of c.subcategories) {
        if (s.labelUk && !PRICE_TRANSLATIONS[s.labelUk]) missing.push(s.labelUk);
        for (const i of s.items) {
          if (!PRICE_TRANSLATIONS[i.nameUk]) missing.push(i.nameUk);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("has no empty translations", () => {
    const empties = Object.entries(PRICE_TRANSLATIONS)
      .filter(([, v]) => !v.ru?.trim() || !v.en?.trim())
      .map(([k]) => k);
    expect(empties).toEqual([]);
  });
});
