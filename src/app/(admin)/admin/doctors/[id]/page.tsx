import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import { notFound } from "next/navigation";
import DoctorForm from "../_components/doctor-form";

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const rows = await sql`SELECT * FROM doctors WHERE id = ${id}`;
  if (!rows.length) notFound();

  return <DoctorForm doctor={rows[0] as any} />;
}
