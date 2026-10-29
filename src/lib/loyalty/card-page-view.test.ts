import { describe, expect, it } from "vitest";
import { cardPageView } from "./card-page-view";
import type { LoyaltyCard } from "./types";

const VERIFY = "V".repeat(32);
const card = (over: Partial<LoyaltyCard> = {}): LoyaltyCard => ({
  id: "id1",
  addToken: "A".repeat(32),
  verifyToken: VERIFY,
  holderName: "Олена <b>Коваль</b>",
  tier: 15,
  status: "active",
  issuedBy: "admin",
  issuedAt: new Date("2026-01-01"),
  revokedBy: null,
  revokedAt: null,
  googleObjectId: null,
  ...over,
});
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)";
const flags = { appleConfigured: true, googleConfigured: true };

describe("cardPageView", () => {
  it("active: tier art, name, ordered buttons", () => {
    const v = cardPageView(card(), IPHONE, flags);
    expect(v).toMatchObject({ kind: "active", name: "Олена <b>Коваль</b>", imageSrc: "/loyalty/google-hero-15.png" });
    if (v.kind !== "active") throw new Error();
    expect(v.buttons.map((b) => b.kind)).toEqual(["apple", "google"]);
    expect(v.buttons[0].href).toBe(`/api/loyalty/pass/${"A".repeat(32)}`);
    expect(v.buttons[1].href).toBe(`/api/loyalty/google/${"A".repeat(32)}`);
  });
  it("android puts google first", () => {
    const v = cardPageView(card(), "Android", flags);
    if (v.kind !== "active") throw new Error();
    expect(v.buttons.map((b) => b.kind)).toEqual(["google", "apple"]);
  });
  it("hides unavailable buttons and flags unavailability", () => {
    let v = cardPageView(card(), IPHONE, { appleConfigured: false, googleConfigured: true });
    if (v.kind !== "active") throw new Error();
    expect(v.buttons.map((b) => b.kind)).toEqual(["google"]);
    v = cardPageView(card(), IPHONE, { appleConfigured: false, googleConfigured: false });
    if (v.kind !== "active") throw new Error();
    expect(v.buttons).toEqual([]);
  });
  it("revoked: no name, no buttons", () => {
    const v = cardPageView(card({ status: "revoked" }), IPHONE, flags);
    expect(v).toEqual({ kind: "revoked" });
    expect(JSON.stringify(v)).not.toContain("Олена");
  });
  it("never embeds a signed link: hrefs are same-origin routes", () => {
    const v = cardPageView(card(), IPHONE, flags);
    if (v.kind !== "active") throw new Error();
    for (const b of v.buttons) expect(b.href.startsWith("/api/loyalty/")).toBe(true);
    expect(JSON.stringify(v)).not.toContain("pay.google.com");
  });
  it("view model never exposes the verify token as a field or value of its own", () => {
    for (const c of [card(), card({ status: "revoked" })]) {
      expect(JSON.stringify(cardPageView(c, IPHONE, flags))).not.toContain(VERIFY);
    }
  });
});
