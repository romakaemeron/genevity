import { describe, it, expect } from "vitest";
import { TIERS, TIER_STYLE, isTier } from "./tiers";

describe("isTier", () => {
  it("accepts only the numbers 10 and 15", () => {
    expect(isTier(10)).toBe(true);
    expect(isTier(15)).toBe(true);
    expect(isTier("10")).toBe(false);
    expect(isTier(20)).toBe(false);
    expect(isTier(undefined)).toBe(false);
  });
});

describe("TIER_STYLE", () => {
  it("defines every field for every tier", () => {
    for (const tier of TIERS) {
      const s = TIER_STYLE[tier];
      expect(s.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.foreground).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.label).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.stripFrom).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.stripTo).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.line).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(s.lineOpacity).toBeGreaterThan(0);
      expect(s.numberGradient).toHaveLength(2);
      expect(["dark", "light"]).toContain(s.logo);
    }
  });
});
