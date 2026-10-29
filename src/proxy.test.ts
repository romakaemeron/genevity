import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// next-intl's middleware and the content-epoch helpers need a Next runtime / DB;
// the gate under test runs before either of them.
vi.mock("next-intl/middleware", async () => {
  const { NextResponse } = await import("next/server.js");
  return { default: () => () => NextResponse.next() };
});
vi.mock("@/lib/last-modified", () => ({
  getComposedEpoch: async () => 0,
  getGlobalEpoch: async () => 0,
  getLastModifiedMap: async () => new Map(),
  isComposedPath: () => false,
  normalizeContentPath: (p: string) => p,
}));

import { getJwtSecret } from "@/lib/auth/session-secret";
// @ts-expect-error - Next ships no types for its compiled path-to-regexp
import { pathToRegexp } from "next/dist/compiled/path-to-regexp";
import { config, proxy } from "./proxy";

const TOKEN = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

async function cookieFor(role: string) {
  const jwt = await new SignJWT({ userId: "u1", email: "a@b.c", name: "N", role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(getJwtSecret());
  return `cms_session=${jwt}`;
}

async function call(path: string, role: string | null, host = "genevity.com.ua", extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { host, ...extra };
  if (role) headers.cookie = await cookieFor(role);
  return proxy(new NextRequest(`https://${host}${path}`, { headers }));
}

describe("proxy frontdesk gate", () => {
  it.each([
    ["/api/admin/forms/export", "genevity.com.ua"],
    ["/api/admin/analytics", "admin.genevity.com.ua"],
  ])("forbids frontdesk on API %s (%s)", async (p, host) => {
    const res = await call(p, "frontdesk", host);
    expect(res.status).toBe(403);
  });

  it.each([
    ["/admin/forms", "genevity.com.ua", "/admin/scan"],
    ["/admin", "genevity.com.ua", "/admin/scan"],
    ["/admin/", "genevity.com.ua", "/admin/scan"],
    ["/forms", "admin.genevity.com.ua", "/scan"],
    ["/", "admin.genevity.com.ua", "/scan"],
    ["/admin/dashboard", "admin.genevity.com.ua", "/scan"],
  ])("redirects frontdesk GET page %s (%s) to the scan landing", async (p, host, to) => {
    const res = await call(p, "frontdesk", host);
    expect(res.status).toBe(307);
    const loc = new URL(res.headers.get("location")!);
    expect(loc.host).toBe(host);
    expect(loc.pathname).toBe(to);
  });

  it("redirects an unknown role the same way", async () => {
    const res = await call("/admin/forms", "nonsense");
    expect(res.status).toBe(307);
  });

  it("keeps a bare 403 for restricted non-GET requests, except POST /admin/logout", async () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const req = new NextRequest("https://genevity.com.ua/admin/scan", {
        method,
        headers: { host: "genevity.com.ua", cookie: await cookieFor("frontdesk") },
      });
      expect((await proxy(req)).status).toBe(403);
    }
    const post = async (path: string, host: string) =>
      proxy(new NextRequest(`https://${host}${path}`, {
        method: "POST",
        headers: { host, cookie: await cookieFor("frontdesk") },
      }));
    expect((await post("/admin/logout", "genevity.com.ua")).status).not.toBe(403);
    expect((await post("/logout", "admin.genevity.com.ua")).status).not.toBe(403);
    expect((await post("/admin/login", "genevity.com.ua")).status).toBe(403);
  });

  it("does not restrict non-GET for support", async () => {
    const req = new NextRequest("https://genevity.com.ua/admin/forms", {
      method: "POST",
      headers: { host: "genevity.com.ua", cookie: await cookieFor("support") },
    });
    expect((await proxy(req)).status).not.toBe(403);
  });

  it.each([
    [`/admin/scan/${TOKEN}`, "genevity.com.ua"],
    ["/admin/scan", "genevity.com.ua"],
    [`/scan/${TOKEN}`, "admin.genevity.com.ua"],
  ])("lets frontdesk through on %s (%s)", async (p, host) => {
    const res = await call(p, "frontdesk", host);
    expect(res.status).not.toBe(403);
  });


  it.each([
    ["/admin/forms", "genevity.com.ua"],
    ["/api/admin/forms/export", "genevity.com.ua"],
    ["/forms", "admin.genevity.com.ua"],
    [`/scan/${TOKEN}`, "admin.genevity.com.ua"],
  ])("does not forbid support on %s (%s)", async (p, host) => {
    expect((await call(p, "support", host)).status).not.toBe(403);
  });

  it("does not 403 without a cookie", async () => {
    expect((await call("/admin/forms", null)).status).not.toBe(403);
    expect((await call("/forms", null, "admin.genevity.com.ua")).status).not.toBe(403);
  });

  it("does not 403 on a forged cookie (falls through to the page-level login)", async () => {
    const res = await proxy(
      new NextRequest("https://genevity.com.ua/admin/forms", { headers: { host: "genevity.com.ua", cookie: "cms_session=garbage" } }),
    );
    expect(res.status).not.toBe(403);
  });
});

describe("proxy server actions and matcher", () => {
  it("forbids any next-action request from frontdesk, even on an allowed path", async () => {
    const res = await call("/admin/scan", "frontdesk", "genevity.com.ua", { "next-action": "abc" });
    expect(res.status).toBe(403);
  });

  it("does not block next-action for support", async () => {
    const res = await call("/admin/forms", "support", "genevity.com.ua", { "next-action": "abc" });
    expect(res.status).not.toBe(403);
  });

  it("forbids dotted admin paths for frontdesk", async () => {
    expect((await call("/admin/services/a.b", "frontdesk", "genevity.com.ua", { "next-action": "x" })).status).toBe(403);
    expect((await call("/admin/forms/x.y", "frontdesk")).status).toBe(307);
    expect((await call("/api/admin/x.y", "frontdesk")).status).toBe(403);
  });

  it("matcher covers dotted admin and admin API paths", () => {
    const hits = (p: string) =>
      config.matcher.some((m: string) => (pathToRegexp(m) as RegExp).test(p));
    expect(hits("/admin/forms/x.y")).toBe(true);
    expect(hits("/admin/services/a.b")).toBe(true);
    expect(hits("/api/admin/x.y")).toBe(true);
  });
});

describe("proxy next-action on any path", () => {
  const act = { "next-action": "abc" };
  it.each(["/", "/uk/poslugy", `/card/${TOKEN}`])("forbids frontdesk server-action on %s", async (p) => {
    expect((await call(p, "frontdesk", "genevity.com.ua", act)).status).toBe(403);
  });
  it("leaves support alone on /", async () => {
    expect((await call("/", "support", "genevity.com.ua", act)).status).not.toBe(403);
  });
  it("leaves frontdesk alone on / without next-action", async () => {
    expect((await call("/", "frontdesk")).status).not.toBe(403);
  });
  it("leaves anonymous next-action unchanged", async () => {
    expect((await call("/", null, "genevity.com.ua", act)).status).not.toBe(403);
  });
});
