import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";
import SubmissionsTable, { type SubmissionRow } from "./_components/submissions-table";
import type { FormStatus } from "../_actions/forms";
import { cn } from "@/lib/utils";
import { getAdminStrings } from "../_i18n/server";

const PAGE_SIZE = 50;

export default async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSession();

  const { page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const t = await getAdminStrings();

  const [rows, countRows, newCountRows] = await Promise.all([
    sql`
      SELECT id, status, name, phone, direction, form_label,
             page_url, utm_source, utm_campaign, created_at
      FROM form_submissions
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `,
    sql`SELECT count(*)::int AS total FROM form_submissions`,
    sql`SELECT count(*)::int AS new_total FROM form_submissions WHERE status = 'new'`,
  ]);

  const total = Number(countRows[0].total);
  const totalNew = Number(newCountRows[0].new_total);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const submissions: SubmissionRow[] = rows.map((r) => ({
    id: r.id as string,
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

  const subtitle = t.formsPage.subtitle(total);

  const from = offset + 1;
  const to = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="p-8 overflow-hidden">
      <AdminPageHeader title={t.formsPage.title} subtitle={subtitle} />
      <SubmissionsTable submissions={submissions} noPoll={page > 1} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{from}–{to} {t.common.of} {total}</span>

          <div className="flex items-center gap-1">
            <Link
              href={`?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium transition-colors",
                page <= 1
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <ChevronLeft size={14} /> {t.common.back}
            </Link>

            <span className="px-3 py-1.5 text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>

            <Link
              href={`?page=${page + 1}`}
              aria-disabled={page >= totalPages}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium transition-colors",
                page >= totalPages
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-muted text-foreground"
              )}
            >
              {t.common.viewAll} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
