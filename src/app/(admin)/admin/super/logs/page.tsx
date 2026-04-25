import { getChangeLogs } from "../../_actions/super";
import { AdminPageHeader } from "../../_components/admin-list";
import { Clock, User, FileText } from "lucide-react";

const ACTION_STYLE: Record<string, string> = {
  create: "bg-success/15 text-success",
  update: "bg-main/15 text-main",
  delete: "bg-error/15 text-error",
};

const ENTITY_LABELS: Record<string, string> = {
  cms_user: "User",
  service: "Service",
  doctor: "Doctor",
  equipment: "Equipment",
  static_page: "Page",
  ui_string: "UI Text",
  site_settings: "Settings",
  hero: "Hero",
  about: "About",
  hero_slide: "Hero Slide",
  gallery_item: "Gallery",
  faq_item: "FAQ",
  legal_doc: "Legal Doc",
  price_item: "Price",
  form_submission: "Form",
};

function formatDate(d: string) {
  return new Date(d).toLocaleString("uk-UA", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(0, Number(pageStr ?? 0));
  const { rows, total } = await getChangeLogs(page, 50);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Change Log"
        subtitle={`${total} events recorded — every content change with who, what, and when.`}
      />

      {rows.length === 0 ? (
        <div className="mt-10 text-center py-16 rounded-2xl border border-line bg-champagne-dark text-muted body-m">
          No changes logged yet. Edits made from here on will appear here.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {rows.map((row: any) => {
            const entityLabel = ENTITY_LABELS[row.entity_type] ?? row.entity_type;
            return (
              <div key={row.id} className="rounded-xl border border-line bg-champagne-dark p-4 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Action badge */}
                  <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${ACTION_STYLE[row.action] ?? "bg-muted/10 text-muted"}`}>
                    {row.action}
                  </span>
                  {/* Entity type */}
                  <span className="text-sm font-medium text-ink">
                    {entityLabel}{row.entity_label ? ` · ${row.entity_label}` : ""}
                  </span>
                  <div className="flex-1" />
                  {/* Time */}
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock size={11} /> {formatDate(row.created_at)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-0.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <User size={11} /> {row.user_name} <span className="text-black-30">({row.user_email})</span>
                  </span>
                  {row.page_path && (
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <FileText size={11} /> {row.page_path}
                    </span>
                  )}
                  {row.entity_id && (
                    <span className="text-xs font-mono text-black-30">{row.entity_id}</span>
                  )}
                </div>

                {/* Diff */}
                {(row.diff_before || row.diff_after) && (
                  <details className="mt-1">
                    <summary className="text-xs text-muted cursor-pointer hover:text-ink transition-colors select-none">
                      Show diff
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      {row.diff_before != null && (
                        <div className="p-3 rounded-lg bg-error/5 border border-error/15 text-error overflow-auto max-h-40">
                          <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-error/60 mb-1">Before</p>
                          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(row.diff_before, null, 2)}</pre>
                        </div>
                      )}
                      {row.diff_after != null && (
                        <div className="p-3 rounded-lg bg-success/5 border border-success/15 text-success overflow-auto max-h-40">
                          <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-success/60 mb-1">After</p>
                          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(row.diff_after, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 0 && (
            <a href={`?page=${page - 1}`} className="px-4 py-2 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:bg-champagne transition-colors">
              ← Previous
            </a>
          )}
          <span className="text-sm text-muted">Page {page + 1} of {totalPages}</span>
          {page < totalPages - 1 && (
            <a href={`?page=${page + 1}`} className="px-4 py-2 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:bg-champagne transition-colors">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
