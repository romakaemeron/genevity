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

export type LoyaltyCardWithIssuer = LoyaltyCard & { issuerName: string | null };

/** Like listCards, plus the name of the admin who issued each card (null if unknown/deleted). */
export async function listCardsWithIssuer(): Promise<LoyaltyCardWithIssuer[]> {
  const rows = await sql`
    SELECT c.*, u.name AS issuer_name
    FROM loyalty_cards c
    LEFT JOIN cms_users u ON u.id = c.issued_by
    ORDER BY c.issued_at DESC`;
  return rows.map((r) => ({ ...rowToCard(r), issuerName: (r.issuer_name as string | null) ?? null }));
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

// ── Apple Wallet pass updates (PassKit web service) ─────────────────────────
// Callers validate ids/tokens before they get here; all values are bound parameters.

/** Hard cap per card: a holder who extracts the auth token cannot grow the table unboundedly. */
export const MAX_REGISTRATIONS_PER_CARD = 10;

/**
 * Registers (or refreshes the push token of) a device for a card.
 * Returns true when the registration is new. Keeps only the newest
 * MAX_REGISTRATIONS_PER_CARD devices per card.
 */
export async function registerAppleDevice(input: {
  deviceId: string;
  cardId: string;
  pushToken: string;
}): Promise<boolean> {
  const rows = await sql`
    INSERT INTO loyalty_apple_registrations (device_id, card_id, push_token)
    VALUES (${input.deviceId}, ${input.cardId}, ${input.pushToken})
    ON CONFLICT (device_id, card_id) DO UPDATE SET push_token = EXCLUDED.push_token
    RETURNING (xmax = 0) AS inserted`;
  await sql`
    DELETE FROM loyalty_apple_registrations
    WHERE card_id = ${input.cardId}
      AND device_id NOT IN (
        SELECT device_id FROM loyalty_apple_registrations
        WHERE card_id = ${input.cardId}
        ORDER BY created_at DESC, device_id
        LIMIT ${MAX_REGISTRATIONS_PER_CARD})`;
  return rows[0]?.inserted === true;
}

export async function unregisterAppleDevice(deviceId: string, cardId: string): Promise<void> {
  await sql`DELETE FROM loyalty_apple_registrations WHERE device_id = ${deviceId} AND card_id = ${cardId}`;
}

/** Push tokens registered for the given cards (deduplicated). */
export async function listApplePushTokensForCards(cardIds: string[]): Promise<string[]> {
  if (cardIds.length === 0) return [];
  const rows = await sql`
    SELECT DISTINCT push_token FROM loyalty_apple_registrations WHERE card_id = ANY(${cardIds}::uuid[])`;
  return rows.map((r) => r.push_token as string);
}

/** Push tokens registered for any active card (deduplicated). */
export async function listApplePushTokensForActiveCards(): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT r.push_token
    FROM loyalty_apple_registrations r
    JOIN loyalty_cards c ON c.id = r.card_id
    WHERE c.status = 'active'`;
  return rows.map((r) => r.push_token as string);
}

export interface UpdatedSerials {
  serialNumbers: string[];
  /** Opaque update tag: microseconds since epoch of the newest returned pass. */
  lastUpdated: string;
}

/**
 * Cards registered on a device whose pass changed after `sinceTag`
 * (a tag previously issued by this function; null = all). Null when none.
 * The tag is integer microseconds, so it round-trips timestamptz exactly.
 */
export async function listSerialsUpdatedSince(deviceId: string, sinceTag: string | null): Promise<UpdatedSerials | null> {
  const rows = sinceTag === null
    ? await sql`
        SELECT c.id::text AS id,
               floor(extract(epoch FROM c.pass_updated_at) * 1000000)::bigint::text AS tag
        FROM loyalty_apple_registrations r
        JOIN loyalty_cards c ON c.id = r.card_id
        WHERE r.device_id = ${deviceId}`
    : await sql`
        SELECT c.id::text AS id,
               floor(extract(epoch FROM c.pass_updated_at) * 1000000)::bigint::text AS tag
        FROM loyalty_apple_registrations r
        JOIN loyalty_cards c ON c.id = r.card_id
        WHERE r.device_id = ${deviceId}
          AND floor(extract(epoch FROM c.pass_updated_at) * 1000000)::bigint > ${sinceTag}::bigint`;
  if (rows.length === 0) return null;
  let max = BigInt(0);
  for (const r of rows) {
    const t = BigInt(r.tag as string);
    if (t > max) max = t;
  }
  return { serialNumbers: rows.map((r) => r.id as string), lastUpdated: max.toString() };
}

// HTTP Last-Modified has one-second precision, so each bump advances the
// timestamp by at least a whole second; otherwise a device that fetched the
// previous version in the same second would get a 304 for the new one.

/** Marks one card's pass as changed. */
export async function bumpPassUpdatedAt(cardId: string): Promise<void> {
  await sql`
    UPDATE loyalty_cards
    SET pass_updated_at = greatest(now(), date_trunc('second', pass_updated_at) + interval '1 second')
    WHERE id = ${cardId}`;
}

/** Marks every active card's pass as changed; returns the affected card ids. */
export async function bumpPassUpdatedAtForActiveCards(): Promise<LoyaltyCard[]> {
  const rows = await sql`
    UPDATE loyalty_cards
    SET pass_updated_at = greatest(now(), date_trunc('second', pass_updated_at) + interval '1 second')
    WHERE status = 'active'
    RETURNING *`;
  return rows.map(rowToCard);
}

/** Drops every registration using a push token APNs reported as dead. */
export async function deleteRegistrationsByPushToken(pushToken: string): Promise<void> {
  await sql`DELETE FROM loyalty_apple_registrations WHERE push_token = ${pushToken}`;
}
