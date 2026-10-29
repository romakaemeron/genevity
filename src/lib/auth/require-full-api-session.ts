import { getSession } from "@/app/(admin)/admin/_actions/auth";
import { isFullRole } from "./roles";

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/**
 * Session guard for `/api/admin/*` route handlers. The proxy already blocks
 * restricted roles, but a route must not depend on that alone: any valid
 * session with a role other than admin/marketing/support (frontdesk, unknown)
 * is refused here. Call it before touching the DB or any other service.
 */
export async function requireFullApiSession(): Promise<{ session: Session } | { response: Response }> {
  const session = await getSession();
  if (!session) return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isFullRole(session.role)) return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { session };
}
