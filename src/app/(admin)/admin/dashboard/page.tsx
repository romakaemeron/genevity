import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { FileText, Stethoscope, MessageSquare, Plus, ArrowRight, Star } from "lucide-react";
import {
  AdminPageHeader, AdminPrimaryButton, AdminSecondaryButton,
  AdminSectionHeading,
} from "../_components/admin-list";
import SubmissionsTable, { type SubmissionRow } from "../forms/_components/submissions-table";
import type { FormStatus } from "../_actions/forms";

async function getStats() {
  const rows = await sql`
    SELECT
      (SELECT count(*) FROM services) AS services,
      (SELECT count(*) FROM doctors WHERE is_published = true) AS doctors,
      (SELECT count(*) FROM form_submissions WHERE status = 'new') AS new_forms,
      (SELECT count(*) FROM doctor_reviews WHERE is_published = false) AS pending_reviews
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
  const [stats, recentForms] = await Promise.all([getStats(), getRecentSubmissions()]);

  const statCards = [
    { label: "New Requests",    value: stats.new_forms,       icon: MessageSquare, href: "/admin/forms",   color: Number(stats.new_forms)       > 0 ? "bg-error/10 text-error"          : "bg-black-5 text-muted", urgent: Number(stats.new_forms)       > 0 },
    { label: "Pending Reviews", value: stats.pending_reviews, icon: Star,          href: "/admin/reviews", color: Number(stats.pending_reviews) > 0 ? "bg-warning/10 text-warning-dark"   : "bg-black-5 text-muted", urgent: Number(stats.pending_reviews) > 0 },
    { label: "Services",        value: stats.services,        icon: FileText,      href: "/admin/services",color: "bg-main/10 text-main",    urgent: false },
    { label: "Doctors",         value: stats.doctors,         icon: Stethoscope,   href: "/admin/doctors", color: "bg-success/10 text-success", urgent: false },
  ];

  return (
    <div className="p-8">
      <AdminPageHeader title="CMS Dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-2xl p-5 hover:shadow-md transition-all group ${card.urgent ? "bg-white ring-1 ring-error/20 shadow-sm" : "bg-champagne-dark hover:bg-champagne-darker"}`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-heading text-ink">{String(card.value)}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <AdminSectionHeading>Recent Submissions</AdminSectionHeading>
        <Link href="/admin/forms" className="text-sm text-main hover:text-main-dark transition-colors flex items-center gap-1 -mt-3">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {recentForms.length === 0 ? (
        <div className="bg-champagne-dark rounded-2xl p-12 text-center text-muted text-sm">
          No form submissions yet
        </div>
      ) : (
        <SubmissionsTable submissions={recentForms} compact />
      )}

      <div className="flex gap-3 mt-8">
        <AdminPrimaryButton href="/admin/services/new"><Plus size={16} /> New Service</AdminPrimaryButton>
        <AdminSecondaryButton href="/admin/doctors/new"><Plus size={16} /> New Doctor</AdminSecondaryButton>
      </div>
    </div>
  );
}
