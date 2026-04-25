import { redirect } from "next/navigation";
import { requireSession } from "../_actions/auth";

export default async function SuperLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/admin/dashboard");
  return <>{children}</>;
}
