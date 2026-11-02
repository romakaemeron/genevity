import {
  deleteRegistrationsByPushToken,
  listApplePushTokensForActiveCards,
  listApplePushTokensForCards,
} from "@/lib/db/queries/loyalty";
import { isApnsConfigured, pushPassUpdates, summarizePushes } from "./apns";
import { getAccessToken, readGoogleCreds, updateObject, upsertGenericClass } from "./google";
import { TIERS } from "./tiers";
import type { LoyaltyCard } from "./types";

/** Server-only orchestration: tells wallets that issued passes changed. */

export interface PushCounts {
  pushed: number;
  failed: number;
}

async function push(tokens: string[]): Promise<PushCounts> {
  if (tokens.length === 0) return { pushed: 0, failed: 0 };
  if (!isApnsConfigured()) return { pushed: 0, failed: new Set(tokens).size };
  const outcomes = await pushPassUpdates(tokens, {
    topic: process.env.APPLE_PASS_TYPE_ID!.trim(),
    onDeadToken: deleteRegistrationsByPushToken,
  });
  return summarizePushes(outcomes);
}

/** Pushes to devices holding the given cards. Callers bump pass_updated_at first. */
export async function notifyAppleForCards(cardIds: string[]): Promise<PushCounts> {
  return push(await listApplePushTokensForCards(cardIds));
}

/** Pushes to every device holding an active card. */
export async function notifyAppleForActiveCards(): Promise<PushCounts> {
  return push(await listApplePushTokensForActiveCards());
}

export interface GoogleCounts {
  updated: number;
  /** Cards Google has no object for: the holder never saved them to Google Wallet. */
  notSaved: number;
  failed: number;
}

const GOOGLE_CONCURRENCY = 5;

/**
 * Re-applies both tier classes, then re-sends each card's object so the
 * current design (texts, colours, versioned image URLs) shows in Google Wallet.
 * Per-card best effort; returns null when Google is not configured.
 */
export async function refreshGoogleObjects(cards: LoyaltyCard[]): Promise<GoogleCounts | null> {
  const maybeCreds = readGoogleCreds();
  if (!maybeCreds) return null;
  const creds = maybeCreds;
  const counts: GoogleCounts = { updated: 0, notSaved: 0, failed: 0 };
  if (cards.length === 0) return counts;

  let token: string;
  try {
    token = await getAccessToken(creds);
  } catch {
    return { ...counts, failed: cards.length };
  }

  for (const tier of TIERS) {
    try {
      await upsertGenericClass(creds, token, tier);
    } catch {
      // Objects still carry the design themselves; keep going.
    }
  }

  let next = 0;
  async function worker() {
    while (next < cards.length) {
      const card = cards[next++];
      try {
        if (await updateObject(card, creds, token)) counts.updated++;
        else counts.notSaved++;
      } catch {
        counts.failed++;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(GOOGLE_CONCURRENCY, cards.length) }, worker));
  return counts;
}
