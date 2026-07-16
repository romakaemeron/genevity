"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function saveServiceRelations(
  serviceId: string,
  rel: { doctorIds: string[]; relatedServiceIds: string[]; equipmentIds: string[] },
) {
  const oldDoctorRows = await sql`SELECT doctor_id FROM service_doctors WHERE service_id = ${serviceId}`;
  const oldDoctorIds = oldDoctorRows.map((r) => r.doctor_id as string);

  await sql`DELETE FROM service_doctors WHERE service_id = ${serviceId}`;
  for (let i = 0; i < rel.doctorIds.length; i++) {
    await sql`INSERT INTO service_doctors (service_id, doctor_id, sort_order) VALUES (${serviceId}, ${rel.doctorIds[i]}, ${i})`;
  }

  // Bump both un-linked and newly-linked doctors so their "services I perform"
  // list on the doctor page doesn't 304 stale.
  const affectedDoctorIds = Array.from(new Set([...oldDoctorIds, ...rel.doctorIds]));
  if (affectedDoctorIds.length > 0) {
    await sql`UPDATE doctors SET updated_at = now() WHERE id = ANY(${affectedDoctorIds})`;
  }

  await sql`DELETE FROM service_related WHERE service_id = ${serviceId}`;
  for (let i = 0; i < rel.relatedServiceIds.length; i++) {
    await sql`INSERT INTO service_related (service_id, related_service_id, sort_order) VALUES (${serviceId}, ${rel.relatedServiceIds[i]}, ${i})`;
  }

  await sql`DELETE FROM service_equipment WHERE service_id = ${serviceId}`;
  for (let i = 0; i < rel.equipmentIds.length; i++) {
    await sql`INSERT INTO service_equipment (service_id, equipment_id, sort_order) VALUES (${serviceId}, ${rel.equipmentIds[i]}, ${i})`;
  }

  // Link changes don't touch services.updated_at on their own — bump it so
  // Last-Modified/304 reflects the real page change.
  await sql`UPDATE services SET updated_at = now() WHERE id = ${serviceId}`;

  revalidatePath("/");
  return { ok: true };
}
