import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { markFormStatus } from "../_actions/forms";

const statusColors: Record<string, string> = {
  new: "bg-error", read: "bg-warning", processed: "bg-success", archived: "bg-stone-light",
};

export default async function FormsPage() {
  await requireSession();
  const submissions = await sql`SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 100`;

  const counts = {
    all: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
    read: submissions.filter((s) => s.status === "read").length,
    processed: submissions.filter((s) => s.status === "processed").length,
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="heading-2 text-ink mb-2">Form Submissions</h1>
      <p className="body-m text-muted mb-8">
        {counts.new > 0 && <span className="text-error font-medium">{counts.new} new</span>}
        {counts.new > 0 && " · "}
        {counts.all} total
      </p>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line p-12 text-center text-muted">
          No form submissions yet. They will appear here when visitors submit the consultation form.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-line overflow-hidden divide-y divide-line">
          {submissions.map((form) => (
            <div key={form.id} className="flex items-center gap-4 px-6 py-4 hover:bg-champagne/30 transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColors[form.status]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{form.name || "—"}</p>
                <p className="text-xs text-muted">{form.phone} {form.direction ? `· ${form.direction}` : ""}</p>
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
