import type { CardStatus, LoyaltyCard, Tier } from "./types";

function toDate(v: unknown): Date {
  return v instanceof Date ? v : new Date(v as string);
}

function toDateOrNull(v: unknown): Date | null {
  return v == null ? null : toDate(v);
}

/** Maps a `loyalty_cards` row (snake_case) to the camelCase domain type. */
export function rowToCard(row: Record<string, unknown>): LoyaltyCard {
  return {
    id: row.id as string,
    addToken: row.add_token as string,
    verifyToken: row.verify_token as string,
    holderName: row.holder_name as string,
    tier: Number(row.tier) as Tier,
    status: row.status as CardStatus,
    issuedBy: (row.issued_by as string | null) ?? null,
    issuedAt: toDate(row.issued_at),
    revokedBy: (row.revoked_by as string | null) ?? null,
    revokedAt: toDateOrNull(row.revoked_at),
    googleObjectId: (row.google_object_id as string | null) ?? null,
  };
}
