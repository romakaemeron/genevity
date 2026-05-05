"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { DoctorItem } from "@/lib/db/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import DoctorCard from "@/components/doctors/DoctorCard";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  doctors: DoctorItem[];
  locale: Locale;
  doctorsUi: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel: string;
}

const categories = [
  { key: "all", ids: [] as string[] },
  { key: "cosmetology", ids: ["doctor-0", "doctor-1"] },
  { key: "endocrinology", ids: ["doctor-2", "doctor-3"] },
  { key: "diagnostics", ids: ["doctor-4", "doctor-5"] },
  { key: "gynecology", ids: ["doctor-6"] },
  { key: "gastro", ids: ["doctor-8", "doctor-9"] },
  { key: "other", ids: ["doctor-7", "doctor-11"] },
];

export default function DoctorsPageComponent({ doctors, locale, doctorsUi, detailsLabel }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const tLabels = useTranslations("labels");
  const tDocPage = useTranslations("doctorsPage");

  const filteredDoctors = useMemo(() => {
    if (activeFilter === "all") return doctors;
    const cat = categories.find((c) => c.key === activeFilter);
    if (!cat) return doctors;
    return doctors.filter((d) => cat.ids.includes(d._id));
  }, [activeFilter, doctors]);

  return (
    <>
      {doctors.map((doc) => (
        <JsonLd key={doc._id} data={{
          "@context": "https://schema.org",
          "@type": "Physician",
          name: doc.name,
          jobTitle: doc.role,
          ...(doc.photoCard ? { image: doc.photoCard } : {}),
          worksFor: { "@type": "MedicalBusiness", name: "GENEVITY", url: "https://genevity.com.ua" },
        }} />
      ))}

      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-12 lg:pb-16">
          <Breadcrumbs
            items={[
              { label: tLabels("home"), href: "/" },
              { label: doctorsUi.title, href: "/doctors" },
            ]}
            locale={locale}
          />
          <h1 className="heading-1 text-black mt-6">{doctorsUi.title}</h1>
          <p className="body-l text-muted mt-4 max-w-2xl">{doctorsUi.subtitle}</p>
        </div>
      </section>

      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-20">
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={`px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
                activeFilter === cat.key
                  ? "bg-main text-champagne"
                  : "bg-champagne-dark text-black hover:bg-champagne-darker"
              }`}
            >
              {tDocPage(`filter_${cat.key}`)}
            </button>
          ))}
        </div>

        {/* key triggers remount → CSS grid-enter animation replays on filter change */}
        <div key={activeFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 grid-enter">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id}>
              <DoctorCard doctor={doctor} detailsLabel={detailsLabel} onClick={() => {}} />
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
          <BookingCTA ctaKey="doctorsFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">
            {tLabels("book")}
          </BookingCTA>
        </div>
      </div>
    </>
  );
}
