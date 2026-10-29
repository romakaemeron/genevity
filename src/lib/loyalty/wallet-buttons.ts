export type WalletKind = "apple" | "google";

/** Apple devices (iPhone, iPad, Mac) see Apple Wallet first; everyone else sees Google Wallet first. */
export function walletButtonOrder(userAgent: string | null): ["apple", "google"] | ["google", "apple"] {
  return userAgent && /iPhone|iPad|iPod|Macintosh/i.test(userAgent) ? ["apple", "google"] : ["google", "apple"];
}
