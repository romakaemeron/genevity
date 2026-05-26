import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { MessageSquare, Plus, Star, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import {
  AdminPageHeader, AdminPrimaryButton, AdminSecondaryButton,
  AdminSectionHeading,
} from "../_components/admin-list";
import { getAdminStrings } from "../_i18n/server";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import SubmissionsTable, { type SubmissionRow } from "../forms/_components/submissions-table";
import type { FormStatus } from "../_actions/forms";

async function getStats() {
  const rows = await sql`
    SELECT
      (SELECT count(*)::int FROM form_submissions WHERE status = 'new') AS new_forms,
      (SELECT count(*)::int FROM doctor_reviews WHERE is_published = false) AS pending_reviews,
      (SELECT count(*)::int FROM form_submissions
         WHERE created_at >= date_trunc('week', current_timestamp)) AS this_week,
      (SELECT count(*)::int FROM form_submissions
         WHERE created_at >= date_trunc('week', current_timestamp) - interval '7 days'
           AND created_at <  date_trunc('week', current_timestamp)) AS last_week,
      (SELECT count(*)::int FROM form_submissions
         WHERE processed_at >= current_date AND processed_at IS NOT NULL) AS processed_today
  `;
  return rows[0];
}

async function getRecentSubmissions() {
  const rows = await sql`
    SELECT id, status, name, phone, direction, form_label,
           page_url, utm_source, utm_campaign, created_at
    FROM form_submissions
    ORDER BY created_at DESC
    LIMIT 10
  `;
  return rows.map((r) => ({
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
}

export default async function DashboardPage() {
  await requireSession();
  const [stats, recentForms, t] = await Promise.all([getStats(), getRecentSubmissions(), getAdminStrings()]);

  const thisWeek = Number(stats.this_week);
  const lastWeek = Number(stats.last_week);
  const weekPct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
  const weekLabel = lastWeek === 0
    ? t.dashboard.firstWeekLabel
    : weekPct === null ? "" : `${weekPct >= 0 ? "+" : ""}${weekPct}% ${t.dashboard.vsLastWeek}`;

  const statCards = [
    {
      label: t.dashboard.newForms,
      value: Number(stats.new_forms),
      icon: MessageSquare,
      href: "/admin/forms",
      iconColor: Number(stats.new_forms) > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
      urgent: Number(stats.new_forms) > 0,
      trend: null as number | null,
      sublabel: null as string | null,
    },
    {
      label: t.dashboard.thisWeek,
      value: thisWeek,
      icon: TrendingUp,
      href: "/admin/forms",
      iconColor: "bg-blue-50 text-blue-600",
      urgent: false,
      trend: weekPct,
      sublabel: weekLabel,
    },
    {
      label: t.dashboard.processedToday,
      value: Number(stats.processed_today),
      icon: CheckCircle2,
      href: "/admin/forms",
      iconColor: Number(stats.processed_today) > 0 ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground",
      urgent: false,
      trend: null,
      sublabel: null,
    },
    {
      label: t.dashboard.pendingReviews,
      value: Number(stats.pending_reviews),
      icon: Star,
      href: "/admin/reviews",
      iconColor: Number(stats.pending_reviews) > 0 ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground",
      urgent: Number(stats.pending_reviews) > 0,
      trend: null,
      sublabel: null,
    },
  ];

  return (
    <div className="p-8">
      <AdminPageHeader title={t.dashboard.title} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <Card className={cn(
              "p-5 gap-0 flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer border h-full",
              card.urgent
                ? "border-destructive/20 shadow-sm ring-1 ring-destructive/10"
                : "hover:border-border/80"
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", card.iconColor)}>
                  <card.icon size={18} />
                </div>
                {card.trend !== null && (
                  <span className={cn(
                    "text-[11px] font-medium px-1.5 py-0.5 rounded-md tabular-nums",
                    card.trend >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  )}>
                    {card.trend >= 0 ? "+" : ""}{card.trend}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-foreground tabular-nums">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              {card.sublabel && (
                <p className="text-[11px] text-muted-foreground/60 mt-1">{card.sublabel}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <AdminSectionHeading>{t.dashboard.recentSubmissions}</AdminSectionHeading>
        <div className="-mt-3">
          <AdminSecondaryButton href="/admin/forms">
            {t.dashboard.viewAll} <ArrowRight size={14} />
          </AdminSecondaryButton>
        </div>
      </div>

      {recentForms.length === 0 ? (
        <div className="bg-champagne-dark rounded-2xl p-12 text-center text-muted text-sm">
          {t.dashboard.noSubmissions}
        </div>
      ) : (
        <SubmissionsTable submissions={recentForms} />
      )}

      <div className="flex gap-3 mt-8">
        <AdminPrimaryButton href="/admin/services/new"><Plus size={16} /> {t.dashboard.addService}</AdminPrimaryButton>
        <AdminSecondaryButton href="/admin/doctors/new"><Plus size={16} /> {t.dashboard.addDoctor}</AdminSecondaryButton>
      </div>
    </div>
  );
}
