import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "./parse-xlsx";
import { applyTaxonomy, normalizeUnits, slugify, type CatalogueCategory } from "./taxonomy";

const XLSX = path.resolve(__dirname, "../../../Прайс Геліос-4.xlsx");

describe("slugify", () => {
  it("transliterates Ukrainian to a URL-safe slug", () => {
    expect(slugify("Апаратні процедури")).toBe("aparatni-protsedury");
    expect(slugify("Лазерна епіляція")).toBe("lazerna-epilyatsiya");
  });
  it("collapses punctuation and case", () => {
    expect(slugify("SMAS-ліфтінг ULTRAFORMER")).toBe("smas-liftinh-ultraformer");
    expect(slugify("Ін'єкційна косметологія")).toBe("inyektsiyna-kosmetolohiya");
  });
});

describe("normalizeUnits", () => {
  it("converts a trailing 2 after см/мм/м into a superscript", () => {
    expect(normalizeUnits("Видалення тату хірургічним шляхом (1 см2)")).toBe(
      "Видалення тату хірургічним шляхом (1 см²)",
    );
  });
  it("leaves range digits intact and converts only the trailing unit digit", () => {
    expect(normalizeUnits("1-3 см2")).toBe("1-3 см²");
  });
  it("leaves a dimension expression alone and converts only the trailing unit digit", () => {
    expect(normalizeUnits("Живіт (20*20 см2)")).toBe("Живіт (20*20 см²)");
  });
  it("does not touch a bare unit with no digit", () => {
    expect(normalizeUnits("10 см")).toBe("10 см");
  });
  it("leaves a string with no units unchanged", () => {
    expect(normalizeUnits("PolyPhil Hair")).toBe("PolyPhil Hair");
  });
});

describe("applyTaxonomy", () => {
  let cats: CatalogueCategory[];
  beforeAll(async () => {
    cats = applyTaxonomy(await parseGenevitySheet(fs.readFileSync(XLSX)));
  });

  it("produces the expected top-level categories", () => {
    expect(cats.map((c) => c.labelUk)).toEqual([
      "Апаратні процедури",
      "Лазерна епіляція",
      "Ін'єкційна косметологія",
      "Діагностичні послуги",
      "Доглядові процедури",
      "Подологія",
      "Видалення родимок, папіломив, бородавок та інші",
      "Естетична хірургія",
      "Крапельниці",
    ]);
  });

  it("never emits a consultations category", () => {
    expect(cats.find((c) => c.labelUk.includes("Консультац"))).toBeUndefined();
  });

  it("folds a device group header into its child's label", () => {
    const apparatus = cats.find((c) => c.labelUk === "Апаратні процедури")!;
    const labels = apparatus.subcategories.map((s) => s.labelUk);
    expect(labels).toContain("Exion — Фракційний мікроігольчастий RF");
    expect(labels).toContain("RF-ліфтінг — EmSculpt");
    expect(labels).not.toContain("1. Фракційний мікроігольчастий RF");
  });

  it("folds thread lift and lipofilling into injectables without their old umbrella", () => {
    const inj = cats.find((c) => c.labelUk === "Ін'єкційна косметологія")!;
    const labels = inj.subcategories.map((s) => s.labelUk);
    expect(labels).toContain("Нітковий ліфтинг");
    expect(labels).toContain("Ліпофілінг");
    expect(labels).not.toContain("Естетична медицина — Ліпофілінг");
  });

  it("hides the Крапельниці category pending price confirmation", () => {
    const drips = cats.find((c) => c.labelUk === "Крапельниці")!;
    expect(drips.isVisible).toBe(false);
    expect(drips.subcategories.flatMap((s) => s.items)).toHaveLength(1);
  });

  it("hides exactly the intended rows and no others", () => {
    // An exact-set assertion, not a `some()` spot check: the hidden set is an
    // editorial decision about what appears on a public medical price list, so
    // any drift in either direction — a row that stops hiding, or a new sheet
    // row that starts hiding — must fail this test and be re-decided, never
    // slip through silently.
    const hidden = cats
      .filter((c) => c.isVisible)          // a hidden category is a separate rule
      .flatMap((c) => c.subcategories)
      .flatMap((s) => s.items)
      .filter((i) => !i.isVisible)
      .map((i) => i.nameUk)
      .sort();
    expect(hidden).toEqual([
      "Видалення базально-клітинної карциноми (1 категорія)",
      "Видалення базально-клітинної карциноми (2 категорія)",
      "Видалення базально-клітинної карциноми (3 категорія)",
      "Корекція статевого члена філером (без вартості препарату)",
      "Лазерне обрізання крайньої плоті (циркумцизія)",
      "PRP статевого члена (1 пробірка)",
      "Панч-біопсія (без вартості гістології)",
    ].sort());
  });

  it("gives the PolyPhil variants real names", () => {
    const inj = cats.find((c) => c.labelUk === "Ін'єкційна косметологія")!;
    const polyphil = inj.subcategories.find((s) => s.labelUk === "PolyPhil")!;
    const names = polyphil.items.map((i) => i.nameUk).sort();
    expect(names).toEqual([
      "PolyPhil",
      "PolyPhil Eye",
      "PolyPhil Hair",
      "PolyPhil Next",
    ]);
  });

  it("keeps surgery visible", () => {
    const surgery = cats.find((c) => c.labelUk === "Естетична хірургія")!;
    expect(surgery.isVisible).toBe(true);
    const blepharo = surgery.subcategories
      .flatMap((s) => s.items)
      .find((i) => i.nameUk.includes("Блефаропластика верхніх повік"))!;
    expect(blepharo.isVisible).toBe(true);
    expect(blepharo.priceNumeric).toBe(50000);
  });

  it("totals 551 items — the sheet's 575 minus the 24 consultations", () => {
    const total = cats.reduce(
      (n, c) => n + c.subcategories.reduce((m, s) => m + s.items.length, 0), 0);
    expect(total).toBe(551);
  });

  it("never leaves a plain digit after см/мм/м in an item name", () => {
    const offenders = cats
      .flatMap((c) => c.subcategories)
      .flatMap((s) => s.items)
      .map((i) => i.nameUk)
      .filter((n) => /(см|мм|м)[0-9]/.test(n));
    expect(offenders).toEqual([]);
  });

  it("gives every category and subcategory a unique non-empty slug", () => {
    const slugs = cats.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((s) => s.length > 0)).toBe(true);
    for (const c of cats) {
      const subs = c.subcategories.map((s) => s.slug);
      expect(new Set(subs).size).toBe(subs.length);
    }
  });
});
