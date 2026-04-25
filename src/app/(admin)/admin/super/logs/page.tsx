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
  sections: "Content Sections",
  faq: "FAQ",
  ui_string: "UI Text",
  site_settings: "Settings",
  hero: "Hero",
  about: "About",
  hero_slide: "Hero Slide",
  gallery_item: "Gallery",
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

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v || "—";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

function DiffView({ before, after, action }: {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  action: string;
}) {
  // Create-only: show all after fields
  if (!before && after) {
    const entries = Object.entries(after).filter(([, v]) => v !== null && v !== undefined && v !== "");
    return (
      <div className="mt-2 flex flex-col gap-1">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[160px_1fr] gap-2 text-xs font-mono">
            <span className="text-muted truncate">{k}</span>
            <span className="text-success break-all">{formatValue(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Delete-only: show all before fields
  if (before && !after) {
    const entries = Object.entries(before).filter(([, v]) => v !== null && v !== undefined && v !== "");
    return (
      <div className="mt-2 flex flex-col gap-1">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[160px_1fr] gap-2 text-xs font-mono">
            <span className="text-muted truncate">{k}</span>
            <span className="text-error line-through break-all">{formatValue(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Update: show only fields that actually changed
  if (before && after) {
    const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
    const changed = allKeys.filter(
      (k) => JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null)
    );

    if (changed.length === 0) {
      return <p className="mt-2 text-xs text-muted italic">No field changes detected</p>;
    }

    return (
      <div className="mt-2 flex flex-col gap-2">
        {changed.map((k) => (
          <div key={k} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider font-sans">{k}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-error/8 text-error border border-error/15 break-all line-through">
                {formatValue(before[k])}
              </span>
              <span className="px-2 py-1 rounded bg-success/8 text-success border border-success/15 break-all">
                {formatValue(after[k])}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
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
            const hasDiff = row.diff_before != null || row.diff_after != null;
            return (
              <div key={row.id} className="rounded-xl border border-line bg-champagne-dark p-4 flex flex-col gap-2">
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${ACTION_STYLE[row.action] ?? "bg-muted/10 text-muted"}`}>
                    {row.action}
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {entityLabel}{row.entity_label ? ` · ${row.entity_label}` : ""}
                  </span>
                  <div className="flex-1" />
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock size={11} /> {formatDate(row.created_at)}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mt-0.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <User size={11} />
                    <span className="font-medium text-ink/70">{row.user_name}</span>
                    <span className="text-black-30">{row.user_email}</span>
                  </span>
                  {row.page_path && (
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <FileText size={11} /> {row.page_path}
                    </span>
                  )}
                  {row.entity_id && row.entity_id.length > 20 && (
                    <span className="text-xs font-mono text-black-30 truncate max-w-[180px]">{row.entity_id}</span>
                  )}
                </div>

                {/* Diff */}
                {hasDiff && (
                  <details className="mt-1 group">
                    <summary className="text-xs text-muted cursor-pointer hover:text-ink transition-colors select-none list-none flex items-center gap-1.5">
                      <span className="inline-block transition-transform group-open:rotate-90">▶</span>
                      Show changes
                    </summary>
                    <div className="mt-3 border-t border-line pt-3">
                      <DiffView
                        before={row.diff_before as Record<string, unknown> | null}
                        after={row.diff_after as Record<string, unknown> | null}
                        action={row.action}
                      />
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
