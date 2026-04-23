"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import {
  ShieldCheck, Heart, Clock, Users, Bed, Stethoscope,
  Droplets, Activity, FlaskConical, ChevronRight,
} from "lucide-react";
import type { StaticPageData, DoctorItem } from "@/lib/db/types";
import type { GalleryItem } from "@/lib/db/queries/phase2";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import Doctors from "@/components/home/Doctors";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import StripeGallery from "@/components/ui/StripeGallery";

interface Props {
  data: StaticPageData;
  locale: Locale;
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  gallery?: GalleryItem[];
}


const COMFORT_KEYS = ["rooms", "monitoring", "care", "privacy", "noqueue"] as const;
const COMFORT_ICONS: Record<string, typeof Bed> = { rooms: Bed, monitoring: ShieldCheck, care: Users, privacy: Heart, noqueue: Clock };

const SERVICE_KEYS = ["iv", "consultations", "checkup", "pressotherapy"] as const;
const SERVICE_ICONS: Record<string, typeof Bed> = { iv: Droplets, consultations: Stethoscope, checkup: FlaskConical, pressotherapy: Activity };

const INDICATION_KEYS = ["indication_1", "indication_2", "indication_3", "indication_4", "indication_5", "indication_6"] as const;
const STEP_KEYS = ["step_1", "step_2", "step_3"] as const;

