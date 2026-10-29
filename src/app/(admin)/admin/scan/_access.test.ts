import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const getUserAccess = vi.fn();
const getCardByVerifyToken = vi.fn();
vi.mock("../_actions/auth", () => ({ getSession: () => getSession() }));
vi.mock("@/lib/db/queries/users", () => ({ getUserAccess: (id: string) => getUserAccess(id) }));
vi.mock("@/lib/db/queries/loyalty", () => ({ getCardByVerifyToken: (t: string) => getCardByVerifyToken(t) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));

import { loadScan, requireScanAccess } from "./_access";
import { generateToken } from "@/lib/loyalty/tokens";

const token = generateToken();
const card = {
  id: "1", addToken: "a", verifyToken: token, holderName: "Олена", tier: 15, status: "active",
  issuedBy: null, issuedAt: new Date("2026-10-29T10:00:00Z"), revokedBy: null, revokedAt: null, googleObjectId: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue({ userId: "u1", email: "e", name: "n", role: "frontdesk" });
  getUserAccess.mockResolvedValue({ role: "frontdesk" });
  getCardByVerifyToken.mockResolvedValue(card);
});

describe("loadScan", () => {
  it("logged out redirects to login with the encoded next and reads no card", async () => {
    getSession.mockResolvedValue(null);
    await expect(loadScan(token)).rejects.toThrow(`REDIRECT:/admin/login?next=${encodeURIComponent("/admin/scan/" + token)}`);
    expect(getUserAccess).not.toHaveBeenCalled();
    expect(getCardByVerifyToken).not.toHaveBeenCalled();
  });

  it("malformed token is not-found without touching session or database", async () => {
    await expect(loadScan("../x<script>")).resolves.toEqual({ kind: "not-found" });
    expect(getSession).not.toHaveBeenCalled();
    expect(getUserAccess).not.toHaveBeenCalled();
    expect(getCardByVerifyToken).not.toHaveBeenCalled();
  });

  it("deleted user is sent to login and no card is read", async () => {
    getUserAccess.mockResolvedValue(null);
    await expect(loadScan(token)).rejects.toThrow("REDIRECT:/admin/login?next=");
    expect(getCardByVerifyToken).not.toHaveBeenCalled();
  });

  it("uses the database role, not the JWT role", async () => {
    getSession.mockResolvedValue({ userId: "u1", email: "e", name: "n", role: "admin" });
    getUserAccess.mockResolvedValue({ role: "disabled" });
    await expect(loadScan(token)).rejects.toThrow("REDIRECT:/admin/login");
  });

  it.each(["admin", "marketing", "support", "frontdesk"])("lets %s view", async (role) => {
    getUserAccess.mockResolvedValue({ role });
    await expect(loadScan(token)).resolves.toMatchObject({ kind: "active", discountLabel: "−15%" });
  });

  it("revoked card gives the revoked view", async () => {
    getCardByVerifyToken.mockResolvedValue({ ...card, status: "revoked" });
    await expect(loadScan(token)).resolves.toMatchObject({ kind: "revoked" });
  });

  it("unknown card is not-found", async () => {
    getCardByVerifyToken.mockResolvedValue(null);
    await expect(loadScan(token)).resolves.toEqual({ kind: "not-found" });
  });

  it("returns a <script> holder name as plain data", async () => {
    getCardByVerifyToken.mockResolvedValue({ ...card, holderName: "<script>alert(1)</script>" });
    await expect(loadScan(token)).resolves.toMatchObject({ name: "<script>alert(1)</script>" });
  });
});

describe("requireScanAccess", () => {
  it("redirects a logged-out visitor on the index page", async () => {
    getSession.mockResolvedValue(null);
    await expect(requireScanAccess("/admin/scan")).rejects.toThrow("REDIRECT:/admin/login?next=%2Fadmin%2Fscan");
  });
});
