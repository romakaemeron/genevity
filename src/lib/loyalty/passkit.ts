import { timingSafeEqual } from "node:crypto";
import { isUuid } from "./validation";

// Input guards for the public PassKit web service. Everything Apple sends is
// untrusted: these run before any value reaches the database.

/** Apple's deviceLibraryIdentifier is an opaque token (hex in practice). */
const DEVICE_ID_RE = /^[A-Za-z0-9-]{1,128}$/;
/** APNs device tokens are hex (64 chars today; allow growth). */
const PUSH_TOKEN_RE = /^[0-9A-Fa-f]{16,200}$/;
/** Our update tags are integer microseconds since epoch. */
const TAG_RE = /^\d{1,19}$/;
/** Pass auth tokens are 64 hex chars; accept a little slack, never anything long. */
const AUTH_RE = /^ApplePass ([A-Za-z0-9]{16,128})$/;

export const isValidSerial = isUuid;

export function isValidDeviceId(v: unknown): v is string {
  return typeof v === "string" && DEVICE_ID_RE.test(v);
}

export function isValidPushToken(v: unknown): v is string {
  return typeof v === "string" && PUSH_TOKEN_RE.test(v);
}

/** A `passesUpdatedSince` tag we could have issued; anything else is ignored (= all). */
export function parseUpdatedSinceTag(v: string | null): string | null {
  return v !== null && TAG_RE.test(v) ? v : null;
}

/** True when passTypeId matches the configured Apple pass type. */
export function isOurPassType(passTypeId: string): boolean {
  const ours = process.env.APPLE_PASS_TYPE_ID?.trim();
  return Boolean(ours) && passTypeId === ours;
}

/** Extracts the token from `Authorization: ApplePass <token>`, or null. */
export function readApplePassAuth(header: string | null): string | null {
  if (!header || header.length > 200) return null;
  const m = AUTH_RE.exec(header.trim());
  return m ? m[1] : null;
}

/** Constant-time comparison; unequal lengths compare a dummy buffer to keep timing flat. */
export function tokensEqual(given: string, expected: string): boolean {
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * Reads a request body up to `limit` bytes; returns null when it is larger.
 * Guards against unbounded bodies on unauthenticated endpoints.
 */
export async function readBodyLimited(req: Request, limit: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Strips control characters and anything that looks like a token, then truncates. */
export function sanitizeLogLine(v: unknown, max = 200): string {
  const s = typeof v === "string" ? v : "";
  return s
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[A-Za-z0-9+/=_-]{24,}/g, "[redacted]")
    .slice(0, max);
}
