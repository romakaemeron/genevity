import { afterEach, describe, expect, it, vi } from "vitest";
import * as jose from "jose";
import {
  buildGenericClass,
  buildGenericObject,
  createSaveUrl,
  expireObject,
  genericClassId,
  genericObjectId,
  isGoogleConfigured,
  signSaveJwt,
} from "./google";
import { getPublicBase, verifyUrl } from "./urls";
import type { LoyaltyCard } from "./types";

function card(over: Partial<LoyaltyCard> = {}): LoyaltyCard {
  return {
    id: "card-1",
    addToken: "add-tok",
    verifyToken: "verify-tok",
    holderName: "Олена Коваленко",
    tier: 15,
    status: "active",
    issuedBy: null,
    issuedAt: new Date("2026-01-01"),
    revokedBy: null,
    revokedAt: null,
    googleObjectId: null,
    ...over,
  };
}

async function makeCreds() {
  const { privateKey, publicKey } = await jose.generateKeyPair("RS256", { extractable: true });
  const pem = await jose.exportPKCS8(privateKey);
  return { publicKey, creds: { issuerId: "3388000000000000001", clientEmail: "svc@proj.iam.gserviceaccount.com", privateKey: pem } };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("ids", () => {
  it("builds class and object ids", () => {
    expect(genericClassId("123", 15)).toBe("123.genevity_friends_15");
    expect(genericObjectId("123", card())).toBe("123.card-1");
  });
});

describe("buildGenericClass", () => {
  it("uses the class id", () => {
    expect(buildGenericClass("123", 10)).toMatchObject({ id: "123.genevity_friends_10" });
  });
});

describe("buildGenericObject", () => {
  it("maps the approved fields", () => {
    const c = card();
    const o = buildGenericObject("123", c) as Record<string, any>;
    expect(o.id).toBe("123.card-1");
    expect(o.state).toBe("ACTIVE");
    expect(o.classId).toBe(genericClassId("123", 15));
    expect(o.cardTitle.defaultValue.value).toBe("GENEVITY");
    expect(o.subheader.defaultValue.value).toBe("Власник картки");
    expect(o.header.defaultValue.value).toBe(c.holderName);
    expect(o.hexBackgroundColor).toBe("#1B1714");
    expect(o.barcode).toEqual({ type: "QR_CODE", value: verifyUrl(c.verifyToken) });
    expect(o.heroImage.sourceUri.uri.endsWith("/loyalty/google-hero-15.png")).toBe(true);
    expect(o.logo.sourceUri.uri.endsWith("/loyalty/google-logo-15.png")).toBe(true);
    expect(o.heroImage.sourceUri.uri.startsWith(getPublicBase())).toBe(true);
    expect(JSON.stringify(o)).not.toContain("%");
  });
});

describe("revoked cards", () => {
  it("builds an EXPIRED object", () => {
    const o = buildGenericObject("123", card({ status: "revoked" })) as Record<string, any>;
    expect(o.state).toBe("EXPIRED");
  });

  it("does not create a save url", async () => {
    const { creds } = await makeCreds();
    vi.stubEnv("GOOGLE_WALLET_ISSUER_ID", creds.issuerId);
    vi.stubEnv(
      "GOOGLE_WALLET_SERVICE_ACCOUNT_JSON",
      JSON.stringify({ client_email: creds.clientEmail, private_key: creds.privateKey }),
    );
    expect(await createSaveUrl(card({ status: "revoked" }))).toBeNull();
  });
});

describe("signSaveJwt", () => {
  it("signs a verifiable save-to-wallet JWT", async () => {
    const { publicKey, creds } = await makeCreds();
    const c = card();
    const jwt = await signSaveJwt(c, creds);
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, { audience: "google" });
    expect(protectedHeader.alg).toBe("RS256");
    expect(payload.iss).toBe(creds.clientEmail);
    expect(payload.typ).toBe("savetowallet");
    expect(payload.origins).toContain(getPublicBase());
    const p = payload.payload as any;
    expect(p.genericObjects[0].id).toBe(genericObjectId(creds.issuerId, c));
    expect(payload.exp! - payload.iat!).toBe(3600);
  });
});

describe("configuration", () => {
  it("is not configured without env and returns null link", async () => {
    vi.stubEnv("GOOGLE_WALLET_ISSUER_ID", "");
    vi.stubEnv("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON", "");
    expect(isGoogleConfigured()).toBe(false);
    expect(await createSaveUrl(card())).toBeNull();
  });

  it("rejects unparseable service account JSON", () => {
    vi.stubEnv("GOOGLE_WALLET_ISSUER_ID", "123");
    vi.stubEnv("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON", "not json");
    expect(isGoogleConfigured()).toBe(false);
  });

  it("creates a save url when configured", async () => {
    const { creds } = await makeCreds();
    vi.stubEnv("GOOGLE_WALLET_ISSUER_ID", creds.issuerId);
    vi.stubEnv(
      "GOOGLE_WALLET_SERVICE_ACCOUNT_JSON",
      JSON.stringify({ client_email: creds.clientEmail, private_key: creds.privateKey }),
    );
    expect(isGoogleConfigured()).toBe(true);
    const url = await createSaveUrl(card());
    expect(url?.startsWith("https://pay.google.com/gp/v/save/")).toBe(true);
  });
});

describe("expireObject", () => {
  async function setup(patchStatus: number) {
    const { creds } = await makeCreds();
    vi.stubEnv("GOOGLE_WALLET_ISSUER_ID", creds.issuerId);
    vi.stubEnv(
      "GOOGLE_WALLET_SERVICE_ACCOUNT_JSON",
      JSON.stringify({ client_email: creds.clientEmail, private_key: creds.privateKey }),
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }))
      .mockResolvedValueOnce(new Response("{}", { status: patchStatus }));
    vi.stubGlobal("fetch", fetchMock);
    return { fetchMock, creds };
  }

  it("exchanges a token then patches state EXPIRED", async () => {
    const { fetchMock, creds } = await setup(200);
    await expireObject(card());
    expect(fetchMock.mock.calls[0][0]).toBe("https://oauth2.googleapis.com/token");
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(
      `https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${creds.issuerId}.card-1`,
    );
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe('{"state":"EXPIRED"}');
    expect(init.headers.Authorization).toBe("Bearer tok");

    const [, tokInit] = fetchMock.mock.calls[0];
    expect(tokInit.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    const form = new URLSearchParams(tokInit.body as string);
    expect(form.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
    const claims = jose.decodeJwt(form.get("assertion")!);
    expect(claims.aud).toBe("https://oauth2.googleapis.com/token");
    expect(claims.scope).toBe("https://www.googleapis.com/auth/wallet_object.issuer");
  });

  it("treats 404 as success", async () => {
    await setup(404);
    await expect(expireObject(card())).resolves.toBeUndefined();
  });

  it("rejects on 500 with the status", async () => {
    await setup(500);
    await expect(expireObject(card())).rejects.toThrow(/500/);
  });
});
