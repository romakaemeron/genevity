"use client";

/* ─────────────────────────────────────────────────────────────────────────
 * DORMANT — NOT ROUTED. Built for Inweb TZ #10 §2 (online appointment form),
 * then parked at the client's request pending a decision on how automated
 * booking should work. Nothing imports this: the /booking route was removed
 * and the nav link with it, so the site behaves exactly as before (the short
 * name/phone CTA form in BookingCTA/BookingForm is the live path).
 *
 * To re-enable: recreate src/app/[locale]/(pages)/booking/page.tsx rendering
 * BookingPage, re-add the `booking` entry to navConfig, and re-insert the
 * `booking` row in static_pages (see git history for all three).
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * /booking — the online appointment page (TZ #10 §2).
 *
 * Thin shell: hero + the wizard + a "prefer to call?" fallback, so a visitor
 * who doesn't want to work through six steps still has the phone number in
 * front of them.
 */

import { useTranslations } from "next-intl";
import { Clock, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Locale } from "@/i18n/routing";

// Client-only: the wizard derives its dates and slots from the current time,
// so pre-rendering it on the server would only invite a hydration mismatch.
// It's fully interactive and below the fold — nothing here needs to be indexed.
const AppointmentWizard = dynamic(() => import("@/components/booking/AppointmentWizard"), {
  ssr: false,
  loading: () => <div className="min-h-[420px] rounded-[var(--radius-card)] bg-champagne-dark animate-pulse" />,
});

interface Props {
  locale: Locale;
  ui: { title: string; subtitle: string; navLabel: string };
  phone: string;
  hours: string;
}

export default function BookingPage({ locale, ui, phone, hours }: Props) {
  const tLabels = useTranslations("labels");

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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14 items-start">
          <AppointmentWizard />

          <aside className="rounded-[var(--radius-card)] bg-champagne-dark p-6 flex flex-col gap-4 lg:sticky lg:top-28">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 text-main mt-1 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block body-strong text-black group-hover:text-main transition-colors">
                    {phone}
                  </span>
                </span>
              </a>
            )}
            {hours && (
              <p className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-main mt-1 shrink-0" aria-hidden="true" />
                <span className="body-m text-muted">{hours}</span>
              </p>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
