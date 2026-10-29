import { describe, expect, it } from "vitest";
import { scanView } from "./scan-view";
import type { LoyaltyCard } from "./types";

const base: LoyaltyCard = {
  id: "1",
  addToken: "a",
  verifyToken: "v",
  holderName: "Олена Коваленко",
  tier: 10,
  status: "active",
  issuedBy: null,
  issuedAt: new Date("2026-10-29T10:00:00Z"),
  revokedBy: null,
  revokedAt: null,
  googleObjectId: null,
};

describe("scanView", () => {
  it("null is not-found", () => {
    expect(scanView(null)).toEqual({ kind: "not-found" });
  });
  it("active tier-10 card", () => {
    expect(scanView(base)).toEqual({ kind: "active", name: "Олена Коваленко", discountLabel: "−10%", issuedOn: "29.10.2026" });
  });
  it("tier 15 label", () => {
    expect(scanView({ ...base, tier: 15 })).toMatchObject({ discountLabel: "−15%" });
  });
  it("revoked card", () => {
    expect(scanView({ ...base, status: "revoked", revokedAt: new Date() })).toMatchObject({ kind: "revoked" });
  });
  it("formats the date in Europe/Kyiv", () => {
    expect(scanView({ ...base, issuedAt: new Date("2026-12-31T22:30:00Z") })).toMatchObject({ issuedOn: "01.01.2027" });
  });
  it("returns a script-bearing name as plain data", () => {
    expect(scanView({ ...base, holderName: "<script>alert(1)</script>" })).toMatchObject({ name: "<script>alert(1)</script>" });
  });
});
