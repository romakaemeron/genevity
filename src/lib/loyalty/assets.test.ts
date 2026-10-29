import { describe, it, expect } from "vitest";
import sharp from "sharp";
import path from "node:path";

const root = process.cwd();
const apple = (tier: number, f: string) => path.join(root, "src/lib/loyalty/assets/apple", String(tier), f);
const pub = (f: string) => path.join(root, "public/loyalty", f);

const expected: Array<[string, number, number]> = [];
for (const tier of [10, 15]) {
  expected.push(
    [apple(tier, "logo.png"), 160, 36],
    [apple(tier, "logo@2x.png"), 320, 72],
    [apple(tier, "logo@3x.png"), 480, 108],
    [apple(tier, "strip.png"), 375, 144],
    [apple(tier, "strip@2x.png"), 750, 288],
    [apple(tier, "strip@3x.png"), 1125, 432],
    [apple(tier, "icon.png"), 29, 29],
    [apple(tier, "icon@2x.png"), 58, 58],
    [apple(tier, "icon@3x.png"), 87, 87],
    [pub(`google-hero-${tier}.png`), 1032, 336],
    [pub(`google-logo-${tier}.png`), 660, 660],
  );
}

describe("generated loyalty assets", () => {
  it.each(expected)("%s is %ix%i", async (file, w, h) => {
    const m = await sharp(file).metadata();
    expect(m.width).toBe(w);
    expect(m.height).toBe(h);
  });
});
