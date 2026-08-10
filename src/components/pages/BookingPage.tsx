"use client";

/**
 * /booking — online appointment page (TZ #10 §2).
 *
 * Thin shell around the wizard, plus a "prefer to call?" aside. Booking online
 * is the happy path, but a visitor who'd rather speak to someone should never
 * have to hunt for the number.
 */

import { useTranslations } from "next-intl";
import { Clock, Phone, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Locale } from "@/i18n/routing";

// Client-only: the wizard reads live availability and builds its calendar from
// the current time, so there's nothing useful to prerender and a server pass
// would only invite a hydration mismatch.
const AppointmentWizard = dynamic(() => import("@/components/booking/AppointmentWizard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[460px] rounded-[var(--radius-card)] bg-champagne-dark animate-pulse" />
  ),
});

interface Props {
  locale: Locale;
  ui: { title: string; subtitle: string; navLabel: string };
  phone: string;
  hours: string;
}

export default function BookingPage({ locale, ui, phone, hours }: Props) {
  const tLabels = useTranslations("labels");
  const tEeat = useTranslations("eeat");

  return (
    <>
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-8 lg:pb-12">
          <Breadcrumbs
            items={[
              { label: tLabels("home"), href: "/" },
              { label: ui.navLabel || ui.title, href: "/booking" },
            ]}
            locale={locale}
          />
          <h1 className="heading-1 text-black mt-6">{ui.title}</h1>
          {ui.subtitle && <p className="body-l text-muted mt-4 max-w-2xl">{ui.subtitle}</p>}
        </div>
      </section>

      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-14 items-start">
          <AppointmentWizard />

          <aside className="rounded-[var(--radius-card)] bg-champagne-dark p-6 flex flex-col gap-5 lg:sticky lg:top-28">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 text-main mt-1 shrink-0" aria-hidden="true" />
                <span className="block body-strong text-black group-hover:text-main transition-colors">
                  {phone}
                </span>
              </a>
            )}
            {hours && (
              <p className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-main mt-1 shrink-0" aria-hidden="true" />
                <span className="body-m text-muted">{hours}</span>
              </p>
            )}
            <p className="flex items-start gap-3 border-t border-black-10 pt-5">
              <ShieldCheck className="w-4 h-4 text-main mt-0.5 shrink-0" aria-hidden="true" />
              <span className="body-s text-muted">{tEeat("disclaimer")}</span>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
