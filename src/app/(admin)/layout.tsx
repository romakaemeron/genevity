import { getSession } from "./admin/_actions/auth";
import { sql } from "@/lib/db/client";
import Sidebar from "./admin/_components/sidebar";
import { UnsavedChangesProvider } from "./admin/_components/unsaved-changes";
import HideWidgets from "./admin/_components/hide-widgets";

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

  // Not authenticated — login page, no sidebar
  if (!session) {
    return (
      <div className="font-body">
        <HideWidgets />
        {children}
      </div>
    );
  }

  const counts = await getCounts();

  return (
    <div className="font-body min-h-screen bg-champagne">
      <HideWidgets />
      <UnsavedChangesProvider>
        <Sidebar userName={session.name} role={session.role} counts={counts} />
        <main className="ml-60 min-h-screen">
          {children}
        </main>
      </UnsavedChangesProvider>
    </div>
  );
}
