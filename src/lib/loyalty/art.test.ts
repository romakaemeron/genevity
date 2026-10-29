import { describe, it, expect } from "vitest";
import { artSvg } from "./art";

describe("artSvg", () => {
  it("renders tier 10 strip", () => {
    const svg = artSvg({ tier: 10, width: 375, height: 144 });
    expect(svg).toContain("−10%");
    expect(svg).toContain(">10%</text>");
    expect(svg).toContain("ПЕРСОНАЛЬНА ЗНИЖКА");
    expect(svg).toContain('viewBox="0 0 375 144"');
    expect(svg).toContain("Tenor Sans");
    expect(svg).toContain("Mulish");
  });
  it("renders tier 15 with its gradient", () => {
    const svg = artSvg({ tier: 15, width: 1032, height: 336 });
    expect(svg).toContain("−15%");
    expect(svg).toContain("#352E28");
    expect(svg).toContain('viewBox="0 0 1032 336"');
  });
  it("is deterministic and carries no holder name", () => {
    const a = artSvg({ tier: 10, width: 375, height: 144 });
    expect(artSvg({ tier: 10, width: 375, height: 144 })).toBe(a);
    expect(artSvg.length).toBe(1);
    expect(a.match(/<text /g)).toHaveLength(2);
  });
});
