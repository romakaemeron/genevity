import type { LoyaltyCard } from "./types";
import { walletButtonOrder, type WalletKind } from "./wallet-buttons";

export interface WalletButton {
  kind: WalletKind;
  href: string;
}

export type CardPageView =
  | { kind: "revoked" }
  | { kind: "active"; name: string; imageSrc: string; buttons: WalletButton[] };

export interface CardPageFlags {
  appleConfigured: boolean;
  /** Google "save" URL, or null when unavailable. */
  googleSaveUrl: string | null;
}

/**
 * Pure projection of a card for the public add-to-wallet page. It deliberately
 * copies only the fields the page needs: the verify token must never reach the
 * rendered output, and a revoked card exposes nothing about its holder.
 */
export function cardPageView(card: LoyaltyCard, userAgent: string | null, flags: CardPageFlags): CardPageView {
  if (card.status === "revoked") return { kind: "revoked" };
  const available: Record<WalletKind, string | null> = {
    apple: flags.appleConfigured ? `/api/loyalty/pass/${card.addToken}` : null,
    google: flags.googleSaveUrl,
  };
  const buttons: WalletButton[] = [];
  for (const kind of walletButtonOrder(userAgent)) {
    const href = available[kind];
    if (href) buttons.push({ kind, href });
  }
  return { kind: "active", name: card.holderName, imageSrc: `/loyalty/google-hero-${card.tier}.png`, buttons };
}
