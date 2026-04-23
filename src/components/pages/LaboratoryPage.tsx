"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import {
  Scan, TestTube, HeartPulse, Brain, Baby, Stethoscope, Heart,
  Clock, CheckCircle, FileText, ChevronRight, Activity, FlaskConical,
} from "lucide-react";
import type { StaticPageData, DoctorItem } from "@/lib/db/types";
import type { LabService, LabPrepStep, GalleryItem } from "@/lib/db/queries/phase2";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import Doctors from "@/components/home/Doctors";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import StripeGallery from "@/components/ui/StripeGallery";

/** Map icon_key string → lucide component. Unknowns fall back to Scan. */
const ICONS: Record<string, typeof Scan> = {
  Scan, TestTube, HeartPulse, Brain, Baby, Stethoscope, Heart,
  Clock, CheckCircle, FileText, Activity, FlaskConical,
};

interface Props {
  data: StaticPageData;
  locale: Locale;
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  services: LabService[];
  prepSteps: LabPrepStep[];
  gallery?: GalleryItem[];
}

/* ── Smooth-height tab panel ── */
function TabContent({ service }: { service: LabService }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [measuredH, setMeasuredH] = useState<number | undefined>(undefined);
  const tLabels = useTranslations("labels");

  useEffect(() => {
    if (contentRef.current) setMeasuredH(contentRef.current.scrollHeight);
  }, [service.id]);

  return (
    <motion.div
      animate={{ height: measuredH ?? "auto" }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="overflow-hidden rounded-[var(--radius-card)]"
    >
      <div ref={contentRef} className="bg-champagne-dark p-6 lg:p-8">
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h3 className="heading-3 text-black mb-4">{service.label}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <div className="shrink-0" style={{ width: 20, height: 20 }}>
                      <div className="w-full h-full rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-success" />
                      </div>
                    </div>
                    <span className="body-m text-ink">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:text-right shrink-0">
              <p className="body-s text-muted">{tLabels("price")}</p>
              <p className="heading-3 text-main">{service.price}</p>
              <div className="mt-4">
                <BookingCTA ctaKey="laboratoryHero" variant="primary" size="sm">{tLabels("book")}</BookingCTA>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function LaboratoryPageComponent({
  data, locale, doctors, doctorsUi, detailsLabel, services, prepSteps, gallery = [],
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const faq = data.faq || [];
  const tLabels = useTranslations("labels");
  const tPage = useTranslations("laboratoryPage");

  const activeService = services[activeIdx];

  return (
    <>
      {faq.length > 0 && <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />}
      <JsonLd data={{ "@context": "https://schema.org", "@type": "MedicalClinic", name: "GENEVITY — Лабораторія", url: "https://genevity.com.ua/laboratory", parentOrganization: { "@type": "MedicalBusiness", name: "GENEVITY", url: "https://genevity.com.ua" }, address: { "@type": "PostalAddress", streetAddress: "вул. Олеся Гончара, 12", addressLocality: "Дніпро", addressCountry: "UA" }, telephone: "+380730000150", medicalSpecialty: "Diagnostic" }} />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-champagne">
        <div className="absolute inset-x-0 top-0 z-[10]">
          <MegaMenuHeader variant="solid" position="fixed" />
        </div>
        <div className="relative z-[5]">
          <div className="max-w-container mx-auto w-full px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10">
              <motion.div className="flex-1 max-w-lg lg:py-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
                <Breadcrumbs items={[{ label: tLabels("home"), href: "/" }, { label: data.title, href: "/laboratory" }]} locale={locale} />
                <h1 className="heading-1 text-black mt-6">{data.h1 || data.title}</h1>
                {data.summary && <p className="body-l text-muted mt-5">{data.summary}</p>}
                <div className="mt-8">
                  <BookingCTA ctaKey="laboratoryMid" variant="primary" size="lg">{tLabels("bookConsultation")}</BookingCTA>
                </div>
              </motion.div>
              <motion.div className="flex-1 mt-8 lg:mt-0" variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 1, delay: 0.5 }}>
                <div className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                  <Image src="/clinic/semi1256-hdr.webp" alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px" />
      </section>

      {/* ===== SERVICES — tabbed categories ===== */}
      {services.length > 0 && activeService && (
        <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-4">{tPage("servicesTitle")}</motion.h2>
            <motion.p variants={fadeInUp} className="body-l text-muted mb-10 max-w-2xl">{tPage("introSubtitle")}</motion.p>
          </motion.div>

          {/* Category tabs */}
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-8">
            {services.map((svc, i) => {
              const Icon = ICONS[svc.iconKey] || Scan;
              return (
                <button
                  key={svc.id}
                  onClick={() => setActiveIdx(i)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
                    activeIdx === i ? "bg-main text-champagne" : "bg-champagne-dark text-black hover:bg-champagne-darker"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {svc.label}
                </button>
              );
            })}
          </motion.div>

          <TabContent service={activeService} />
        </section>
      )}

      {/* ===== PREPARATION ===== */}
      {prepSteps.length > 0 && (
        <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-24">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-10">{tPage("stepsTitle")}</motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {prepSteps.map((step) => {
                const Icon = ICONS[step.iconKey] || Clock;
                return (
                  <motion.div key={step.id} variants={fadeInUp} className="flex flex-col gap-3 p-6 rounded-[var(--radius-card)] bg-champagne-dark">
                    <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-main" />
                    </div>
                    <h3 className="body-strong text-black">{step.label}</h3>
                    <p className="body-m text-muted">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* ===== GALLERY ===== */}
      {gallery.length > 0 && (
        <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <StripeGallery
              title={tPage("galleryTitle")}
              subtitle={tPage("gallerySubtitle")}
              items={gallery.map((g) => ({ src: g.imageUrl, alt: g.alt || g.label, label: g.label, sublabel: g.sublabel, description: g.description }))}
              height="380px"
            />
          </motion.div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      {faq.length > 0 && (
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16">
          <h2 className="heading-2 text-black mb-8">{tLabels("faq")}</h2>
          <div className="border-t border-line">
            {faq.map((item, i) => (
              <div key={i} className="border-b border-line">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer group">
                  <span className="body-strong text-black group-hover:text-main transition-colors pr-4 text-lg">{item.question}</span>
                  <motion.span className="text-muted text-2xl leading-none shrink-0" animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}>+</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="body-l text-muted pb-6 pr-8">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>
      )}

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
        <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
          <BookingCTA ctaKey="laboratoryFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{tLabels("book")}</BookingCTA>
        </div>
      </div>
    </>
  );
}
