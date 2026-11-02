import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoyaltyCard } from "./types";

const q = vi.hoisted(() => ({
  getCardById: vi.fn(),
  listSerialsUpdatedSince: vi.fn(),
  registerAppleDevice: vi.fn(),
  unregisterAppleDevice: vi.fn(),
}));
vi.mock("@/lib/db/queries/loyalty", () => q);

const a = vi.hoisted(() => ({ generatePkpass: vi.fn(), isAppleConfigured: vi.fn(() => true) }));
vi.mock("./apple", () => a);

import { getLatestPass, listUpdatedSerials, receiveLog, registerDevice, unregisterDevice } from "./passkit-service";

const PASS_TYPE = "pass.com.genevity.friends";
const SERIAL = "11111111-1111-4111-8111-111111111111";
const DEVICE = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
const AUTH = "f".repeat(64);
const PUSH = "ab".repeat(32);
const UPDATED = new Date("2026-05-01T10:00:00.750Z");

const card = (over: Partial<LoyaltyCard> = {}): LoyaltyCard => ({
  id: SERIAL, addToken: "a", verifyToken: "v", holderName: "Anna", tier: 10, status: "active",
  issuedBy: null, issuedAt: new Date(), revokedBy: null, revokedAt: null, googleObjectId: null,
  appleAuthToken: AUTH, passUpdatedAt: UPDATED, ...over,
});

function req(method: string, opts: { auth?: string | null; body?: string; headers?: Record<string, string>; query?: string } = {}) {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.auth !== null) headers.authorization = opts.auth ?? `ApplePass ${AUTH}`;
  return new Request(`https://x/api/loyalty/apple/v1/whatever${opts.query ?? ""}`, { method, headers, body: opts.body });
}

const reg = { deviceId: DEVICE, passTypeId: PASS_TYPE, serial: SERIAL };
const regBody = JSON.stringify({ pushToken: PUSH });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("APPLE_PASS_TYPE_ID", PASS_TYPE);
  a.isAppleConfigured.mockReturnValue(true);
  q.getCardById.mockResolvedValue(card());
});
afterEach(() => vi.unstubAllEnvs());

describe("registerDevice", () => {
  it("201 for a new registration", async () => {
    q.registerAppleDevice.mockResolvedValue(true);
    const res = await registerDevice(req("POST", { body: regBody }), reg);
    expect(res.status).toBe(201);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(q.registerAppleDevice).toHaveBeenCalledWith({ deviceId: DEVICE, cardId: SERIAL, pushToken: PUSH });
  });

  it("200 when already registered", async () => {
    q.registerAppleDevice.mockResolvedValue(false);
    expect((await registerDevice(req("POST", { body: regBody }), reg)).status).toBe(200);
  });

  it("401 on a wrong token, missing header or wrong scheme", async () => {
    for (const auth of [`ApplePass ${"0".repeat(64)}`, null, `Bearer ${AUTH}`, "ApplePass short"]) {
      const res = await registerDevice(req("POST", { auth, body: regBody }), reg);
      expect(res.status).toBe(401);
    }
    expect(q.registerAppleDevice).not.toHaveBeenCalled();
  });

  it("401 on a token of different length (constant-time path)", async () => {
    const res = await registerDevice(req("POST", { auth: `ApplePass ${AUTH}aa`, body: regBody }), reg);
    expect(res.status).toBe(401);
  });

  it("404 for an unknown card", async () => {
    q.getCardById.mockResolvedValue(null);
    expect((await registerDevice(req("POST", { body: regBody }), reg)).status).toBe(404);
  });

  it("404 for a malformed serial, without touching the DB", async () => {
    for (const serial of ["not-a-uuid", "' OR 1=1 --", `${SERIAL}x`]) {
      expect((await registerDevice(req("POST", { body: regBody }), { ...reg, serial })).status).toBe(404);
    }
    expect(q.getCardById).not.toHaveBeenCalled();
  });

  it("404 for a foreign pass type", async () => {
    const res = await registerDevice(req("POST", { body: regBody }), { ...reg, passTypeId: "pass.com.other" });
    expect(res.status).toBe(404);
    expect(q.getCardById).not.toHaveBeenCalled();
  });

  it("404 when APPLE_PASS_TYPE_ID is unset (never matches empty)", async () => {
    vi.stubEnv("APPLE_PASS_TYPE_ID", "");
    expect((await registerDevice(req("POST", { body: regBody }), { ...reg, passTypeId: "" })).status).toBe(404);
  });

  it("404 for a malformed device id", async () => {
    for (const deviceId of ["", "a/b", "x".repeat(129), "dev ice"]) {
      expect((await registerDevice(req("POST", { body: regBody }), { ...reg, deviceId })).status).toBe(404);
    }
    expect(q.getCardById).not.toHaveBeenCalled();
  });

  it("400 for a bad body or push token", async () => {
    for (const body of ["", "nope", "null", "{}", JSON.stringify({ pushToken: "zz" }), JSON.stringify({ pushToken: "a".repeat(500) }), JSON.stringify({ pushToken: 42 })]) {
      expect((await registerDevice(req("POST", { body }), reg)).status).toBe(400);
    }
    expect(q.registerAppleDevice).not.toHaveBeenCalled();
  });

  it("400 for an oversized body", async () => {
    const body = JSON.stringify({ pushToken: PUSH, pad: "x".repeat(5000) });
    expect((await registerDevice(req("POST", { body }), reg)).status).toBe(400);
  });
});

