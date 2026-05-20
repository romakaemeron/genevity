import { getSession } from "./admin/_actions/auth";
import { sql } from "@/lib/db/client";
import AdminSidebar from "./admin/_components/admin-sidebar";
import AdminHeader from "./admin/_components/admin-header";
import { UnsavedChangesProvider } from "./admin/_components/unsaved-changes";
import HideWidgets from "./admin/_components/hide-widgets";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AdminLocaleProvider } from "./admin/_i18n/context";
import { getAdminLocale } from "./admin/_i18n/server";

export const metadata = {
  title: "GENEVITY CMS",
  robots: "noindex, nofollow",
};

async function getCounts() {
  try {
    const rows = await sql`
      SELECT
        (SELECT count(*) FROM services) AS services,
        (SELECT count(*) FROM doctors) AS doctors,
        (SELECT count(*) FROM equipment) AS equipment,
        (SELECT count(*) FROM form_submissions WHERE status = 'new') AS forms,
        (SELECT count(*) FROM doctor_reviews WHERE is_published = false) AS reviews
    `;
    const r = rows[0];
    return {
      services: Number(r.services),
      doctors: Number(r.doctors),
      equipment: Number(r.equipment),
      forms: Number(r.forms),
      reviews: Number(r.reviews),
    };
  } catch {
    return { services: 0, doctors: 0, equipment: 0, forms: 0, reviews: 0 };
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Not authenticated — login page rendered without sidebar shell
  if (!session) {
    return (
      <div className="font-body" data-admin-root="true">
        <HideWidgets />
        {children}
      </div>
    );
  }

  const [counts, locale] = await Promise.all([getCounts(), getAdminLocale()]);

  return (
    <div className="font-body" data-admin-root="true">
      <HideWidgets />
      <AdminLocaleProvider initialLocale={locale}>
      <UnsavedChangesProvider>
        {/* Sidebar-04 pattern: floating sidebar + SidebarInset with shadow/rounded */}
        <SidebarProvider
          style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
          className="bg-muted/30"
        >
          <AdminSidebar userName={session.name} role={session.role} counts={counts} />
          <SidebarInset>
            <AdminHeader />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </UnsavedChangesProvider>
      </AdminLocaleProvider>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
