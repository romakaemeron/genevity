/** Discount tier of a friends loyalty card, in percent. */
export type Tier = 10 | 15;

export type CardStatus = "active" | "revoked";

export interface LoyaltyCard {
  id: string;
  /** Public token in the "add to wallet" link the holder receives. */
  addToken: string;
  /** Token encoded in the QR code; resolves to the staff verify page. */
  verifyToken: string;
  holderName: string;
  tier: Tier;
  status: CardStatus;
  issuedBy: string | null;
  issuedAt: Date;
  revokedBy: string | null;
  revokedAt: Date | null;
  googleObjectId: string | null;
  /** Per-card secret Apple Wallet sends back as `Authorization: ApplePass <token>`. */
  appleAuthToken: string;
  /** Bumped when the pass content changes; drives PassKit update polling. */
  passUpdatedAt: Date;
}
