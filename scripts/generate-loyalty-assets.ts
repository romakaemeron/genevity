/**
 * Generates wallet pass images (Apple Wallet + Google Wallet) from code.
 * Run: npx tsx scripts/generate-loyalty-assets.ts
 * Fonts are loaded explicitly (no system fonts) so a missing font fails visibly.
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { artSvg } from "../src/lib/loyalty/art";
import { TIER_STYLE } from "../src/lib/loyalty/tiers";
import type { Tier } from "../src/lib/loyalty/types";

const root = path.resolve(__dirname, "..");
const fontFiles = [
  path.join(root, "scripts/fonts/TenorSans-Regular.ttf"),
  path.join(root, "scripts/fonts/Mulish-SemiBold.ttf"),
];
for (const f of fontFiles) readFileSync(f); // throws if missing

function render(svg: string, width: number): Buffer {
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Mulish" },
  });
  return Buffer.from(r.render().asPng());
}

/** Inner content of a brand SVG plus its viewBox size, for nesting into another SVG. */
function brand(file: string) {
  const src = readFileSync(path.join(root, "public/brand", file), "utf8");
  const vb = src.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/)!;
  const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { w: Number(vb[1]), h: Number(vb[2]), inner };
}

/** Place a brand SVG centered and contained inside a box. */
function place(file: string, boxW: number, boxH: number, pad: number, cx = boxW / 2, cy = boxH / 2) {
  const b = brand(file);
  const s = Math.min((boxW - pad * 2) / b.w, (boxH - pad * 2) / b.h);
  return `<g transform="translate(${cx - (b.w * s) / 2} ${cy - (b.h * s) / 2}) scale(${s})">${b.inner}</g>`;
}

function svgDoc(w: number, h: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;
}

const tiers: Tier[] = [10, 15];
for (const tier of tiers) {
  const t = TIER_STYLE[tier];
  const dir = path.join(root, "src/lib/loyalty/assets/apple", String(tier));
  mkdirSync(dir, { recursive: true });
  const cap = t.logo === "dark" ? "Dark" : "Light";

  // Apple strip 375x144 pt at 1x/2x/3x.
  const strip = artSvg({ tier, width: 375, height: 144 });
  for (const [suffix, k] of [["", 1], ["@2x", 2], ["@3x", 3]] as const) {
    writeFileSync(path.join(dir, `strip${suffix}.png`), render(strip, 375 * k));
  }

  // Apple logo 160x36 pt: full wordmark on transparent background.
  const logo = svgDoc(160, 36, place(`LogoFull${cap}.svg`, 160, 36, 0));
  // Apple icon 29 pt: symbol mark on the tier background.
  const icon = svgDoc(
    29,
    29,
    `<rect width="29" height="29" fill="${t.background}"/>${place(`Logo${cap}.svg`, 29, 29, 4)}`,
  );
  for (const [suffix, k] of [["", 1], ["@2x", 2], ["@3x", 3]] as const) {
    writeFileSync(path.join(dir, `logo${suffix}.png`), render(logo, 160 * k));
    writeFileSync(path.join(dir, `icon${suffix}.png`), render(icon, 29 * k));
  }

  // Google hero 1032x336 and logo 660x660 (light mark on a filled circle).
  const pub = path.join(root, "public/loyalty");
  mkdirSync(pub, { recursive: true });
  writeFileSync(path.join(pub, `google-hero-${tier}.png`), render(artSvg({ tier, width: 1032, height: 336 }), 1032));
  const circle = tier === 10 ? "#6B5E51" : "#3A322B";
  const glogo = svgDoc(
    660,
    660,
    `<circle cx="330" cy="330" r="330" fill="${circle}"/>${place("LogoLight.svg", 660, 660, 150)}`,
  );
  writeFileSync(path.join(pub, `google-logo-${tier}.png`), render(glogo, 660));
}
console.log("loyalty assets generated");
