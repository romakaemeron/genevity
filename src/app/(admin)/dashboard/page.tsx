import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import Link from "next/link";
import { FileText, Stethoscope, Cpu, MessageSquare, Plus, ArrowRight } from "lucide-react";

async function getStats() {
  const rows = await sql`
    SELECT
      (SELECT count(*) FROM services) AS services,
      (SELECT count(*) FROM doctors) AS doctors,
      (SELECT count(*) FROM equipment) AS equipment,
      (SELECT count(*) FROM form_submissions WHERE status = 'new') AS new_forms,
      (SELECT count(*) FROM form_submissions) AS total_forms,
      (SELECT count(*) FROM blog_posts) AS posts
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
  const session = await requireSession();
  const [stats, recentForms] = await Promise.all([getStats(), getRecentSubmissions()]);

  const greeting = new Date().getHours() < 12 ? "Доброго ранку" : new Date().getHours() < 18 ? "Доброго дня" : "Доброго вечора";

  const statCards = [
    { label: "Services", value: stats.services, icon: FileText, href: "/services", color: "bg-main/10 text-main" },
    { label: "Doctors", value: stats.doctors, icon: Stethoscope, href: "/doctors", color: "bg-success/10 text-success" },
    { label: "Equipment", value: stats.equipment, icon: Cpu, href: "/equipment", color: "bg-ice-dark/20 text-ice-darker" },
    { label: "New Forms", value: stats.new_forms, icon: MessageSquare, href: "/forms", color: stats.new_forms > 0 ? "bg-error/10 text-error" : "bg-black-5 text-muted" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="heading-2 text-ink mb-1">{greeting}, {session.name.split(" ")[0]}</h1>
      <p className="body-m text-muted mb-8">GENEVITY Content Management System</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl p-5 border border-line hover:border-main/30 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-heading text-ink">{String(card.value)}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-heading text-lg text-ink">Recent Submissions</h2>
          <Link href="/forms" className="text-sm text-main hover:text-main-dark transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentForms.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted text-sm">
            No form submissions yet
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recentForms.map((form) => (
              <Link
                key={form.id}
                href={`/forms/${form.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-champagne/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  form.status === "new" ? "bg-error" : form.status === "read" ? "bg-warning" : "bg-success"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{form.name || "—"}</p>
                  <p className="text-xs text-muted">{form.phone || "—"}</p>
                </div>
                <p className="text-xs text-muted shrink-0">
                  {new Date(form.created_at).toLocaleDateString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mt-6">
        <Link href="/services/new" className="inline-flex items-center gap-2 px-4 py-2 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors">
          <Plus size={16} /> New Service
        </Link>
        <Link href="/doctors/new" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-line text-ink rounded-xl text-sm font-medium hover:border-main/30 transition-colors">
          <Plus size={16} /> New Doctor
        </Link>
      </div>
    </div>
  );
}
