"use client";

/**
 * Admin view of lead submissions — one row per row in form_submissions,
 * clickable through to the detail page at /admin/forms/<id>. The status
 * column holds a live dropdown that flips between "Нова" and "Оброблено"
 * without leaving the list.
 */

import { useRouter } from "next/navigation";
import FormStatusDropdown from "../../_components/form-status-dropdown";
import type { FormStatus } from "../../_actions/forms";

export interface SubmissionRow {
  id: string;
  status: FormStatus;
  name: string | null;
  phone: string | null;
  direction: string | null; // interest (service / doctor)
  form_label: string | null;
  page_url: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string | Date;
}

interface Props {
  submissions: SubmissionRow[];
}

/** Gap + column widths tuned against the screenshot reference — phone
 *  + date stay narrow, form label truncates, page URL wraps into the
 *  remaining flexible space. */
const COL_CLS = {
  status:  "w-[120px] shrink-0",
  name:    "w-[180px] shrink-0",
  phone:   "w-[150px] shrink-0",
  form:    "w-[180px] shrink-0",
  interest:"w-[200px] shrink-0",
  page:    "flex-1 min-w-[200px]",
  source:  "w-[120px] shrink-0",
  date:    "w-[120px] shrink-0",
};

function formatDate(raw: string | Date): string {
  const d = raw instanceof Date ? raw : new Date(raw);
  return d.toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hostOf(url: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.hostname + u.pathname;
  } catch {
    return url;
  }
}

export default function SubmissionsTable({ submissions }: Props) {
  const router = useRouter();

  if (submissions.length === 0) {
    return (
      <div className="bg-champagne-dark rounded-[var(--radius-card)] p-12 text-center text-muted">
        Заявок поки що немає. Вони з&apos;являться тут, щойно відвідувач надішле форму.
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] overflow-hidden border border-line bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone bg-champagne-dark border-b border-line">
        <div className={COL_CLS.status}>Статус</div>
        <div className={COL_CLS.name}>Ім&apos;я</div>
        <div className={COL_CLS.phone}>Телефон</div>
        <div className={COL_CLS.form}>Форма</div>
        <div className={COL_CLS.interest}>Спеціальність</div>
        <div className={COL_CLS.page}>Сторінка</div>
        <div className={COL_CLS.source}>Джерело</div>
        <div className={`${COL_CLS.date} text-right`}>Дата</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-line">
        {submissions.map((s) => (
          <div
            key={s.id}
            onClick={() => router.push(`/admin/forms/${s.id}`)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-champagne-dark/40 cursor-pointer transition-colors"
          >
            <div className={COL_CLS.status}>
              <FormStatusDropdown id={s.id} current={s.status} stopRowNavigation />
            </div>
            <div className={`${COL_CLS.name} min-w-0`}>
              <p className="text-sm text-ink truncate">{s.name || "—"}</p>
            </div>
            <div className={`${COL_CLS.phone} min-w-0`}>
              <p className="text-[13px] font-mono text-ink truncate">{s.phone || "—"}</p>
            </div>
            <div className={`${COL_CLS.form} min-w-0`}>
              <p className="text-[13px] text-muted truncate">{s.form_label || "—"}</p>
            </div>
            <div className={`${COL_CLS.interest} min-w-0`}>
              <p className="text-[13px] text-ink truncate">{s.direction || "—"}</p>
            </div>
            <div className={`${COL_CLS.page} min-w-0`}>
              <p className="text-[13px] text-muted truncate" title={s.page_url || ""}>
                {hostOf(s.page_url)}
              </p>
            </div>
            <div className={`${COL_CLS.source} min-w-0`}>
              <p className="text-[13px] text-muted truncate" title={s.utm_campaign || undefined}>
                {s.utm_source || "—"}
              </p>
            </div>
            <div className={`${COL_CLS.date} text-right text-[12px] text-muted whitespace-nowrap`}>
              {formatDate(s.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
