import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet } from "./parse-xlsx";
import { applyTaxonomy, slugify, type CatalogueCategory } from "./taxonomy";

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

  it("hides oncology, urology and intimate-injection rows", () => {
    const hidden = cats
      .flatMap((c) => c.subcategories)
      .flatMap((s) => s.items)
      .filter((i) => !i.isVisible)
      .map((i) => i.nameUk);
    expect(hidden.some((n) => n.includes("базально-клітинної карциноми"))).toBe(true);
    expect(hidden.some((n) => n.includes("Панч-біопсія"))).toBe(true);
    expect(hidden.some((n) => n.includes("циркумцизія"))).toBe(true);
    expect(hidden.some((n) => n.includes("статевого члена"))).toBe(true);
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
