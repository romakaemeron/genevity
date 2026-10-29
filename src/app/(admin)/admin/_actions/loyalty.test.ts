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
}));
vi.mock("@/lib/db/queries/loyalty", () => q);

const g = vi.hoisted(() => ({
  isGoogleConfigured: vi.fn(() => false),
  genericObjectId: vi.fn(() => "issuer.obj"),
  expireObject: vi.fn(),
}));
vi.mock("@/lib/loyalty/google", () => g);

import { logChange } from "@/lib/audit";
import { issueCard, revokeCardAction } from "./loyalty";

const ID = "11111111-1111-4111-8111-111111111111";
const card = (over: Partial<LoyaltyCard> = {}): LoyaltyCard => ({
  id: ID, addToken: "a", verifyToken: "v", holderName: "Anna", tier: 10, status: "active",
  issuedBy: "u1", issuedAt: new Date(), revokedBy: null, revokedAt: null, googleObjectId: null, ...over,
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

  it("is harmless for an already revoked card: no second log entry", async () => {
    q.getCardById.mockResolvedValue(card({ status: "revoked" }));
    const res = await revokeCardAction(ID);
    expect(res.ok).toBe(true);
    expect(q.markRevoked).not.toHaveBeenCalled();
    expect(logChange).not.toHaveBeenCalled();
  });

  it("returns not found for an unknown card", async () => {
    q.getCardById.mockResolvedValue(null);
    const res = await revokeCardAction(ID);
    expect(res.ok).toBe(false);
  });
});
