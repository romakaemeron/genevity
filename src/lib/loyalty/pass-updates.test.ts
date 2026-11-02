import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LoyaltyCard } from "./types";

const q = vi.hoisted(() => ({
  deleteRegistrationsByPushToken: vi.fn(),
  listApplePushTokensForActiveCards: vi.fn(),
  listApplePushTokensForCards: vi.fn(),
}));
vi.mock("@/lib/db/queries/loyalty", () => q);

const apns = vi.hoisted(() => ({
  isApnsConfigured: vi.fn(() => true),
  pushPassUpdates: vi.fn(),
  summarizePushes: (o: Array<{ ok: boolean }>) => ({ pushed: o.filter((x) => x.ok).length, failed: o.filter((x) => !x.ok).length }),
}));
vi.mock("./apns", () => apns);

const g = vi.hoisted(() => ({
  readGoogleCreds: vi.fn(),
  getAccessToken: vi.fn(),
  upsertGenericClass: vi.fn(),
  updateObject: vi.fn(),
}));
vi.mock("./google", () => g);

import { notifyAppleForCards, refreshGoogleObjects } from "./pass-updates";

const creds = { issuerId: "i", clientEmail: "e", privateKey: "k" };
const card = (id: string) => ({ id, tier: 10 }) as LoyaltyCard;

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("APPLE_PASS_TYPE_ID", "pass.x");
  apns.isApnsConfigured.mockReturnValue(true);
});
afterEach(() => vi.unstubAllEnvs());

describe("notifyAppleForCards", () => {
  it("pushes to the cards' tokens with the pass type topic and dead-token cleanup", async () => {
    q.listApplePushTokensForCards.mockResolvedValue(["t1", "t2"]);
    apns.pushPassUpdates.mockResolvedValue([{ ok: true }, { ok: false }]);
    expect(await notifyAppleForCards(["c1"])).toEqual({ pushed: 1, failed: 1 });
    const [tokens, opts] = apns.pushPassUpdates.mock.calls[0];
    expect(tokens).toEqual(["t1", "t2"]);
    expect(opts.topic).toBe("pass.x");
    expect(opts.onDeadToken).toBe(q.deleteRegistrationsByPushToken);
  });

  it("skips APNs entirely with no registrations", async () => {
    q.listApplePushTokensForCards.mockResolvedValue([]);
    expect(await notifyAppleForCards(["c1"])).toEqual({ pushed: 0, failed: 0 });
    expect(apns.pushPassUpdates).not.toHaveBeenCalled();
  });

  it("counts every device as failed when APNs is not configured", async () => {
    apns.isApnsConfigured.mockReturnValue(false);
    q.listApplePushTokensForCards.mockResolvedValue(["t1", "t1", "t2"]);
    expect(await notifyAppleForCards(["c1"])).toEqual({ pushed: 0, failed: 2 });
    expect(apns.pushPassUpdates).not.toHaveBeenCalled();
  });
});

describe("refreshGoogleObjects", () => {
  it("returns null when Google is not configured", async () => {
    g.readGoogleCreds.mockReturnValue(null);
    expect(await refreshGoogleObjects([card("a")])).toBeNull();
  });

  it("upserts both tier classes, then counts per card outcome", async () => {
    g.readGoogleCreds.mockReturnValue(creds);
    g.getAccessToken.mockResolvedValue("tok");
    g.upsertGenericClass.mockRejectedValueOnce(new Error("class"));
    g.updateObject.mockImplementation(async (c: LoyaltyCard) => {
      if (c.id === "boom") throw new Error("x");
      return c.id !== "unsaved";
    });
    const res = await refreshGoogleObjects([card("a"), card("unsaved"), card("boom"), card("b")]);
    expect(res).toEqual({ updated: 2, notSaved: 1, failed: 1 });
    expect(g.upsertGenericClass.mock.calls.map((c) => c[2])).toEqual([10, 15]);
  });

  it("fails every card when the token exchange fails", async () => {
    g.readGoogleCreds.mockReturnValue(creds);
    g.getAccessToken.mockRejectedValue(new Error("x"));
    expect(await refreshGoogleObjects([card("a"), card("b")])).toEqual({ updated: 0, notSaved: 0, failed: 2 });
    expect(g.updateObject).not.toHaveBeenCalled();
  });
});
