"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function saveServiceRelations(
  serviceId: string,
  rel: { doctorIds: string[]; relatedServiceIds: string[]; equipmentIds: string[] },
) {
  await sql`DELETE FROM service_doctors WHERE service_id = ${serviceId}`;
  for (let i = 0; i < rel.doctorIds.length; i++) {
    await sql`INSERT INTO service_doctors (service_id, doctor_id, sort_order) VALUES (${serviceId}, ${rel.doctorIds[i]}, ${i})`;
  }

  await sql`DELETE FROM service_related WHERE service_id = ${serviceId}`;
  for (let i = 0; i < rel.relatedServiceIds.length; i++) {
    await sql`INSERT INTO service_related (service_id, related_service_id, sort_order) VALUES (${serviceId}, ${rel.relatedServiceIds[i]}, ${i})`;
  }

  await sql`DELETE FROM service_equipment WHERE service_id = ${serviceId}`;
  for (let i = 0; i < rel.equipmentIds.length; i++) {
    await sql`INSERT INTO service_equipment (service_id, equipment_id, sort_order) VALUES (${serviceId}, ${rel.equipmentIds[i]}, ${i})`;
  }

  revalidatePath("/");
  return { ok: true };
}
