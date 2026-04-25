import { Mulish, Tenor_Sans } from "next/font/google";
import { getSession } from "./admin/_actions/auth";
import { sql } from "@/lib/db/client";
import Sidebar from "./admin/_components/sidebar";
import { UnsavedChangesProvider } from "./admin/_components/unsaved-changes";
import "@/app/globals.css";

const mulish = Mulish({ subsets: ["cyrillic", "latin"], variable: "--font-body", display: "swap" });
const tenor = Tenor_Sans({ weight: "400", subsets: ["cyrillic", "latin"], variable: "--font-heading", display: "swap" });

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

  // Not authenticated — login page, no sidebar
  if (!session) {
    return (
      <html lang="uk">
        <body className={`${mulish.variable} ${tenor.variable} font-body`}>
          {children}
        </body>
      </html>
    );
  }

  const counts = await getCounts();

  return (
    <html lang="uk">
      <body className={`${mulish.variable} ${tenor.variable} font-body min-h-screen bg-champagne`}>
        <UnsavedChangesProvider>
          <Sidebar userName={session.name} role={session.role} counts={counts} />
          <main className="ml-60 min-h-screen">
            {children}
          </main>
        </UnsavedChangesProvider>
      </body>
    </html>
  );
}
