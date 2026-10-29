import { describe, expect, it } from "vitest";
import { qrSvg } from "./qr";

describe("qrSvg", () => {
  it("returns an SVG string with a path", async () => {
    const svg = await qrSvg("https://genevity.com.ua/card/x");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("path");
  });
});
