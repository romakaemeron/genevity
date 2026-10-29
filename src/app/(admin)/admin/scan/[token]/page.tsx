import type { Metadata } from "next";
import { getAdminStrings } from "../../_i18n/server";
import { loadScan } from "../_access";
import LogoutForm from "../_logout-form";

// Per-request, never cached: shows personal data and the live revoked state.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "GENEVITY", robots: { index: false, follow: false } };

export default async function ScanTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [view, strings] = await Promise.all([loadScan(token), getAdminStrings()]);
  const t = strings.scanPage;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-4 sm:p-6">
      {view.kind === "not-found" ? (
        <p className="my-auto text-center text-3xl font-semibold text-neutral-800">{t.notFound}</p>
      ) : (
        <div className="flex flex-1 flex-col gap-6">
          {view.kind === "revoked" ? (
            <div role="alert" className="w-full rounded-2xl bg-red-600 px-4 py-8 text-center text-4xl font-bold tracking-wide text-white">
              {t.statusRevoked}
            </div>
          ) : (
            <div className="w-full rounded-2xl bg-green-600 px-4 py-6 text-center text-3xl font-bold text-white">
              {t.statusActive}
            </div>
          )}
          <p className="break-words text-center text-4xl font-semibold leading-tight text-neutral-900">{view.name}</p>
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-neutral-500">{t.discount}</p>
            <p className="text-7xl font-bold text-neutral-900">{view.discountLabel}</p>
          </div>
          <p className="text-center text-lg text-neutral-600">
            {t.issued}: {view.issuedOn}
          </p>
        </div>
      )}
      <LogoutForm label={t.logout} />
    </main>
  );
}
