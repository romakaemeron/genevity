"use server";

import { sql } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export type FormStatus = "new" | "processed";

export interface SubmissionListRow {
  id: string;
  status: FormStatus;
  name: string | null;
  phone: string | null;
  direction: string | null;
  form_label: string | null;
  page_url: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
}

/**
 * Fetch the most recent submissions for the admin list. Used both by
 * the server page render and by the client-side poll interval so both
 * paths receive identically-shaped data.
 */
export async function listRecentSubmissions(limit = 200): Promise<SubmissionListRow[]> {
  const rows = await sql`
    SELECT id, status, name, phone, direction, form_label,
           page_url, utm_source, utm_campaign, created_at
    FROM form_submissions
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id as string,
    status: (r.status === "processed" ? "processed" : "new") as FormStatus,
    name: (r.name as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    direction: (r.direction as string | null) ?? null,
    form_label: (r.form_label as string | null) ?? null,
    page_url: (r.page_url as string | null) ?? null,
    utm_source: (r.utm_source as string | null) ?? null,
    utm_campaign: (r.utm_campaign as string | null) ?? null,
    // Send as ISO string so client JSON serialization is stable.
    created_at: (r.created_at as Date).toISOString(),
  }));
}

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
