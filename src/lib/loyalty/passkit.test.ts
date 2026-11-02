import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isOurPassType,
  isValidDeviceId,
  isValidPushToken,
  parseUpdatedSinceTag,
  readApplePassAuth,
  readBodyLimited,
  sanitizeLogLine,
  tokensEqual,
} from "./passkit";

afterEach(() => vi.unstubAllEnvs());

describe("input guards", () => {
  it("device ids", () => {
    expect(isValidDeviceId("a1b2c3d4e5f6")).toBe(true);
    expect(isValidDeviceId("")).toBe(false);
    expect(isValidDeviceId("a".repeat(129))).toBe(false);
    expect(isValidDeviceId("a'b")).toBe(false);
    expect(isValidDeviceId(42)).toBe(false);
  });
  it("push tokens are hex with a length cap", () => {
    expect(isValidPushToken("ab".repeat(32))).toBe(true);
    expect(isValidPushToken("zz".repeat(32))).toBe(false);
    expect(isValidPushToken("ab".repeat(101))).toBe(false);
    expect(isValidPushToken("ab/../")).toBe(false);
  });
  it("update tags", () => {
    expect(parseUpdatedSinceTag("1746093600750000")).toBe("1746093600750000");
    expect(parseUpdatedSinceTag(null)).toBeNull();
    expect(parseUpdatedSinceTag("2026-01-01")).toBeNull();
    expect(parseUpdatedSinceTag("9".repeat(20))).toBeNull();
  });
  it("pass type must equal the configured one", () => {
    vi.stubEnv("APPLE_PASS_TYPE_ID", "pass.a");
    expect(isOurPassType("pass.a")).toBe(true);
    expect(isOurPassType("pass.b")).toBe(false);
    vi.stubEnv("APPLE_PASS_TYPE_ID", "");
    expect(isOurPassType("")).toBe(false);
  });
});

describe("auth", () => {
  it("parses ApplePass headers only", () => {
    expect(readApplePassAuth(`ApplePass ${"a".repeat(64)}`)).toBe("a".repeat(64));
    expect(readApplePassAuth(`Bearer ${"a".repeat(64)}`)).toBeNull();
    expect(readApplePassAuth("ApplePass short")).toBeNull();
    expect(readApplePassAuth(null)).toBeNull();
    expect(readApplePassAuth(`ApplePass ${"a".repeat(300)}`)).toBeNull();
  });
  it("compares tokens", () => {
    expect(tokensEqual("abc", "abc")).toBe(true);
    expect(tokensEqual("abd", "abc")).toBe(false);
    expect(tokensEqual("ab", "abc")).toBe(false);
  });
});

describe("readBodyLimited", () => {
  it("reads small bodies and rejects large ones", async () => {
    expect(await readBodyLimited(new Request("http://x", { method: "POST", body: "hi" }), 10)).toBe("hi");
    expect(await readBodyLimited(new Request("http://x", { method: "POST", body: "x".repeat(11) }), 10)).toBeNull();
    expect(await readBodyLimited(new Request("http://x", { method: "POST" }), 10)).toBe("");
  });
  it("rejects on a declared oversized length", async () => {
    const r = new Request("http://x", { method: "POST", body: "x", headers: { "content-length": "99999" } });
    expect(await readBodyLimited(r, 10)).toBeNull();
  });
});

describe("sanitizeLogLine", () => {
  it("strips control chars, redacts token-like runs and truncates", () => {
    expect(sanitizeLogLine("a\nb")).toBe("a b");
    expect(sanitizeLogLine(`token ${"f".repeat(64)} end`)).toBe("token [redacted] end");
    expect(sanitizeLogLine("y ".repeat(500)).length).toBe(200);
    expect(sanitizeLogLine({ evil: true })).toBe("");
  });
});
