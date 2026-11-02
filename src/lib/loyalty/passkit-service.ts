import {
  getCardById,
  listSerialsUpdatedSince,
  registerAppleDevice,
  unregisterAppleDevice,
} from "@/lib/db/queries/loyalty";
import { generatePkpass, isAppleConfigured } from "./apple";
import {
  isOurPassType,
  isValidDeviceId,
  isValidPushToken,
  isValidSerial,
  parseUpdatedSinceTag,
  readApplePassAuth,
  readBodyLimited,
  sanitizeLogLine,
  tokensEqual,
} from "./passkit";
import type { LoyaltyCard } from "./types";

/**
 * Apple PassKit web service (Wallet Passes "Adding a Web Service to Update Passes").
 * Route files under src/app/api/loyalty/apple/v1 delegate here. Responses never
 * echo input or error text; every response is `Cache-Control: no-store`.
 */

const NO_STORE = { "Cache-Control": "no-store" };

const empty = (status: number) => new Response(null, { status, headers: NO_STORE });
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...NO_STORE, "Content-Type": "application/json" } });

const REGISTER_BODY_LIMIT = 2048;
const LOG_BODY_LIMIT = 16 * 1024;
const LOG_MAX_ENTRIES = 20;

type Authorized = { ok: true; card: LoyaltyCard } | { ok: false; res: Response };

/**
 * Shared checks for the authenticated endpoints: pass type, serial shape,
 * card existence, auth token. Malformed input is rejected before the DB.
 */
async function authorize(req: Request, passTypeId: string, serial: string): Promise<Authorized> {
  if (!isOurPassType(passTypeId) || !isValidSerial(serial)) return { ok: false, res: empty(404) };
  const token = readApplePassAuth(req.headers.get("authorization"));
  if (!token) return { ok: false, res: empty(401) };
  const card = await getCardById(serial);
  if (!card) return { ok: false, res: empty(404) };
  if (!tokensEqual(token, card.appleAuthToken)) return { ok: false, res: empty(401) };
  return { ok: true, card };
}

/** POST /v1/devices/{deviceId}/registrations/{passTypeId}/{serial} */
export async function registerDevice(
  req: Request,
  p: { deviceId: string; passTypeId: string; serial: string },
): Promise<Response> {
  if (!isValidDeviceId(p.deviceId)) return empty(404);
  const auth = await authorize(req, p.passTypeId, p.serial);
  if (!auth.ok) return auth.res;

  const raw = await readBodyLimited(req, REGISTER_BODY_LIMIT);
  if (raw === null) return empty(400);
  let pushToken: unknown;
  try {
    pushToken = (JSON.parse(raw) as { pushToken?: unknown } | null)?.pushToken;
  } catch {
    return empty(400);
  }
  if (!isValidPushToken(pushToken)) return empty(400);

  const created = await registerAppleDevice({ deviceId: p.deviceId, cardId: auth.card.id, pushToken });
  return empty(created ? 201 : 200);
}

/** DELETE /v1/devices/{deviceId}/registrations/{passTypeId}/{serial} */
export async function unregisterDevice(
  req: Request,
  p: { deviceId: string; passTypeId: string; serial: string },
): Promise<Response> {
  if (!isValidDeviceId(p.deviceId)) return empty(404);
  const auth = await authorize(req, p.passTypeId, p.serial);
  if (!auth.ok) return auth.res;
  await unregisterAppleDevice(p.deviceId, auth.card.id);
  return empty(200);
}

/**
 * GET /v1/devices/{deviceId}/registrations/{passTypeId}?passesUpdatedSince=tag
 * Unauthenticated per Apple's protocol; reveals only serials this device registered.
 */
export async function listUpdatedSerials(
  req: Request,
  p: { deviceId: string; passTypeId: string },
): Promise<Response> {
  if (!isOurPassType(p.passTypeId) || !isValidDeviceId(p.deviceId)) return empty(404);
  const since = parseUpdatedSinceTag(new URL(req.url).searchParams.get("passesUpdatedSince"));
  const result = await listSerialsUpdatedSince(p.deviceId, since);
  if (!result) return empty(204);
  return json(200, { serialNumbers: result.serialNumbers, lastUpdated: result.lastUpdated });
}

/** GET /v1/passes/{passTypeId}/{serial}: the latest signed pass. */
export async function getLatestPass(
  req: Request,
  p: { passTypeId: string; serial: string },
): Promise<Response> {
  const auth = await authorize(req, p.passTypeId, p.serial);
  if (!auth.ok) return auth.res;
  const { card } = auth;

  // HTTP dates have one-second precision; compare on whole seconds.
  const lastModSec = Math.floor(card.passUpdatedAt.getTime() / 1000) * 1000;
  const lastModified = new Date(lastModSec).toUTCString();
  const ims = Date.parse(req.headers.get("if-modified-since") ?? "");
  if (!Number.isNaN(ims) && lastModSec <= ims) {
    return new Response(null, { status: 304, headers: { ...NO_STORE, "Last-Modified": lastModified } });
  }

  if (!isAppleConfigured()) return empty(503);
  try {
    // A revoked card still gets its pass: pass.json carries `voided: true`.
    const buf = await generatePkpass(card);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: { ...NO_STORE, "Content-Type": "application/vnd.apple.pkpass", "Last-Modified": lastModified },
    });
  } catch (err) {
    console.error("pkpass update generation failed", err instanceof Error ? err.name : "unknown");
    return empty(500);
  }
}

/** POST /v1/log: Wallet's error reports about our web service. */
export async function receiveLog(req: Request): Promise<Response> {
  const raw = await readBodyLimited(req, LOG_BODY_LIMIT);
  if (raw === null) return empty(200);
  let logs: unknown;
  try {
    logs = (JSON.parse(raw) as { logs?: unknown } | null)?.logs;
  } catch {
    return empty(200);
  }
  if (Array.isArray(logs) && logs.length > 0) {
    const lines = logs.slice(0, LOG_MAX_ENTRIES).map((l) => sanitizeLogLine(l));
    console.error(`apple wallet log (${logs.length}): ${lines.join(" | ")}`.slice(0, 2000));
  }
  return empty(200);
}
