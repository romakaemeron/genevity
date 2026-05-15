import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";
import SubmissionsTable, { type SubmissionRow } from "./_components/submissions-table";
import type { FormStatus } from "../_actions/forms";

export default async function FormsPage() {
  await requireSession();
  const rows = await sql`
    SELECT id, status, name, phone, direction, form_label,
           page_url, utm_source, utm_campaign, created_at
    FROM form_submissions
    ORDER BY created_at DESC
    LIMIT 200
  `;

  const submissions: SubmissionRow[] = rows.map((r) => ({
    id: r.id as string,
    // Old rows may still carry "read" / "archived" from before the
    // status simplification — treat anything non-"processed" as "new".
    status: (r.status === "processed" ? "processed" : "new") as FormStatus,
    name: r.name as string | null,
    phone: r.phone as string | null,
    direction: r.direction as string | null,
    form_label: r.form_label as string | null,
    page_url: r.page_url as string | null,
    utm_source: r.utm_source as string | null,
    utm_campaign: r.utm_campaign as string | null,
    created_at: r.created_at as Date,
  }));

  const newCount = submissions.filter((s) => s.status === "new").length;
  const subtitle = newCount > 0
    ? `${newCount} нових · ${submissions.length} всього`
    : `${submissions.length} всього`;

  return (
    <div className="p-8">
      <AdminPageHeader title="Заявки" subtitle={subtitle} />
      <SubmissionsTable submissions={submissions} />
    </div>
  );
}
