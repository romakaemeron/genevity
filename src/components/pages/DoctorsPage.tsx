"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import type { DoctorItem } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import DoctorCard from "@/components/doctors/DoctorCard";
import DoctorModalContent from "@/components/doctors/DoctorModal";
import Modal from "@/components/ui/Modal";
import { ui } from "@/lib/ui-strings";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  doctors: DoctorItem[];
  locale: Locale;
  doctorsUi: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel: string;
}

const L = (ua: string, ru: string, en: string) => ({ ua, ru, en });
const t = (obj: { ua: string; ru: string; en: string }, locale: string) =>
  obj[locale as "ua" | "ru" | "en"] || obj.ua;

const categories = [
  { key: "all", label: L("Всі", "Все", "All"), ids: [] as string[] },
  { key: "cosmetology", label: L("Косметологія", "Косметология", "Cosmetology"), ids: ["doctor-0", "doctor-1"] },
  { key: "endocrinology", label: L("Ендокринологія", "Эндокринология", "Endocrinology"), ids: ["doctor-2", "doctor-3"] },
  { key: "diagnostics", label: L("Діагностика", "Диагностика", "Diagnostics"), ids: ["doctor-4", "doctor-5"] },
  { key: "gynecology", label: L("Гінекологія", "Гинекология", "Gynecology"), ids: ["doctor-6"] },
  { key: "gastro", label: L("Гастроентерологія", "Гастроэнтерология", "Gastroenterology"), ids: ["doctor-8", "doctor-9"] },
  { key: "other", label: L("Інші спеціалісти", "Другие специалисты", "Other Specialists"), ids: ["doctor-7", "doctor-11"] },
];

export default function DoctorsPageComponent({ doctors, locale, doctorsUi, detailsLabel }: Props) {
  const [expandedDoctor, setExpandedDoctor] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const closeModal = useCallback(() => setExpandedDoctor(null), []);

  const filteredDoctors = useMemo(() => {
    if (activeFilter === "all") return doctors;
    const cat = categories.find((c) => c.key === activeFilter);
    if (!cat) return doctors;
    return doctors.filter((d) => cat.ids.includes(d._id));
  }, [activeFilter, doctors]);

  return (
    <>
      {/* Physician schema for each doctor */}
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

      {/* Hero */}
      <section className="bg-champagne">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-12 lg:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Breadcrumbs
              items={[
                { label: ui("home", locale), href: "/" },
                { label: doctorsUi.title, href: "/doctors" },
              ]}
              locale={locale}
            />
            <h1 className="heading-1 text-black mt-6">{doctorsUi.title}</h1>
            <p className="body-l text-muted mt-4 max-w-2xl">{doctorsUi.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-16 lg:pb-20">
        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap gap-2 mb-10"
        >
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
              {t(cat.label, locale)}
            </button>
          ))}
        </motion.div>

        {/* Doctor cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id}>
                <DoctorCard
                  doctor={doctor}
                  detailsLabel={detailsLabel}
                  onClick={() => setExpandedDoctor(doctors.indexOf(doctor))}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* CTA */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-20">
        <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{ui("ctaSubtitle", locale)}</p>
          <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">
            {ui("book", locale)}
          </BookingCTA>
        </div>
      </div>

      {/* Doctor Modal */}
      <AnimatePresence>
        {expandedDoctor !== null && (
          <Modal open onClose={closeModal}>
            <DoctorModalContent
              doctor={doctors[expandedDoctor]}
              cta={doctorsUi.cta}
              experience={doctorsUi.experience}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
