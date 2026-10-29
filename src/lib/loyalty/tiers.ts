import type { Tier } from "./types";

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
    background: "#D6C6B1",
    foreground: "#33291F",
    label: "#5F4F3F",
    stripFrom: "#D6C6B1",
    stripTo: "#E6D9C7",
    line: "#5A4D42",
    lineOpacity: 0.4,
    numberGradient: ["#4E4137", "#33291F"],
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
