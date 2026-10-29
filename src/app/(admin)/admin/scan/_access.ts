import { redirect } from "next/navigation";
import { getSession } from "../_actions/auth";
import { getUserAccess } from "@/lib/db/queries/users";
import { getCardByVerifyToken } from "@/lib/db/queries/loyalty";
import { isWellFormedToken } from "@/lib/loyalty/tokens";
import { scanView, type ScanView } from "@/lib/loyalty/scan-view";

const SCAN_ROLES = new Set(["admin", "marketing", "support", "frontdesk"]);

/**
 * Guard for the scan pages. Any role may view, but the role is re-read from the
 * database on every request (JWTs last 30 days), so a deleted or demoted account
 * stops working immediately. Does not use requireSession(), which rejects frontdesk.
 */
export async function requireScanAccess(nextPath: string): Promise<{ role: string }> {
  const loginUrl = "/admin/login?next=" + encodeURIComponent(nextPath);
  const session = await getSession();
  if (!session) redirect(loginUrl);
  const access = await getUserAccess(session.userId);
  if (!access || !SCAN_ROLES.has(access.role)) redirect(loginUrl);
  return access;
}

/** Loads the view for /admin/scan/<token>. Malformed tokens never touch the session or the database. */
export async function loadScan(token: string): Promise<ScanView> {
  if (!isWellFormedToken(token)) return { kind: "not-found" };
  await requireScanAccess("/admin/scan/" + token);
  return scanView(await getCardByVerifyToken(token));
}
