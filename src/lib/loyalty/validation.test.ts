import { describe, it, expect } from "vitest";
import { parseIssueInput } from "./validation";

describe("parseIssueInput name", () => {
  it("trims and collapses whitespace", () => {
    expect(parseIssueInput({ name: "  Олена   Коваленко ", tier: 10 })).toEqual({
      ok: true,
      name: "Олена Коваленко",
      tier: 10,
    });
  });

  it("accepts apostrophes and hyphens", () => {
    const r = parseIssueInput({ name: "О'Нілл-Коваленко", tier: 10 });
    expect(r.ok).toBe(true);
  });

  it("rejects empty and whitespace-only names", () => {
    expect(parseIssueInput({ name: "", tier: 10 }).ok).toBe(false);
    expect(parseIssueInput({ name: "   ", tier: 10 }).ok).toBe(false);
  });

  it("rejects non-string names", () => {
    expect(parseIssueInput({ name: 42, tier: 10 }).ok).toBe(false);
    expect(parseIssueInput({ name: undefined, tier: 10 }).ok).toBe(false);
  });

  it("enforces the 80 character limit", () => {
    expect(parseIssueInput({ name: "а".repeat(80), tier: 10 }).ok).toBe(true);
    expect(parseIssueInput({ name: "а".repeat(81), tier: 10 }).ok).toBe(false);
  });

  it("rejects control characters", () => {
    expect(parseIssueInput({ name: "Олена\nКоваленко", tier: 10 }).ok).toBe(false);
    expect(parseIssueInput({ name: "Олена\u0000", tier: 10 }).ok).toBe(false);
  });

  it("leaves markup untouched; escaping is the renderer's job", () => {
    expect(parseIssueInput({ name: "<b>x</b>", tier: 15 })).toEqual({
      ok: true,
      name: "<b>x</b>",
      tier: 15,
    });
  });
});

describe("parseIssueInput tier", () => {
  it("accepts 10 and 15 as numbers or strings", () => {
    expect(parseIssueInput({ name: "Ан", tier: 10 })).toMatchObject({ ok: true, tier: 10 });
    expect(parseIssueInput({ name: "Ан", tier: "10" })).toMatchObject({ ok: true, tier: 10 });
    expect(parseIssueInput({ name: "Ан", tier: "15" })).toMatchObject({ ok: true, tier: 15 });
  });

  it("rejects anything else", () => {
    expect(parseIssueInput({ name: "Ан", tier: "20" }).ok).toBe(false);
    expect(parseIssueInput({ name: "Ан", tier: 0 }).ok).toBe(false);
    expect(parseIssueInput({ name: "Ан", tier: undefined }).ok).toBe(false);
  });
});
