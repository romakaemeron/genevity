import type { Tier } from "./types";

/**
 * Bump on every card design change (artwork, colours, texts) before deploying,
 * then press "refresh design" in the admin. Google caches pass images by URL,
 * so this is appended to Google image URLs as `?v=` to force a re-fetch.
 */
export const LOYALTY_DESIGN_VERSION = 2;

export const TIERS: readonly Tier[] = [10, 15];

export function isTier(v: unknown): v is Tier {
  return v === 10 || v === 15;
}

export interface TierStyle {
  background: string;
  foreground: string;
  label: string;
  stripFrom: string;
  stripTo: string;
  line: string;
  lineOpacity: number;
  numberGradient: [string, string];
  /** Which logo variant reads on this background. */
  logo: "dark" | "light";
}

export const TIER_STYLE: Record<Tier, TierStyle> = {
  10: {
    background: "#EDE5D8",
    foreground: "#3A3028",
    label: "#8B7B6B",
    stripFrom: "#EDE5D8",
    stripTo: "#F9F5EC",
    line: "#8B7B6B",
    lineOpacity: 0.34,
    numberGradient: ["#6B5E51", "#3A3028"],
    logo: "dark",
  },
  15: {
    background: "#1B1714",
    foreground: "#F2ECE2",
    label: "#A89888",
    stripFrom: "#1B1714",
    stripTo: "#352E28",
    line: "#E2D5C1",
    lineOpacity: 0.26,
    numberGradient: ["#FAF9F6", "#C4B8AC"],
    logo: "light",
  },
};
