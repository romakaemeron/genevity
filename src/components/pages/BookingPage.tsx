"use client";

/**
 * /booking — the online appointment page (TZ #10 §2).
 *
 * The wizard owns the two-column layout because it owns the booking state that
 * the summary rail mirrors; this passes the clinic's contact card in as the
 * slot underneath it.
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

  const contactCard = (
    <div className="rounded-[var(--radius-card)] bg-champagne-dark p-5">
      <div className="flex flex-col gap-3.5">
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
      <div className="border-t border-black-10 mt-4 pt-4">
        <p className="body-s text-muted">{tBooking("asideNote")}</p>
      </div>
    </div>
  );

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
        <AppointmentWizard address={address} phone={phone} aside={contactCard} />
      </section>
    </>
  );
}
