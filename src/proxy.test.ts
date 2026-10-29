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
  getLastModifiedMap: async () => ({}),
  isComposedPath: () => false,
  normalizeContentPath: (p: string) => p,
}));

import { getJwtSecret } from "@/lib/auth/session-secret";
import { proxy } from "./proxy";

const TOKEN = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

async function cookieFor(role: string) {
  const jwt = await new SignJWT({ userId: "u1", email: "a@b.c", name: "N", role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(getJwtSecret());
  return `cms_session=${jwt}`;
}

async function call(path: string, role: string | null, host = "genevity.com.ua") {
  const headers: Record<string, string> = { host };
  if (role) headers.cookie = await cookieFor(role);
  return proxy(new NextRequest(`https://${host}${path}`, { headers }));
}

describe("proxy frontdesk gate", () => {
  it.each([
    ["/admin/forms", "genevity.com.ua"],
    ["/api/admin/forms/export", "genevity.com.ua"],
    ["/forms", "admin.genevity.com.ua"],
    ["/api/admin/analytics", "admin.genevity.com.ua"],
  ])("forbids frontdesk on %s (%s)", async (p, host) => {
    const res = await call(p, "frontdesk", host);
    expect(res.status).toBe(403);
  });

  it.each([
    [`/admin/scan/${TOKEN}`, "genevity.com.ua"],
    ["/admin/scan", "genevity.com.ua"],
    [`/scan/${TOKEN}`, "admin.genevity.com.ua"],
  ])("lets frontdesk through on %s (%s)", async (p, host) => {
    const res = await call(p, "frontdesk", host);
    expect(res.status).not.toBe(403);
  });

  it("forbids a validly signed unknown role", async () => {
    expect((await call("/admin/forms", "nonsense")).status).toBe(403);
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
