"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export type FormStatus = "new" | "processed";

/**
 * Toggle a submission's status between the two states clinic ops actually
 * care about: `new` (untouched) and `processed` (contacted / handled).
 * Updates processed_at when flipping to processed so the admin detail
 * page can show a processing timestamp.
 */
export async function setFormStatus(id: string, status: FormStatus) {
  if (status === "processed") {
    await sql`UPDATE form_submissions SET status = ${status}, processed_at = now() WHERE id = ${id}`;
  } else {
    await sql`UPDATE form_submissions SET status = ${status}, processed_at = NULL WHERE id = ${id}`;
  }
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/forms/${id}`);
}

export async function deleteSubmission(id: string) {
  await sql`DELETE FROM form_submissions WHERE id = ${id}`;
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
}
