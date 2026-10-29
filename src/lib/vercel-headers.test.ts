import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error - Next ships no types for its compiled path-to-regexp
import { pathToRegexp } from "next/dist/compiled/path-to-regexp";

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const config = JSON.parse(readFileSync(path.join(process.cwd(), "vercel.json"), "utf8")) as {
  headers: HeaderRule[];
};

describe("vercel.json public cache rule", () => {
  const rule = config.headers.find((h) =>
    h.headers.some((x) => x.key === "Cache-Control" && x.value.includes("s-maxage=86400")),
  );

  it("exists", () => {
    expect(rule).toBeDefined();
  });

  const matches = (p: string) => (pathToRegexp(rule!.source) as RegExp).test(p);

  it.each(["/scan/abc", "/card/abc", "/api/loyalty/pass/x", "/admin/scan/x", "/admin/loyalty"])(
    "does not publicly cache %s",
    (p) => {
      expect(matches(p)).toBe(false);
    },
  );

  it.each(["/", "/uk/poslugy", "/ru/blog"])("still caches %s", (p) => {
    expect(matches(p)).toBe(true);
  });
});
