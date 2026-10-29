import { importPKCS8, SignJWT } from "jose";
import { TIER_STYLE } from "./tiers";
import type { LoyaltyCard, Tier } from "./types";
import { getPublicBase, verifyUrl } from "./urls";

// Env is read at call time; error messages never include env values or key material.

interface ServiceAccount {
  clientEmail: string;
  privateKey: string;
}

export interface GoogleCreds extends ServiceAccount {
  issuerId: string;
}

export class GoogleNotConfiguredError extends Error {
  constructor(message = "Google Wallet is not configured") {
    super(message);
    this.name = "GoogleNotConfiguredError";
  }
}

function readCreds(): GoogleCreds | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID?.trim();
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON?.trim();
  if (!issuerId || !raw) return null;
  try {
    const parsed = JSON.parse(raw) as { client_email?: unknown; private_key?: unknown };
    if (typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string") return null;
    if (!parsed.client_email || !parsed.private_key) return null;
    return { issuerId, clientEmail: parsed.client_email, privateKey: parsed.private_key };
  } catch {
    return null;
  }
}

export function isGoogleConfigured(): boolean {
  return readCreds() !== null;
}

export function genericClassId(issuerId: string, tier: Tier): string {
  return `${issuerId}.genevity_friends_${tier}`;
}

export function genericObjectId(issuerId: string, card: LoyaltyCard): string {
  return `${issuerId}.${card.id}`;
}

/** Minimal GenericClass: per the REST reference only `id` is required. */
export function buildGenericClass(issuerId: string, tier: Tier): Record<string, unknown> {
  return {
    id: genericClassId(issuerId, tier),
    multipleDevicesAndHoldersAllowedStatus: "ONE_USER_ALL_DEVICES",
  };
}

function text(value: string) {
  return { defaultValue: { language: "uk", value } };
}

export function buildGenericObject(issuerId: string, card: LoyaltyCard): Record<string, unknown> {
  const base = getPublicBase();
  return {
    id: genericObjectId(issuerId, card),
    classId: genericClassId(issuerId, card.tier),
    state: card.status === "active" ? "ACTIVE" : "EXPIRED",
    cardTitle: text("GENEVITY"),
    subheader: text("Власник картки"),
    header: text(card.holderName),
    hexBackgroundColor: TIER_STYLE[card.tier].background,
    logo: { sourceUri: { uri: `${base}/loyalty/google-logo-${card.tier}.png` } },
    heroImage: { sourceUri: { uri: `${base}/loyalty/google-hero-${card.tier}.png` } },
    barcode: { type: "QR_CODE", value: verifyUrl(card.verifyToken) },
  };
}

export async function signSaveJwt(card: LoyaltyCard, creds: GoogleCreds): Promise<string> {
  const key = await importPKCS8(creds.privateKey, "RS256");
  return new SignJWT({
    typ: "savetowallet",
    origins: [getPublicBase()],
    payload: { genericObjects: [buildGenericObject(creds.issuerId, card)] },
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(creds.clientEmail)
    .setAudience("google")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function createSaveUrl(card: LoyaltyCard): Promise<string | null> {
  // Never mint a save link for a revoked card.
  if (card.status !== "active") return null;
  const creds = readCreds();
  if (!creds) return null;
  return `https://pay.google.com/gp/v/save/${await signSaveJwt(card, creds)}`;
}

const WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

/** OAuth2 JWT-bearer exchange for the service account. */
export async function getAccessToken(creds: GoogleCreds): Promise<string> {
  const key = await importPKCS8(creds.privateKey, "RS256");
  const assertion = await new SignJWT({ scope: WALLET_SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(creds.clientEmail)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token exchange returned no access token");
  return json.access_token;
}

export async function expireObject(card: LoyaltyCard): Promise<void> {
  const creds = readCreds();
  if (!creds) throw new GoogleNotConfiguredError();
  const objectId = card.googleObjectId ?? genericObjectId(creds.issuerId, card);
  const token = await getAccessToken(creds);
  const res = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${encodeURIComponent(objectId)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ state: "EXPIRED" }),
    },
  );
  if (res.status === 404 || res.ok) return;
  throw new Error(`Google Wallet expire failed (${res.status})`);
}