export default function StationaryPageComponent({ data, locale, doctors, doctorsUi, detailsLabel, gallery = [] }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tPage = useTranslations("stationaryPage");
  const tLabels = useTranslations("labels");
  const faq = data.faq || [];

  const comfortFeatures = COMFORT_KEYS.map((k) => ({
    icon: COMFORT_ICONS[k],
    label: tPage(`feature_${k}.label`),
    desc: tPage(`feature_${k}.desc`),
  }));
  const services = SERVICE_KEYS.map((k) => ({
    icon: SERVICE_ICONS[k],
    label: tPage(`service_${k}.label`),
    desc: tPage(`service_${k}.desc`),
  }));
  const indications = INDICATION_KEYS.map((k) => tPage(k));
  const steps = STEP_KEYS.map((k) => ({
    num: tPage(`${k}.num`),
    label: tPage(`${k}.label`),
    desc: tPage(`${k}.desc`),
  }));

  return (
    <>
      {faq.length > 0 && <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />}
      <JsonLd data={{ "@context": "https://schema.org", "@type": "MedicalClinic", name: "GENEVITY — Денний стаціонар", url: "https://genevity.com.ua/stationary", parentOrganization: { "@type": "MedicalBusiness", name: "GENEVITY", url: "https://genevity.com.ua" }, address: { "@type": "PostalAddress", streetAddress: "вул. Олеся Гончара, 12", addressLocality: "Дніпро", addressCountry: "UA" }, telephone: "+380730000150" }} />

      {/* ===== HERO — dark, immersive ===== */}
      <section className="relative overflow-hidden bg-ink min-h-[70vh] lg:min-h-[75vh] flex items-center">
        <motion.div className="absolute inset-0" variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 1.4 }}>
          <Image src="/clinic/semi1287-hdr.webp" alt={data.title} fill className="object-cover" sizes="100vw" priority />
        </motion.div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,37,32,0.9) 0%, rgba(42,37,32,0.5) 40%, rgba(42,37,32,0.3) 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-32 z-[3]" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 top-0 z-[10]">
          <MegaMenuHeader variant="transparent" position="absolute" />
        </div>

        <div className="relative z-[5] w-full max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-14 lg:pb-20 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <Breadcrumbs items={[{ label: tLabels("home"), href: "/" }, { label: data.title, href: "/stationary" }]} locale={locale} variant="light" />
            <h1 className="heading-1 text-champagne mt-6 max-w-2xl">{data.h1 || data.title}</h1>
            {data.summary && <p className="body-l text-white-60 mt-5 max-w-xl">{data.summary}</p>}
            <div className="mt-8">
              <BookingCTA ctaKey="stationaryHero" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">
                {tLabels("bookConsultation")}
              </BookingCTA>
            </div>
          </motion.div>
        </div>
        <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px" />
      </section>

      {/* ===== COMFORT FEATURES — bento grid ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-4">
            {tPage("comfort.title")}
          </motion.h2>
          <motion.p variants={fadeInUp} className="body-l text-muted mb-10 max-w-2xl">
            {tPage("comfort.subtitle")}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {comfortFeatures.map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className={`relative flex flex-col gap-4 p-6 rounded-[var(--radius-card)] overflow-hidden ${
                  i === 0 ? "lg:col-span-2 lg:row-span-2" : "bg-champagne-dark"
                }`}
              >
                {i === 0 && (
                  <>
                    <Image src="/clinic/semi1256-hdr.webp" alt={feat.label} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-black/55" />
                  </>
                )}
                <div className={`relative z-10 ${i === 0 ? "flex flex-col gap-4 h-full justify-end" : ""}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    i === 0 ? "bg-champagne/15" : "bg-main/10"
                  }`}>
                    <feat.icon className={`w-6 h-6 ${i === 0 ? "text-champagne" : "text-main"}`} />
                  </div>
                  <h3 className={`${i === 0 ? "heading-3 text-champagne" : "body-strong text-black"}`}>
                    {feat.label}
                  </h3>
                  <p className={`${i === 0 ? "body-l text-white-60" : "body-m text-muted"}`}>
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== SERVICES — icon cards ===== */}
      <section className="py-16 lg:py-24">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-10">
              {tPage("servicesTitle")}
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex flex-col gap-3 p-6 rounded-[var(--radius-card)] bg-champagne-dark"
                >
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                    <svc.icon className="w-5 h-5 text-main" />
                  </div>
                  <h3 className="body-strong text-black">{svc.label}</h3>
                  <p className="body-m text-muted">{svc.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CLINIC PHOTOS — interactive stripe gallery ===== */}
      {gallery.length > 0 && (
        <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}>
            <StripeGallery
              title={tPage("galleryTitle")}
              subtitle={tPage("gallerySubtitle")}
              items={gallery.map((g) => ({ src: g.imageUrl, alt: g.alt || g.label, label: g.label, sublabel: g.sublabel, description: g.description }))}
              height="420px"
            />
          </motion.div>
        </section>
      )}

      {/* ===== INDICATIONS ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-8">
            {tPage("indicationsTitle")}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {indications.map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark">
                <div className="shrink-0 mt-0.5" style={{ width: 24, height: 24 }}>
                  <div className="w-full h-full rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  </div>
                </div>
                <p className="body-l text-ink">{item}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mt-8">
            <Link href="/laboratory"><Button variant="outline" size="sm">{tPage("relatedLaboratory")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/services/longevity/iv-therapy"><Button variant="outline" size="sm">{tPage("relatedIv")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Link href="/services/plastic-surgery"><Button variant="outline" size="sm">{tPage("relatedPlastic")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS — visual timeline ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportConfig}>
          <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-12">
            {tPage("stepsTitle")}
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative">
                <span className="heading-1 text-main/10 select-none">{step.num}</span>
                <div className="pt-4">
                  <h3 className="heading-3 text-black mb-3">{step.label}</h3>
                  <p className="body-l text-muted">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-6 w-12 text-main/30">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== PRICING — clean card ===== */}
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="bg-champagne-dark rounded-[var(--radius-card)] p-8 lg:p-12 flex flex-col gap-6"
        >
          <div>
            <h2 className="heading-3 text-black mb-3">{tPage("pricingTitle")}</h2>
            <p className="body-l text-muted">{tPage("pricingBody")}</p>
          </div>
          <BookingCTA ctaKey="stationaryMid" variant="primary" size="lg" className="self-start shrink-0">
            {tLabels("bookConsultation")}
          </BookingCTA>
        </motion.div>
      </section>

      {/* ===== FAQ ===== */}
      {faq.length > 0 && (
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
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

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="relative rounded-[var(--radius-card)] overflow-hidden min-h-[300px] flex items-center">
          <Image src="/clinic/acupulse.webp" alt="GENEVITY" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
            <BookingCTA ctaKey="stationaryFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{tLabels("book")}</BookingCTA>
          </div>
        </motion.div>
      </div>
    </>
  );
}
