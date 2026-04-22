"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import {
  Award, Heart, Microscope, Users, Shield, Globe,
  ChevronRight,
} from "lucide-react";
import type { DoctorItem, AboutData } from "@/lib/db/types";
import type { GalleryItem } from "@/lib/db/queries/phase2";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import Doctors from "@/components/home/Doctors";
import StripeGallery from "@/components/ui/StripeGallery";

interface Props {
  about: AboutData;
  locale: Locale;
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  gallery?: GalleryItem[];
  /** Breadcrumb label — comes from `static_pages.about.title` so admin edits to the
   *  page Title field in /admin/pages/about flow straight into the breadcrumb. */
  breadcrumbLabel?: string;
}

const VALUE_KEYS = [
  { key: "value_evidence", icon: Microscope },
  { key: "value_personal", icon: Heart },
  { key: "value_tech", icon: Award },
  { key: "value_confidentiality", icon: Shield },
];

const STAT_KEYS = [
  { valueKey: "stat_experience_value", labelKey: "stat_experience" },
  { valueKey: "stat_doctors_value", labelKey: "stat_doctors" },
  { valueKey: "stat_equipment_value", labelKey: "stat_equipment" },
  { valueKey: "stat_patients_value", labelKey: "stat_patients" },
];

export default function AboutPageComponent({ about, locale, doctors, doctorsUi, detailsLabel, gallery = [], breadcrumbLabel }: Props) {
  const tLabels = useTranslations("labels");
  const tPage = useTranslations("aboutPage");

  return (
    <>
      {/* ===== HERO — split with clinic photo ===== */}
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            <motion.div
              className="flex-1 max-w-lg lg:py-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Breadcrumbs
                items={[
                  { label: tLabels("home"), href: "/" },
                  { label: breadcrumbLabel || tPage("heroTitle"), href: "/about" },
                ]}
                locale={locale}
              />
              <h1 className="heading-1 text-black mt-6">{about.title}</h1>
              <p className="heading-3 text-main mt-4">{about.text2}</p>
              <div className="mt-8">
                <BookingCTA variant="primary" size="lg">{tLabels("bookConsultation")}</BookingCTA>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 mt-8 lg:mt-0"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                <Image src="/clinic/semi1737-hdr.webp" alt="GENEVITY" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT TEXT — side by side with image ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="flex flex-col gap-6 justify-center">
              <p className="body-l text-black-80 leading-relaxed">{about.text1}</p>
              <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6">
                <p className="body-m text-black-60 leading-relaxed">{about.diagnostics}</p>
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden">
              <Image src="/clinic/semi1287-hdr.webp" alt={about.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="bg-champagne-dark rounded-[var(--radius-card)] px-8 lg:px-12 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STAT_KEYS.map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center lg:text-left">
              <p className="heading-2 text-black">{tPage(stat.valueKey)}</p>
              <p className="body-m text-muted mt-1">{tPage(stat.labelKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== VALUES GRID ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-4">
            {tPage("valuesTitle")}
          </motion.h2>
          <motion.p variants={fadeInUp} className="body-l text-muted mb-10 max-w-2xl">
            {tPage("philosophyText")}
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUE_KEYS.map((val, i) => (
              <motion.div key={i} variants={fadeInUp}
                className="flex flex-col gap-4 p-6 rounded-[var(--radius-card)] bg-champagne-dark">
                <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                  <val.icon className="w-5 h-5 text-main" />
                </div>
                <h3 className="body-strong text-black">{tPage(`${val.key}.title`)}</h3>
                <p className="body-m text-muted">{tPage(`${val.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== GALLERY ===== */}
      {gallery.length > 0 && (
        <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <StripeGallery
              title={tPage("galleryTitle")}
              items={gallery.map((g) => ({ src: g.imageUrl, alt: g.alt || g.label, label: g.label, sublabel: g.sublabel, description: g.description }))}
              height="420px"
            />
          </motion.div>
        </section>
      )}

      {/* ===== SERVICES LINKS ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <h2 className="heading-2 text-black mb-6">{tLabels("typesOfProcedures")}</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/services"><Button variant="outline" size="sm">{tLabels("services")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/laboratory"><Button variant="outline" size="sm">{tLabels("viewProcedures")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </motion.div>
      </section>

      {/* ===== DOCTORS ===== */}
      {doctors && doctors.length > 0 && doctorsUi && (
        <div className="mt-4">
          <Doctors doctors={doctors} ui={doctorsUi} detailsLabel={detailsLabel || ""} />
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
            <Link href="/doctors"><Button variant="outline" size="sm">{tLabels("allDoctors")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </div>
      )}

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="relative rounded-[var(--radius-card)] overflow-hidden min-h-[300px] flex items-center">
          <Image src="/clinic/acupulse.webp" alt="GENEVITY" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
            <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{tLabels("book")}</BookingCTA>
          </div>
        </motion.div>
      </div>
    </>
  );
}
