export type Role = "admin" | "marketing" | "support" | "frontdesk";

export const ROLE_LEVEL: Record<Role, number> = {
  admin: 3,
  marketing: 2,
  support: 1,
  frontdesk: 0,
};

const KNOWN_FULL_ROLES = new Set<string>(["admin", "marketing", "support"]);
const SCAN_TOKEN_PATH = /^\/admin\/scan\/[A-Za-z0-9_-]{32}\/?$/;

export function isFullRole(role: string): boolean {
  return KNOWN_FULL_ROLES.has(role);
}

/**
 * Deny-by-default path gate for the narrow `frontdesk` role.
 * Existing roles are unrestricted (unchanged behavior); `frontdesk` and any
 * unknown role string may only reach the login and card-scan pages.
 */
export function canAccessPath(role: string, pathname: string): boolean {
  if (isFullRole(role)) return true;

  if (
    pathname.includes("..") ||
    pathname.includes("//") ||
    pathname.includes("\\") ||
    pathname.includes("%") ||
    pathname.includes("/api/admin")
  ) {
    return false;
  }

  if (pathname === "/admin/login" || pathname === "/admin/logout" || pathname === "/admin/scan" || pathname === "/admin/scan/") {
    return true;
  }
  return SCAN_TOKEN_PATH.test(pathname);
}
