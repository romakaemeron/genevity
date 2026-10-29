import { jwtVerify } from "jose";
import { getJwtSecret } from "./session-secret";

/** Role from a `cms_session` cookie value; null when absent or invalid. */
export async function readSessionRole(cookieValue: string | undefined): Promise<string | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getJwtSecret());
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
