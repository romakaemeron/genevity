import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { markFormStatus } from "../_actions/forms";
import { AdminPageHeader } from "../_components/admin-list";

const statusColors: Record<string, string> = {
  new: "bg-error", read: "bg-warning", processed: "bg-success", archived: "bg-stone-light",
};

export default async function FormsPage() {
  await requireSession();
  const submissions = await sql`SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 100`;

  const counts = {
    all: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
  };

  const subtitle =
    counts.new > 0
      ? `${counts.new} new · ${counts.all} total`
      : `${counts.all} total`;

  return (
    <div className="p-8">
      <AdminPageHeader title="Form Submissions" subtitle={subtitle} />

      {submissions.length === 0 ? (
        <div className="bg-champagne-dark rounded-2xl p-12 text-center text-muted">
          No form submissions yet. They will appear here when visitors submit the consultation form.
        </div>
      ) : (
        <div className="bg-champagne-dark rounded-2xl overflow-hidden divide-y divide-line">
          {submissions.map((form) => (
            <div key={form.id} className="flex items-center gap-4 px-6 py-4 hover:bg-champagne-darker transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColors[form.status]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{form.name || "—"}</p>
                <p className="text-xs text-muted truncate">{form.phone} {form.direction ? `· ${form.direction}` : ""}</p>
              </div>
              <p className="text-xs text-muted shrink-0">
                {new Date(form.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-1 shrink-0">
                {form.status === "new" && (
                  <form action={markFormStatus.bind(null, form.id, "read")}>
                    <button className="text-xs px-2 py-1 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors cursor-pointer">Read</button>
                  </form>
                )}
                {(form.status === "new" || form.status === "read") && (
                  <form action={markFormStatus.bind(null, form.id, "processed")}>
                    <button className="text-xs px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 transition-colors cursor-pointer">Done</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
