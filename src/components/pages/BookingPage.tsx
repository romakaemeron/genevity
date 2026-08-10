"use client";

/**
 * /booking — the online appointment page (TZ #10 §2).
 *
 * Two columns on desktop: the flow, and a sticky aside with the clinic's
 * contact details. Built entirely from the site's own tokens and components —
 * the booking design contributed the layout and card composition, not a
 * separate palette or type scale.
 */

import { useTranslations } from "next-intl";
import { Clock, MapPin, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Locale } from "@/i18n/routing";

// Client-only: the flow reads live availability and builds its calendar from
// the current time, so there's nothing useful to prerender and a server pass
// would only invite a hydration mismatch.
const AppointmentWizard = dynamic(() => import("@/components/booking/AppointmentWizard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-[var(--radius-card)] bg-champagne-dark animate-pulse" />
  ),
});

interface Props {
  locale: Locale;
  ui: { title: string; subtitle: string; navLabel: string };
  phone: string;
  hours: string;
  address: string;
}

export default function BookingPage({ locale, ui, phone, hours, address }: Props) {
  const tLabels = useTranslations("labels");
  const tBooking = useTranslations("booking");

  return (
    <>
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-8 lg:pb-10">
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

      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14 items-start">
          <AppointmentWizard address={address} phone={phone} />

          <aside className="lg:sticky lg:top-28 rounded-[var(--radius-card)] bg-champagne-dark p-6 w-full">
            <div className="flex flex-col gap-4">
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex gap-3 items-center group">
                  <Phone className="w-4 h-4 text-main shrink-0" aria-hidden="true" />
                  <span className="body-strong text-black group-hover:text-main transition-colors">{phone}</span>
                </a>
              )}
              {hours && (
                <p className="flex gap-3 items-center">
                  <Clock className="w-4 h-4 text-main shrink-0" aria-hidden="true" />
                  <span className="body-m text-muted">{hours}</span>
                </p>
              )}
              {address && (
                <p className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-main shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="body-m text-muted">{address}</span>
                </p>
              )}
            </div>
            <div className="border-t border-black-10 mt-5 pt-5">
              <p className="body-s text-muted">{tBooking("asideNote")}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
