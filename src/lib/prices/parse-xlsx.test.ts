import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseGenevitySheet, parsePrice, type ParsedCategory } from "./parse-xlsx";

const XLSX = path.resolve(__dirname, "../../../Прайс Геліос-4.xlsx");

describe("parsePrice", () => {
  it("strips thousands separators and keeps the display string", () => {
    expect(parsePrice("40 000")).toEqual({ display: "40 000", numeric: 40000 });
  });
  it("normalizes Excel floats to integers", () => {
    expect(parsePrice("950.0")).toEqual({ display: "950", numeric: 950 });
  });
  it("handles bare small numbers", () => {
    expect(parsePrice("10")).toEqual({ display: "10", numeric: 10 });
  });
  it("normalizes non-breaking space separators to ordinary spaces", () => {
    expect(parsePrice("1\u00A0500")).toEqual({ display: "1 500", numeric: 1500 });
  });
});

describe("parseGenevitySheet", () => {
  let cats: ParsedCategory[];
  beforeAll(async () => {
    cats = await parseGenevitySheet(fs.readFileSync(XLSX));
  });

  it("finds 8 numbered categories plus the consultations block", () => {
    expect(cats.map((c) => c.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("reads the consultations block at the top of the sheet as category 0", () => {
    const consultations = cats.find((c) => c.index === 0)!;
    expect(consultations.labelUk).toBe("Консультації лікарів");
    expect(consultations.subcategories.flatMap((s) => s.items)).toHaveLength(24);
  });

  it("names them as the sheet does", () => {
    const byIndex = (n: number) => cats.find((c) => c.index === n)!;
    expect(byIndex(1).labelUk).toBe("Апаратні процедури");
    expect(byIndex(2).labelUk).toBe("Лазерна епіляція");
    expect(byIndex(6).labelUk).toBe("Подологія");
  });

  it("parses 575 priced rows in total, consultations included", () => {
    const total = cats.reduce(
      (n, c) => n + c.subcategories.reduce((m, s) => m + s.items.length, 0), 0);
    expect(total).toBe(575);
  });

  it("groups laser epilation into women's and men's subcategories", () => {
    const laser = cats.find((c) => c.index === 2)!;
    expect(laser.subcategories.map((s) => s.labelUk)).toEqual([
      "Жіноча лазерна епіляція",
      "Чоловіча лазерна епіляція",
    ]);
  });

  it("reads the corrected epilation prices from the sheet", () => {
    const women = cats.find((c) => c.index === 2)!.subcategories[0];
    const pahvy = women.items.find((i) => i.nameUk === "Пахви")!;
    const bikini = women.items.find((i) => i.nameUk === "Повне бікіні")!;
    expect(pahvy.priceNumeric).toBe(810);
    expect(bikini.priceNumeric).toBe(1540);
  });

  it("captures duration, RoApp id and notes", () => {
    const apparatus = cats.find((c) => c.index === 1)!;
    const smas = apparatus.subcategories.find((s) => s.labelUk === "SMAS-ліфтінг ULTRAFORMER")!;
    const full = smas.items.find((i) => i.nameUk.startsWith("Full face"))!;
    expect(full.duration).toBe("90");
    expect(full.roappServiceId).toBe("10001");
    expect(full.priceNumeric).toBe(40000);

    const noted = apparatus.subcategories
      .flatMap((s) => s.items)
      .find((i) => i.noteUk?.includes("Гармаш"));
    expect(noted).toBeDefined();
  });

  it("preserves the one non-numeric duration verbatim", () => {
    const odd = cats
      .flatMap((c) => c.subcategories)
      .flatMap((s) => s.items)
      .filter((i) => i.duration !== null && !/^\d+$/.test(i.duration));
    expect(odd.map((i) => i.duration)).toContain("15/30");
  });

  it("keeps a group header that is followed straight by another header", () => {
    const apparatus = cats.find((c) => c.index === 1)!;
    const exion = apparatus.subcategories.find(
      (s) => s.labelUk === "1. Фракційний мікроігольчастий RF")!;
    expect(exion.groupUk).toBe("Exion");

    const emsculpt = apparatus.subcategories.find((s) => s.labelUk === "EmSculpt")!;
    expect(emsculpt.groupUk).toBe("RF-ліфтінг");
  });

  it("leaves groupUk null for an ordinary subcategory", () => {
    const laser = cats.find((c) => c.index === 2)!;
    expect(laser.subcategories[0].groupUk).toBeNull();
  });

  it("loses no header text anywhere in the sheet", () => {
    const groups = new Set(
      cats.flatMap((c) => c.subcategories).map((s) => s.groupUk).filter(Boolean));
    expect(groups).toContain("Exion");
    expect(groups).toContain("RF-ліфтінг");
    expect(groups).toContain("Естетична хірургія");
    expect(groups).toContain("Естетична медицина");
  });

  it("puts subcategory-less items in an unnamed bucket", () => {
    const podology = cats.find((c) => c.index === 6)!;
    expect(podology.subcategories[0].labelUk).toBe("");
    expect(podology.subcategories[0].items.length).toBeGreaterThan(30);
  });
});
