"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function markFormStatus(id: string, status: "read" | "processed" | "archived") {
  const timestamp = status === "read" ? "read_at" : status === "processed" ? "processed_at" : null;

  await sql`UPDATE form_submissions SET status = ${status} WHERE id = ${id}`;

  if (timestamp === "read_at") {
    await sql`UPDATE form_submissions SET read_at = now() WHERE id = ${id}`;
  } else if (timestamp === "processed_at") {
    await sql`UPDATE form_submissions SET processed_at = now() WHERE id = ${id}`;
  }

  revalidatePath("/forms");
  revalidatePath("/dashboard");
}

export async function deleteSubmission(id: string) {
  await sql`DELETE FROM form_submissions WHERE id = ${id}`;
  revalidatePath("/forms");
  revalidatePath("/dashboard");
}
