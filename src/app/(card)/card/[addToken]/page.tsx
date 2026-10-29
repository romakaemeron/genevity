import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getCardByAddToken } from "@/lib/db/queries/loyalty";
import { isAppleConfigured } from "@/lib/loyalty/apple";
import { isGoogleConfigured } from "@/lib/loyalty/google";
import { cardPageView } from "@/lib/loyalty/card-page-view";

export const dynamic = "force-dynamic";

const LABEL = { apple: "Додати в Apple Wallet", google: "Додати в Google Wallet" } as const;

export default async function CardPage({ params }: { params: Promise<{ addToken: string }> }) {
  const { addToken } = await params;
  const card = await getCardByAddToken(addToken);
  if (!card) notFound();

  const ua = (await headers()).get("user-agent");
  // The Google button points at /api/loyalty/google/<addToken>, which mints the
  // signed save link on click; the page itself carries no JWT.
  const view = cardPageView(card, ua, { appleConfigured: isAppleConfigured(), googleConfigured: isGoogleConfigured() });

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-champagne px-4 py-10">
      <div className="w-full max-w-sm text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG brand mark; avoids metered image optimizer */}
        <img src="/brand/LogoFullDark.svg" alt="GENEVITY" width={162} height={36} className="mx-auto mb-2 h-9 w-auto" />
        {view.kind === "revoked" ? (
          <h1 className="mt-10 font-heading text-2xl text-main-darker">Картку скасовано</h1>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand art; avoids metered image optimizer */}
            <img
              src={view.imageSrc}
              alt="Картка GENEVITY Friends"
              width={1032}
              height={336}
              className="mt-8 w-full rounded-2xl shadow-[0_12px_32px_-12px_rgba(90,77,66,0.45)]"
            />
            <p className="mt-10 text-xs uppercase tracking-[0.2em] text-main-light">Власник картки</p>
            <h1 className="mt-2 break-words font-heading text-3xl text-main-darker">{view.name}</h1>
            <div className="mt-10 flex flex-col gap-3">
              {view.buttons.length === 0 ? (
                <p className="text-sm text-main-dark">Додавання тимчасово недоступне</p>
              ) : (
                view.buttons.map((b, i) => (
                  <a
                    key={b.kind}
                    href={b.href}
                    className={
                      i === 0
                        ? "rounded-xl bg-main-darker px-6 py-4 text-sm font-semibold text-champagne transition-colors hover:bg-main-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-darker"
                        : "rounded-xl border border-main-lighter px-6 py-4 text-sm font-semibold text-main-darker transition-colors hover:bg-champagne-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-darker"
                    }
                  >
                    {LABEL[b.kind]}
                  </a>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