describe("unregisterDevice", () => {
  it("200 and deletes the registration", async () => {
    const res = await unregisterDevice(req("DELETE"), reg);
    expect(res.status).toBe(200);
    expect(q.unregisterAppleDevice).toHaveBeenCalledWith(DEVICE, SERIAL);
  });

  it("401 on bad auth", async () => {
    expect((await unregisterDevice(req("DELETE", { auth: `ApplePass ${"1".repeat(64)}` }), reg)).status).toBe(401);
    expect(q.unregisterAppleDevice).not.toHaveBeenCalled();
  });
});

describe("listUpdatedSerials", () => {
  const p = { deviceId: DEVICE, passTypeId: PASS_TYPE };

  it("200 with serials and tag", async () => {
    q.listSerialsUpdatedSince.mockResolvedValue({ serialNumbers: [SERIAL], lastUpdated: "123" });
    const res = await listUpdatedSerials(req("GET", { auth: null, query: "?passesUpdatedSince=100" }), p);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ serialNumbers: [SERIAL], lastUpdated: "123" });
    expect(q.listSerialsUpdatedSince).toHaveBeenCalledWith(DEVICE, "100");
  });

  it("204 when nothing changed", async () => {
    q.listSerialsUpdatedSince.mockResolvedValue(null);
    const res = await listUpdatedSerials(req("GET", { auth: null }), p);
    expect(res.status).toBe(204);
    expect(q.listSerialsUpdatedSince).toHaveBeenCalledWith(DEVICE, null);
  });

  it("treats a tag we never issued as no tag", async () => {
    q.listSerialsUpdatedSince.mockResolvedValue(null);
    await listUpdatedSerials(req("GET", { auth: null, query: "?passesUpdatedSince=1;DROP" }), p);
    expect(q.listSerialsUpdatedSince).toHaveBeenCalledWith(DEVICE, null);
  });

  it("404 for a foreign pass type or bad device id", async () => {
    expect((await listUpdatedSerials(req("GET"), { ...p, passTypeId: "x" })).status).toBe(404);
    expect((await listUpdatedSerials(req("GET"), { ...p, deviceId: "../x" })).status).toBe(404);
    expect(q.listSerialsUpdatedSince).not.toHaveBeenCalled();
  });
});

describe("getLatestPass", () => {
  const p = { passTypeId: PASS_TYPE, serial: SERIAL };

  it("200 with the pkpass and Last-Modified", async () => {
    a.generatePkpass.mockResolvedValue(Buffer.from("PK"));
    const res = await getLatestPass(req("GET"), p);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/vnd.apple.pkpass");
    expect(res.headers.get("last-modified")).toBe("Fri, 01 May 2026 10:00:00 GMT");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("304 when If-Modified-Since is not older", async () => {
    for (const ims of ["Fri, 01 May 2026 10:00:00 GMT", "Fri, 01 May 2026 11:00:00 GMT"]) {
      const res = await getLatestPass(req("GET", { headers: { "if-modified-since": ims } }), p);
      expect(res.status).toBe(304);
    }
    expect(a.generatePkpass).not.toHaveBeenCalled();
  });

  it("200 when If-Modified-Since is older or garbage", async () => {
    a.generatePkpass.mockResolvedValue(Buffer.from("PK"));
    for (const ims of ["Fri, 01 May 2026 09:59:59 GMT", "garbage"]) {
      expect((await getLatestPass(req("GET", { headers: { "if-modified-since": ims } }), p)).status).toBe(200);
    }
  });

  it("serves a revoked card's pass (voided in pass.json)", async () => {
    const revoked = card({ status: "revoked" });
    q.getCardById.mockResolvedValue(revoked);
    a.generatePkpass.mockResolvedValue(Buffer.from("PK"));
    expect((await getLatestPass(req("GET"), p)).status).toBe(200);
    expect(a.generatePkpass).toHaveBeenCalledWith(revoked);
  });

  it("401 without valid auth, before generating anything", async () => {
    expect((await getLatestPass(req("GET", { auth: null }), p)).status).toBe(401);
    expect((await getLatestPass(req("GET", { auth: `ApplePass ${"e".repeat(64)}` }), p)).status).toBe(401);
    expect(a.generatePkpass).not.toHaveBeenCalled();
  });

  it("404 for a foreign pass type or malformed serial", async () => {
    expect((await getLatestPass(req("GET"), { ...p, passTypeId: "pass.evil" })).status).toBe(404);
    expect((await getLatestPass(req("GET"), { ...p, serial: "1" })).status).toBe(404);
  });

  it("503 when Apple is not configured; 500 without error text on failure", async () => {
    a.isAppleConfigured.mockReturnValue(false);
    expect((await getLatestPass(req("GET"), p)).status).toBe(503);
    a.isAppleConfigured.mockReturnValue(true);
    a.generatePkpass.mockRejectedValue(new Error("/var/task/secret.pem"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await getLatestPass(req("GET"), p);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("");
    expect(JSON.stringify(spy.mock.calls)).not.toContain("secret");
    spy.mockRestore();
  });
});

describe("receiveLog", () => {
  it("returns 200 and logs a sanitized, truncated summary", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logs = [`Request failed\nauth ${AUTH}`, "x".repeat(1000), ...Array(30).fill("line")];
    const res = await receiveLog(req("POST", { auth: null, body: JSON.stringify({ logs }) }));
    expect(res.status).toBe(200);
    const out = String(spy.mock.calls[0][0]);
    expect(out).not.toContain(AUTH);
    expect(out).not.toContain("\n");
    expect(out.length).toBeLessThanOrEqual(2000);
    spy.mockRestore();
  });

  it("returns 200 for garbage or oversized bodies without logging", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await receiveLog(req("POST", { auth: null, body: "garbage" }))).status).toBe(200);
    expect((await receiveLog(req("POST", { auth: null, body: "x".repeat(20000) }))).status).toBe(200);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
