import { TIER_STYLE } from "./tiers";
import type { Tier } from "./types";

export interface ArtOptions {
  tier: Tier;
  width: number;
  height: number;
}

/**
 * Wallet strip / hero artwork: fine wave lines overlapping into a guilloche-style
 * moire, faded in from the right. Port of the approved preview's `art()` (no holder name).
 * Text is live SVG text: the renderer must provide Mulish SemiBold and Tenor Sans.
 * Tenor Sans has no U+2212 minus glyph and resvg then drops the whole run to the fallback
 * font (a tspan does not help either), so the minus is drawn as a rect; the accessible
 * label carries the real "−N%" text.
 */
export function artSvg({ tier, width: w, height: h }: ArtOptions): string {
  const t = TIER_STYLE[tier];
  const size = h * 0.4;
  const N = 30;
  const step = h * 0.02;
  let paths = "";
  for (let k = 0; k < N; k++) {
    const env = Math.sin((k / (N - 1)) * Math.PI);
    let d = "";
    for (let x = 0; x <= w; x += 5) {
      const y =
        h / 2 +
        (k - N / 2) * step +
        Math.sin((x / w) * Math.PI * 2.4 + k * 0.21) * h * 0.3 * env;
      d += (x === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }
    paths += `<path d="${d}"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Знижка −${tier}%">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0" stop-color="${t.stripFrom}"/><stop offset="1" stop-color="${t.stripTo}"/></linearGradient>
<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset=".22" stop-color="#000"/><stop offset=".78" stop-color="#fff"/></linearGradient>
<mask id="m"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
<linearGradient id="num" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.numberGradient[0]}"/><stop offset="1" stop-color="${t.numberGradient[1]}"/></linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<g mask="url(#m)" fill="none" stroke="${t.line}" stroke-opacity="${t.lineOpacity}" stroke-width="${(h / 230).toFixed(2)}">${paths}</g>
<text x="${w * 0.06}" y="${h * 0.27}" font-family="Mulish, sans-serif" font-weight="600" font-size="${h * 0.075}" letter-spacing="${h * 0.015}" fill="${t.label}">ПЕРСОНАЛЬНА ЗНИЖКА</text>
<rect x="${w * 0.055 + size * 0.04}" y="${h * 0.76 - size * 0.37}" width="${size * 0.34}" height="${size * 0.05}" fill="url(#num)"/>
<text x="${w * 0.055 + size * 0.5}" y="${h * 0.76}" font-family="'Tenor Sans', Georgia, serif" font-size="${size}" fill="url(#num)">${tier}%</text>
</svg>`;
}
