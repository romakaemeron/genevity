import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import ServiceForm from "../_components/service-form";

export default async function NewServicePage() {
  await requireSession();
  const categories = await sql`SELECT id, title_uk, slug FROM service_categories ORDER BY sort_order`;
  return <ServiceForm categories={categories as any} />;
}
