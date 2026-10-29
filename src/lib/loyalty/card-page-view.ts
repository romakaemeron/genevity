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
 * Pure projection of a card for the public add-to-wallet page. It copies only
 * the fields the page needs: the view model never exposes the verify token as a
 * field or value of its own, and the revoked view contains nothing about the
 * holder. (The Google save URL in `buttons` is a signed JWT that embeds the
 * pass payload, QR value included; that is intended, see the page.)
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

/**
 * Resolves the Google save URL without ever throwing: a misconfigured service
 * account must hide only the Google button, not break the page. Logs a
 * sanitized marker only (no message, no key material).
 */
export async function safeGoogleSaveUrl(
  card: LoyaltyCard,
  create: (card: LoyaltyCard) => Promise<string | null>,
): Promise<string | null> {
  if (card.status !== "active") return null;
  try {
    return await create(card);
  } catch (err) {
    console.error("google save url failed", err instanceof Error ? err.name : "unknown");
    return null;
  }
}
