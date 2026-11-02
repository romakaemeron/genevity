import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoyaltyCard } from "@/lib/loyalty/types";

const session = { userId: "u1", email: "e", name: "n", role: "admin" };
let currentSession = { ...session };
vi.mock("./auth", () => ({ requireSession: async () => currentSession }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/audit", () => ({ logChange: vi.fn(async () => {}) }));

const q = vi.hoisted(() => ({
  insertCard: vi.fn(),
  getCardById: vi.fn(),
  markRevoked: vi.fn(),
  setGoogleObjectId: vi.fn(),
  bumpPassUpdatedAt: vi.fn(),
  bumpPassUpdatedAtForActiveCards: vi.fn(),
}));
vi.mock("@/lib/db/queries/loyalty", () => q);

const g = vi.hoisted(() => ({
  isGoogleConfigured: vi.fn(() => false),
  genericObjectId: vi.fn(() => "issuer.obj"),
  expireObject: vi.fn(),
}));
vi.mock("@/lib/loyalty/google", () => g);

const pu = vi.hoisted(() => ({
  notifyAppleForCards: vi.fn(async () => ({ pushed: 0, failed: 0 })),
  notifyAppleForActiveCards: vi.fn(async () => ({ pushed: 0, failed: 0 })),
  refreshGoogleObjects: vi.fn(async () => null as null | { updated: number; notSaved: number; failed: number }),
}));
vi.mock("@/lib/loyalty/pass-updates", () => pu);

import { logChange } from "@/lib/audit";
import { issueCard, refreshAllPassesAction, revokeCardAction } from "./loyalty";

const ID = "11111111-1111-4111-8111-111111111111";
const card = (over: Partial<LoyaltyCard> = {}): LoyaltyCard => ({
  id: ID, addToken: "a", verifyToken: "v", holderName: "Anna", tier: 10, status: "active",
  issuedBy: "u1", issuedAt: new Date(), revokedBy: null, revokedAt: null, googleObjectId: null,
  appleAuthToken: "t".repeat(64), passUpdatedAt: new Date("2026-01-01T00:00:00Z"), ...over,
});
const form = (name: string, tier = "10") => {
  const f = new FormData();
  f.set("name", name);
  f.set("tier", tier);
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
  currentSession = { ...session };
  g.isGoogleConfigured.mockReturnValue(false);
  q.bumpPassUpdatedAt.mockReset();
  pu.notifyAppleForCards.mockReset().mockResolvedValue({ pushed: 0, failed: 0 });
  pu.notifyAppleForActiveCards.mockReset().mockResolvedValue({ pushed: 0, failed: 0 });
  pu.refreshGoogleObjects.mockReset().mockResolvedValue(null);
});

describe("issueCard", () => {
  it("rejects non-admin roles", async () => {
    currentSession = { ...session, role: "support" };
    await expect(issueCard({}, form("Anna"))).rejects.toThrow("Forbidden");
    expect(q.insertCard).not.toHaveBeenCalled();
  });

  it("returns an error for a blank name", async () => {
    const res = await issueCard({}, form(" "));
    expect(res.error).toBeTruthy();
    expect(q.insertCard).not.toHaveBeenCalled();
  });

  it("inserts, logs and redirects", async () => {
    q.insertCard.mockResolvedValue(card());
    await expect(issueCard({}, form("Anna"))).rejects.toThrow(`REDIRECT:/admin/loyalty/${ID}`);
    expect(q.insertCard).toHaveBeenCalledWith({ holderName: "Anna", tier: 10, issuedBy: "u1" });
    expect(logChange).toHaveBeenCalled();
    expect(q.setGoogleObjectId).not.toHaveBeenCalled();
  });

  it("stores the Google object id best-effort when configured", async () => {
    g.isGoogleConfigured.mockReturnValue(true);
    q.insertCard.mockResolvedValue(card());
    q.setGoogleObjectId.mockRejectedValue(new Error("db"));
    await expect(issueCard({}, form("Anna"))).rejects.toThrow("REDIRECT:");
    expect(q.setGoogleObjectId).toHaveBeenCalledWith(ID, "issuer.obj");
  });
});

describe("revokeCardAction", () => {
  it("rejects non-admin roles", async () => {
    currentSession = { ...session, role: "marketing" };
    await expect(revokeCardAction(ID)).rejects.toThrow("Forbidden");
    expect(q.markRevoked).not.toHaveBeenCalled();
  });

  it("treats a malformed id as an error without touching the db", async () => {
    const res = await revokeCardAction("not-a-uuid");
    expect(res.ok).toBe(false);
    expect(q.getCardById).not.toHaveBeenCalled();
    expect(q.markRevoked).not.toHaveBeenCalled();
  });

  it("skips Google and returns a plain ok when Google is not configured", async () => {
    g.isGoogleConfigured.mockReturnValue(false);
    q.getCardById.mockResolvedValue(card());
    q.markRevoked.mockResolvedValue(card({ status: "revoked" }));
    const res = await revokeCardAction(ID);
    expect(res).toEqual({ ok: true });
    expect(g.expireObject).not.toHaveBeenCalled();
  });

  it("revokes then expires the Google object", async () => {
    g.isGoogleConfigured.mockReturnValue(true);
    q.getCardById.mockResolvedValue(card());
    q.markRevoked.mockResolvedValue(card({ status: "revoked" }));
    g.expireObject.mockResolvedValue(undefined);
    const res = await revokeCardAction(ID);
    expect(res).toEqual({ ok: true });
    expect(q.markRevoked).toHaveBeenCalledWith(ID, "u1");
    expect(g.expireObject).toHaveBeenCalled();
    expect(logChange).toHaveBeenCalledTimes(1);
  });

  it("still succeeds with a warning when Google expiry rejects", async () => {
    g.isGoogleConfigured.mockReturnValue(true);
    q.getCardById.mockResolvedValue(card());
    q.markRevoked.mockResolvedValue(card({ status: "revoked" }));
    g.expireObject.mockRejectedValue(new Error("secret raw error"));
    const res = await revokeCardAction(ID);
    expect(res.ok).toBe(true);
    expect(res.googleWarning).toBeTruthy();
    expect(res.googleWarning).not.toContain("secret");
  });

  it("already revoked, Google not configured: plain ok, nothing written", async () => {
    q.getCardById.mockResolvedValue(card({ status: "revoked" }));
    const res = await revokeCardAction(ID);
    expect(res).toEqual({ ok: true });
    expect(q.markRevoked).not.toHaveBeenCalled();
    expect(g.expireObject).not.toHaveBeenCalled();
    expect(logChange).not.toHaveBeenCalled();
  });

  it("already revoked, Google configured: retries expiry without a second log entry", async () => {
    g.isGoogleConfigured.mockReturnValue(true);
    q.getCardById.mockResolvedValue(card({ status: "revoked" }));
    g.expireObject.mockResolvedValue(undefined);
    const res = await revokeCardAction(ID);
    expect(res).toEqual({ ok: true });
    expect(q.markRevoked).not.toHaveBeenCalled();
    expect(g.expireObject).toHaveBeenCalledTimes(1);
    expect(logChange).not.toHaveBeenCalled();
  });

  it("already revoked, retry fails: returns the warning, still no log entry", async () => {
    g.isGoogleConfigured.mockReturnValue(true);
    q.getCardById.mockResolvedValue(card({ status: "revoked" }));
    g.expireObject.mockRejectedValue(new Error("boom"));
    const res = await revokeCardAction(ID);
    expect(res.ok).toBe(true);
    expect(res.googleWarning).toBeTruthy();
    expect(logChange).not.toHaveBeenCalled();
  });

  it("bumps the pass and pushes to Apple devices on a fresh revoke", async () => {
    q.getCardById.mockResolvedValue(card());
    q.markRevoked.mockResolvedValue(card({ status: "revoked" }));
    await revokeCardAction(ID);
    expect(q.bumpPassUpdatedAt).toHaveBeenCalledWith(ID);
    expect(pu.notifyAppleForCards).toHaveBeenCalledWith([ID]);
  });

  it("still revokes (and expires on Google) when the Apple push fails", async () => {
    g.isGoogleConfigured.mockReturnValue(true);
    q.getCardById.mockResolvedValue(card());
    q.markRevoked.mockResolvedValue(card({ status: "revoked" }));
    q.bumpPassUpdatedAt.mockRejectedValue(new Error("column does not exist"));
    g.expireObject.mockResolvedValue(undefined);
    const res = await revokeCardAction(ID);
    expect(res).toEqual({ ok: true });
    expect(g.expireObject).toHaveBeenCalled();
  });

  it("does not re-push for an already revoked card", async () => {
    q.getCardById.mockResolvedValue(card({ status: "revoked" }));
    await revokeCardAction(ID);
    expect(q.bumpPassUpdatedAt).not.toHaveBeenCalled();
    expect(pu.notifyAppleForCards).not.toHaveBeenCalled();
  });

  it("returns not found for an unknown card", async () => {
    q.getCardById.mockResolvedValue(null);
    const res = await revokeCardAction(ID);
    expect(res.ok).toBe(false);
  });
});

describe("refreshAllPassesAction", () => {
  it.each(["support", "marketing", "frontdesk"])("rejects role %s before touching anything", async (role) => {
    currentSession = { ...session, role };
    await expect(refreshAllPassesAction()).rejects.toThrow("Forbidden");
    expect(q.bumpPassUpdatedAtForActiveCards).not.toHaveBeenCalled();
    expect(pu.notifyAppleForActiveCards).not.toHaveBeenCalled();
  });

  it("bumps, pushes, refreshes Google and returns counts", async () => {
    const cards = [card(), card({ id: "22222222-2222-4222-8222-222222222222" })];
    q.bumpPassUpdatedAtForActiveCards.mockResolvedValue(cards);
    pu.notifyAppleForActiveCards.mockResolvedValue({ pushed: 3, failed: 1 });
    pu.refreshGoogleObjects.mockResolvedValue({ updated: 1, notSaved: 1, failed: 0 });
    const res = await refreshAllPassesAction();
    expect(res).toEqual({
      ok: true, cards: 2, applePushed: 3, appleFailed: 1, appleError: false,
      googleUpdated: 1, googleNotSaved: 1, googleFailed: 0,
    });
    expect(pu.refreshGoogleObjects).toHaveBeenCalledWith(cards);
    expect(logChange).toHaveBeenCalledTimes(1);
  });

  it("reports a failed Apple batch and keeps going with Google", async () => {
    q.bumpPassUpdatedAtForActiveCards.mockResolvedValue([card()]);
    pu.notifyAppleForActiveCards.mockRejectedValue(new Error("tls"));
    pu.refreshGoogleObjects.mockResolvedValue({ updated: 1, notSaved: 0, failed: 0 });
    const res = await refreshAllPassesAction();
    expect(res).toMatchObject({ ok: true, appleError: true, googleUpdated: 1 });
  });

  it("counts every card as a Google failure when the Google step throws", async () => {
    q.bumpPassUpdatedAtForActiveCards.mockResolvedValue([card(), card()]);
    pu.refreshGoogleObjects.mockRejectedValue(new Error("x"));
    expect(await refreshAllPassesAction()).toMatchObject({ ok: true, googleFailed: 2 });
  });

  it("returns an error (no raw text) when the bump fails", async () => {
    q.bumpPassUpdatedAtForActiveCards.mockRejectedValue(new Error("relation does not exist"));
    const res = await refreshAllPassesAction();
    expect(res.ok).toBe(false);
    expect(JSON.stringify(res)).not.toContain("relation");
    expect(pu.notifyAppleForActiveCards).not.toHaveBeenCalled();
  });
});
