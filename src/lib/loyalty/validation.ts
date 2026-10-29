import { isTier } from "./tiers";
import type { Tier } from "./types";

const NAME_MIN = 2;
const NAME_MAX = 80;

// C0/C1 control characters, which covers newlines, tabs and NUL.
const CONTROL_RE = /[\u0000-\u001F\u007F-\u009F]/;

export type IssueInput =
  | { ok: true; name: string; tier: Tier }
  | { ok: false; error: string };

/**
 * Validates the issue-card form. The name is stored verbatim (apart from
 * whitespace normalisation): HTML escaping is the renderer's job, not ours.
 */
export function parseIssueInput(raw: { name: unknown; tier: unknown }): IssueInput {
  if (typeof raw.name !== "string") return { ok: false, error: "Name is required" };
  if (CONTROL_RE.test(raw.name)) {
    return { ok: false, error: "Name contains invalid characters" };
  }
  const name = raw.name.trim().replace(/\s+/g, " ");
  const length = [...name].length;
  if (length < NAME_MIN) return { ok: false, error: "Name is too short" };
  if (length > NAME_MAX) return { ok: false, error: `Name must be at most ${NAME_MAX} characters` };

  // The tier arrives as a string from a form field and as a number from JSON.
  const tier = typeof raw.tier === "string" ? Number(raw.tier) : raw.tier;
  if (!isTier(tier)) return { ok: false, error: "Tier must be 10 or 15" };

  return { ok: true, name, tier };
}
