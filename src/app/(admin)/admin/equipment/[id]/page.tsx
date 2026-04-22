import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { notFound } from "next/navigation";
import EquipmentForm from "../_components/equipment-form";

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const rows = await sql`SELECT * FROM equipment WHERE id = ${id}`;
  if (!rows.length) notFound();
  return <EquipmentForm equipment={rows[0] as any} />;
}
