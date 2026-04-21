import { getSession } from "./_actions/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db/client";
import Sidebar from "./_components/sidebar";

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
        (SELECT count(*) FROM form_submissions WHERE status = 'new') AS forms
    `;
    const r = rows[0];
    return {
      services: Number(r.services),
      doctors: Number(r.doctors),
      equipment: Number(r.equipment),
      forms: Number(r.forms),
    };
  } catch {
    return { services: 0, doctors: 0, equipment: 0, forms: 0 };
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Not authenticated — render children without sidebar (login page)
  if (!session) {
    return <div className="min-h-screen bg-champagne">{children}</div>;
  }

  const counts = await getCounts();

  return (
    <div className="min-h-screen bg-champagne">
      <Sidebar userName={session.name} counts={counts} />
      <main className="ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
