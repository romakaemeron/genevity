import { canAccessPath, isFullRole } from "./roles";

/** Accepts only same-site /admin/ paths; rejects open-redirect shapes. */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/admin/")) return null;
  if (raw.includes("//") || raw.includes("\\") || raw.includes(":") || raw.includes("..")) return null;
  return raw;
}

export function afterLoginPath(role: string, next: string | null): string {
  if (next && canAccessPath(role, next)) return next;
  return isFullRole(role) ? "/admin/dashboard" : "/admin/scan";
}
