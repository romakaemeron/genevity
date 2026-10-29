import { sql } from "../client";
import { isUuid } from "@/lib/loyalty/validation";

/** CMS user lookups. Server-only: imports the DB client. */

/**
 * Current access of a user, read from the database (not the JWT). Selects only the role.
 * Returns null when the user no longer exists or the id is not a UUID.
 */
export async function getUserAccess(userId: string): Promise<{ role: string } | null> {
  if (!isUuid(userId)) return null;
  const rows = await sql`SELECT role FROM cms_users WHERE id = ${userId}`;
  return rows[0] ? { role: String(rows[0].role) } : null;
}
