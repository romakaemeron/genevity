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

// Keyed by doctor slug: doctor `_id` is a database UUID, so the filters must
// not be built on ids that change between environments.
const categories = [
  { key: "all", slugs: [] as string[] },
  { key: "cosmetology", slugs: ["beliyanushkin-viktor", "sepkina-hanna", "polunina-veronika"] },
  { key: "endocrinology", slugs: ["poleshko-kateryna", "pastarush-larysa"] },
  { key: "diagnostics", slugs: ["fedorenko-svitlana"] },
  { key: "gynecology", slugs: ["kroshka-iryna", "yesayants-anna"] },
  { key: "gastro", slugs: ["minchuk-yevheniia", "tolstykova-tetiana"] },
  // Sverhun is an ENT surgeon as well, but there is no otolaryngology chip and
  // it is his rhino/oto/mentoplasty work that this filter is for.
  { key: "plastic_surgery", slugs: ["detsyk-dmytro", "harmash-serhii", "sverhun-valerii"] },
  { key: "other", slugs: ["kyrylenko-anzhela", "danylevsky-kostiantyn"] },
];

export default function DoctorsPageComponent({ doctors, locale, doctorsUi, detailsLabel }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const tLabels = useTranslations("labels");
  const tDocPage = useTranslations("doctorsPage");

  const filteredDoctors = useMemo(() => {
    if (activeFilter === "all") return doctors;
    const cat = categories.find((c) => c.key === activeFilter);
    if (!cat) return doctors;
    return doctors.filter((d) => d.slug && cat.slugs.includes(d.slug));
  }, [activeFilter, doctors]);

  // Only offer a filter that actually has published doctors behind it, so an
  // unpublished specialist can never leave the visitor on an empty grid.
  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (cat) => cat.key === "all" || doctors.some((d) => d.slug && cat.slugs.includes(d.slug)),
      ),
    [doctors],
  );

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
            noSchema
          />
          <h1 className="heading-1 text-black mt-6">{doctorsUi.title}</h1>
          <p className="body-l text-muted mt-4 max-w-2xl">{doctorsUi.subtitle}</p>
        </div>
      </section>

      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-20">
        <div className="flex flex-wrap gap-2 mb-10">
          {visibleCategories.map((cat) => (
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
          {filteredDoctors.map((doctor, i) => (
            <div key={doctor._id}>
              <DoctorCard doctor={doctor} detailsLabel={detailsLabel} experienceLabel={doctorsUi.experience} onClick={() => {}} priority={i === 0} />
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <div className="bg-main rounded-[var(--radius-card)] px-4 py-6 sm:p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
          <BookingCTA ctaKey="doctorsFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark max-w-full !whitespace-normal">
            {tLabels("book")}
          </BookingCTA>
        </div>
      </div>
    </>
  );
}
