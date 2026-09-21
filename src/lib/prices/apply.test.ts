import { describe, it, expect } from "vitest";
import { pickMatch, isImplausibleShrink } from "./apply";

describe("pickMatch", () => {
  it("prefers the id match over the name match when both exist", () => {
    expect(pickMatch("by-id", "by-name")).toBe("by-id");
  });

  it("falls back to the name match when there is no id match", () => {
    expect(pickMatch(undefined, "by-name")).toBe("by-name");
  });

  it("returns undefined when neither matched", () => {
    expect(pickMatch(undefined, undefined)).toBeUndefined();
  });

  // This is the exact precedence diff.ts uses:
  //   (item.roappServiceId ? byId.get(...) : undefined) ?? byName.get(...)
  // apply.ts's two-query id-first-then-name-fallback must agree with it, or
  // the preview and the write can land on two different rows for one
  // incoming item.
  it("matches diff.ts's `idMatch ?? nameMatch` precedence", () => {
    const idMatch = { id: "row-a" };
    const nameMatch = { id: "row-b" };
    expect(pickMatch(idMatch, nameMatch)).toBe(idMatch);
    expect(pickMatch(undefined, nameMatch)).toBe(nameMatch);
  });
});

describe("isImplausibleShrink", () => {
  it("does not engage below the 50-row threshold, however small the incoming catalogue is", () => {
    expect(isImplausibleShrink(0, 49)).toBe(false);
    expect(isImplausibleShrink(1, 49)).toBe(false);
  });

  it("engages once the baseline reaches 50 and the incoming count is under half", () => {
    expect(isImplausibleShrink(24, 50)).toBe(true);
  });

  it("does not engage when the incoming catalogue is at least half the baseline", () => {
    expect(isImplausibleShrink(25, 50)).toBe(false); // exactly half is not "under half"
    expect(isImplausibleShrink(26, 50)).toBe(false);
    expect(isImplausibleShrink(1165, 1165)).toBe(false);
  });

  it("does not engage when there is no live catalogue yet (baseline 0)", () => {
    expect(isImplausibleShrink(0, 0)).toBe(false);
  });
});
