import { sql } from "../client";
import { generateToken, isWellFormedToken } from "@/lib/loyalty/tokens";
import { rowToCard } from "@/lib/loyalty/rows";
import type { LoyaltyCard, Tier } from "@/lib/loyalty/types";

/** Friends loyalty cards. Server-only: imports the DB client. */

const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: unknown }).code === UNIQUE_VIOLATION;
}

async function insertOnce(input: { holderName: string; tier: Tier; issuedBy: string }): Promise<LoyaltyCard> {
  const rows = await sql`
    INSERT INTO loyalty_cards (add_token, verify_token, holder_name, tier, issued_by)
    VALUES (${generateToken()}, ${generateToken()}, ${input.holderName}, ${input.tier}, ${input.issuedBy})
    RETURNING *`;
  return rowToCard(rows[0]);
}

/** Tokens are 192 random bits, so a collision is practically impossible; retry once anyway. */
export async function insertCard(input: { holderName: string; tier: Tier; issuedBy: string }): Promise<LoyaltyCard> {
  try {
    return await insertOnce(input);
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;
    return insertOnce(input);
  }
}

export async function getCardById(id: string): Promise<LoyaltyCard | null> {
  const rows = await sql`SELECT * FROM loyalty_cards WHERE id = ${id}`;
  return rows[0] ? rowToCard(rows[0]) : null;
}

export async function getCardByAddToken(token: string): Promise<LoyaltyCard | null> {
  if (!isWellFormedToken(token)) return null;
  const rows = await sql`SELECT * FROM loyalty_cards WHERE add_token = ${token}`;
  return rows[0] ? rowToCard(rows[0]) : null;
}

export async function getCardByVerifyToken(token: string): Promise<LoyaltyCard | null> {
  if (!isWellFormedToken(token)) return null;
  const rows = await sql`SELECT * FROM loyalty_cards WHERE verify_token = ${token}`;
  return rows[0] ? rowToCard(rows[0]) : null;
}

export async function listCards(): Promise<LoyaltyCard[]> {
  const rows = await sql`SELECT * FROM loyalty_cards ORDER BY issued_at DESC`;
  return rows.map(rowToCard);
}

/**
 * Revokes an active card. An already revoked card is returned unchanged
 * (revoked_at/by are not overwritten); an unknown id yields null.
 */
export async function markRevoked(id: string, revokedBy: string): Promise<LoyaltyCard | null> {
  const updated = await sql`
    UPDATE loyalty_cards
    SET status = 'revoked', revoked_by = ${revokedBy}, revoked_at = now()
    WHERE id = ${id} AND status = 'active'
    RETURNING *`;
  if (updated[0]) return rowToCard(updated[0]);
  return getCardById(id);
}

export async function setGoogleObjectId(id: string, objectId: string): Promise<void> {
  await sql`UPDATE loyalty_cards SET google_object_id = ${objectId} WHERE id = ${id}`;
}
