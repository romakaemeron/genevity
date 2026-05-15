import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { FileText, Stethoscope, Cpu, MessageSquare, Plus, ArrowRight } from "lucide-react";
import {
  AdminPageHeader, AdminPrimaryButton, AdminSecondaryButton,
  AdminSectionHeading, AdminList, AdminListItem,
} from "../_components/admin-list";

async function getStats() {
  const rows = await sql`
    SELECT
      (SELECT count(*) FROM services) AS services,
      (SELECT count(*) FROM doctors) AS doctors,
      (SELECT count(*) FROM equipment) AS equipment,
      (SELECT count(*) FROM form_submissions WHERE status = 'new') AS new_forms
  `;
  return rows[0];
}

async function getRecentSubmissions() {
  return sql`
    SELECT id, form_type, name, phone, status, created_at
    FROM form_submissions
    ORDER BY created_at DESC
    LIMIT 5
  `;
}

export default async function DashboardPage() {
  await requireSession();
  const [stats, recentForms] = await Promise.all([getStats(), getRecentSubmissions()]);

  const statCards = [
    { label: "Services", value: stats.services, icon: FileText, href: "/admin/services", color: "bg-main/10 text-main" },
    { label: "Doctors", value: stats.doctors, icon: Stethoscope, href: "/admin/doctors", color: "bg-success/10 text-success" },
    { label: "Equipment", value: stats.equipment, icon: Cpu, href: "/admin/equipment", color: "bg-ice-dark/20 text-ice-darker" },
    { label: "New Forms", value: stats.new_forms, icon: MessageSquare, href: "/admin/forms", color: stats.new_forms > 0 ? "bg-error/10 text-error" : "bg-black-5 text-muted" },
  ];

  return (
    <div className="p-8">
      <AdminPageHeader title="CMS Dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-champagne-dark rounded-2xl p-5 hover:bg-champagne-darker transition-colors group"
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-heading text-ink">{String(card.value)}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
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
        <AdminList>
          {recentForms.map((form) => (
            <AdminListItem
              key={form.id}
              href={`/admin/forms/${form.id}`}
              title={form.name || "—"}
              subtitle={form.phone || "—"}
              leading={
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  form.status === "new" ? "bg-error" : form.status === "read" ? "bg-warning" : "bg-success"
                }`} />
              }
              badge={
                <p className="text-xs text-muted">
                  {new Date(form.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              }
            />
          ))}
        </AdminList>
      )}

      <div className="flex gap-3 mt-8">
        <AdminPrimaryButton href="/admin/services/new"><Plus size={16} /> New Service</AdminPrimaryButton>
        <AdminSecondaryButton href="/admin/doctors/new"><Plus size={16} /> New Doctor</AdminSecondaryButton>
      </div>
    </div>
  );
}
