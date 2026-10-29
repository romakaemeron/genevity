import { SignJWT } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getJwtSecret } from "@/lib/auth/session-secret";

let cookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (cookieValue ? { value: cookieValue } : undefined), set: () => {}, delete: () => {} }),
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
vi.mock("@/lib/db/client", () => ({ sql: () => [] }));

import { requireAnySession, requireSession } from "./auth";

async function as(role: string) {
  cookieValue = await new SignJWT({ userId: "u", email: "e", name: "n", role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(getJwtSecret());
}

describe("requireSession", () => {
  beforeEach(() => {
    cookieValue = undefined;
  });

  it.each(["admin", "marketing", "support"])("returns the session for %s", async (role) => {
    await as(role);
    expect((await requireSession()).role).toBe(role);
  });

  it.each(["frontdesk", "nonsense"])("redirects %s to the scan page", async (role) => {
    await as(role);
    await expect(requireSession()).rejects.toThrow("REDIRECT:/admin/scan");
  });

  it("redirects anonymous users to login", async () => {
    await expect(requireSession()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("requireAnySession accepts frontdesk", async () => {
    await as("frontdesk");
    expect((await requireAnySession()).role).toBe("frontdesk");
  });
});
