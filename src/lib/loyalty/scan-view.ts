import type { LoyaltyCard } from "./types";

export type ScanView =
  | { kind: "not-found" }
  | { kind: "active" | "revoked"; name: string; discountLabel: string; issuedOn: string };

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Kyiv",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** dd.mm.yyyy in Kyiv time. */
function formatDate(d: Date): string {
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.day}.${parts.month}.${parts.year}`;
}

/** Pure projection of a card for the staff scan page. The name is raw data; React escapes it on render. */
export function scanView(card: LoyaltyCard | null): ScanView {
  if (!card) return { kind: "not-found" };
  return {
    kind: card.status === "revoked" ? "revoked" : "active",
    name: card.holderName,
    discountLabel: `−${card.tier}%`,
    issuedOn: formatDate(card.issuedAt),
  };
}
