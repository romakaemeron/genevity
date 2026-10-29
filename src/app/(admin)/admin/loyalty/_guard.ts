import { redirect } from "next/navigation";
import { requireSession } from "../_actions/auth";

/** Admin-only page guard. Call first in every loyalty page, before any data read. */
export async function requireAdminPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/admin/dashboard");
  return session;
}
