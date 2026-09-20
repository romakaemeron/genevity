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
  it("handles non-breaking space separators", () => {
    expect(parsePrice("1 500")).toEqual({ display: "1 500", numeric: 1500 });
  });
});

describe("parseGenevitySheet", () => {
  let cats: ParsedCategory[];
  beforeAll(async () => {
    cats = await parseGenevitySheet(fs.readFileSync(XLSX));
  });

  it("finds exactly 8 top-level categories", () => {
    expect(cats.map((c) => c.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("names them as the sheet does", () => {
    expect(cats[0].labelUk).toBe("Апаратні процедури");
    expect(cats[1].labelUk).toBe("Лазерна епіляція");
    expect(cats[5].labelUk).toBe("Подологія");
  });

  it("parses 575 items in total", () => {
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
    const smas = cats[0].subcategories.find((s) => s.labelUk === "SMAS-ліфтінг ULTRAFORMER")!;
    const full = smas.items.find((i) => i.nameUk.startsWith("Full face"))!;
    expect(full.duration).toBe("90");
    expect(full.roappServiceId).toBe("10001");
    expect(full.priceNumeric).toBe(40000);

    const noted = cats[0].subcategories
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

  it("puts subcategory-less items in an unnamed bucket", () => {
    const podology = cats.find((c) => c.index === 6)!;
    expect(podology.subcategories[0].labelUk).toBe("");
    expect(podology.subcategories[0].items.length).toBeGreaterThan(30);
  });
});
