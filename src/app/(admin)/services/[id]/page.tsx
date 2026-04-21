import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { notFound } from "next/navigation";
import ServiceForm from "../_components/service-form";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const rows = await sql`SELECT * FROM services WHERE id = ${id}`;
  if (!rows.length) notFound();
  const categories = await sql`SELECT id, title_uk, slug FROM service_categories ORDER BY sort_order`;
  return <ServiceForm service={rows[0]} categories={categories as any} />;
}
