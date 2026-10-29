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
  /** Google Wallet credentials are set up; the link itself is minted at click time by the google route. */
  googleConfigured: boolean;
}

/**
 * Pure projection of a card for the public add-to-wallet page. It copies only
 * the fields the page needs: the view model never exposes the verify token as a
 * field or value of its own, and the revoked view contains nothing about the
 * holder. Button hrefs are plain same-origin routes; no signed JWT is ever
 * placed in the page.
 */
export function cardPageView(card: LoyaltyCard, userAgent: string | null, flags: CardPageFlags): CardPageView {
  if (card.status === "revoked") return { kind: "revoked" };
  const available: Record<WalletKind, string | null> = {
    apple: flags.appleConfigured ? `/api/loyalty/pass/${card.addToken}` : null,
    google: flags.googleConfigured ? `/api/loyalty/google/${card.addToken}` : null,
  };
  const buttons: WalletButton[] = [];
  for (const kind of walletButtonOrder(userAgent)) {
    const href = available[kind];
    if (href) buttons.push({ kind, href });
  }
  return { kind: "active", name: card.holderName, imageSrc: `/loyalty/google-hero-${card.tier}.png`, buttons };
}
