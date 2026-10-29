import { describe, it, expect } from "vitest";
import { rowToCard } from "./rows";

const base = {
  id: "11111111-1111-1111-1111-111111111111",
  add_token: "a".repeat(32),
  verify_token: "b".repeat(32),
  holder_name: "Test Holder",
  tier: 10,
  status: "active",
  issued_by: "22222222-2222-2222-2222-222222222222",
  issued_at: new Date("2026-01-02T03:04:05Z"),
  revoked_by: null,
  revoked_at: null,
  google_object_id: null,
};

describe("rowToCard", () => {
  it("maps snake_case to camelCase", () => {
    const c = rowToCard(base);
    expect(c.addToken).toBe(base.add_token);
    expect(c.verifyToken).toBe(base.verify_token);
    expect(c.holderName).toBe("Test Holder");
    expect(c.issuedBy).toBe(base.issued_by);
    expect(c.tier).toBe(10);
  });
  it("keeps nullable fields null", () => {
    const c = rowToCard(base);
    expect(c.revokedBy).toBeNull();
    expect(c.revokedAt).toBeNull();
    expect(c.googleObjectId).toBeNull();
    expect(rowToCard({ ...base, issued_by: null }).issuedBy).toBeNull();
  });
  it("converts string timestamps to Date and keeps Dates", () => {
    const c = rowToCard({ ...base, issued_at: "2026-01-02T03:04:05Z", revoked_at: "2026-02-01T00:00:00Z", status: "revoked", tier: "15" });
    expect(c.issuedAt).toBeInstanceOf(Date);
    expect(c.issuedAt.toISOString()).toBe("2026-01-02T03:04:05.000Z");
    expect(c.revokedAt).toBeInstanceOf(Date);
    expect(c.status).toBe("revoked");
    expect(c.tier).toBe(15);
    expect(rowToCard(base).issuedAt).toBe(base.issued_at);
  });
});
