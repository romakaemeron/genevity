import type { Metadata } from "next";
import { getAdminStrings } from "../_i18n/server";
import { requireScanAccess } from "./_access";
import LogoutForm from "./_logout-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "GENEVITY", robots: { index: false, follow: false } };

export default async function ScanIndexPage() {
  await requireScanAccess("/admin/scan");
  const t = (await getAdminStrings()).scanPage;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 p-6 text-center">
      <p className="text-xl leading-snug text-neutral-800">{t.instruction}</p>
      <LogoutForm label={t.logout} />
    </main>
  );
}
