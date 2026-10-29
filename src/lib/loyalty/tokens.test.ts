import { describe, it, expect } from "vitest";
import { generateToken, isWellFormedToken } from "./tokens";

describe("generateToken", () => {
  it("produces 32 url-safe characters", () => {
    expect(generateToken()).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it("does not repeat across 2000 calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) seen.add(generateToken());
    expect(seen.size).toBe(2000);
  });
});

describe("isWellFormedToken", () => {
  it("accepts a generated token", () => {
    expect(isWellFormedToken(generateToken())).toBe(true);
  });

  it("rejects malformed input", () => {
    expect(isWellFormedToken("")).toBe(false);
    expect(isWellFormedToken("a".repeat(31))).toBe(false);
    expect(isWellFormedToken("a".repeat(33))).toBe(false);
    expect(isWellFormedToken("a".repeat(31) + "=")).toBe(false);
    expect(isWellFormedToken("../".padEnd(32, "a"))).toBe(false);
    expect(isWellFormedToken(undefined)).toBe(false);
    expect(isWellFormedToken(null)).toBe(false);
    expect(isWellFormedToken(12345)).toBe(false);
    expect(isWellFormedToken({})).toBe(false);
  });
});
