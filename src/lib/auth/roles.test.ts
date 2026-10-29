import { describe, expect, it } from "vitest";
import { canAccessPath, ROLE_LEVEL } from "./roles";

const TOKEN = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

describe("canAccessPath", () => {
  it("has the expected role levels", () => {
    expect(ROLE_LEVEL).toEqual({ admin: 3, marketing: 2, support: 1, frontdesk: 0 });
  });

  it.each([
    "/admin/login",
    "/admin/logout",
    "/admin/scan",
    "/admin/scan/",
    `/admin/scan/${TOKEN}`,
    `/admin/scan/${TOKEN}/`,
  ])("frontdesk may reach %s", (p) => {
    expect(canAccessPath("frontdesk", p)).toBe(true);
  });

  it.each([
    "/admin/forms",
    "/admin/dashboard",
    "/admin/scan/short",
    "/admin/scan/../forms",
    "/admin//forms",
    "/admin/scan/%2e%2e/forms",
    `/admin/scan/${TOKEN}/x`,
    "/api/admin/forms/export",
    "/admin/logout/x",
    "/admin/loyalty",
    "/admin/super/users",
    "/admin/scan\\..\\forms",
    "/admin/scan//",
  ])("frontdesk may not reach %s", (p) => {
    expect(canAccessPath("frontdesk", p)).toBe(false);
  });

  it("leaves existing roles unrestricted", () => {
    expect(canAccessPath("support", "/admin/forms")).toBe(true);
    expect(canAccessPath("admin", "/admin/anything")).toBe(true);
    expect(canAccessPath("marketing", "/api/admin/analytics")).toBe(true);
  });

  it("treats unknown roles as frontdesk", () => {
    expect(canAccessPath("nonsense", "/admin/forms")).toBe(false);
    expect(canAccessPath("nonsense", "/admin/scan")).toBe(true);
    expect(canAccessPath("", "/admin/forms")).toBe(false);
  });
});
