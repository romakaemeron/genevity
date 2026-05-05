"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/useReveal";
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

export default function LaboratoryPageComponent({
  data, locale, doctors, doctorsUi, detailsLabel, services, prepSteps, gallery = [],
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const faq = data.faq || [];
  const tLabels = useTranslations("labels");
  const tPage = useTranslations("laboratoryPage");
  const { ref: servicesRef, visible: servicesVisible } = useScrollReveal();
  const { ref: prepRef, visible: prepVisible } = useScrollReveal();
  const { ref: galleryRef, visible: galleryVisible } = useScrollReveal();
  const { ref: faqRef, visible: faqVisible } = useScrollReveal();

  const activeService = services[activeIdx];

  return (
    <>
      {faq.length > 0 && <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />}
      <JsonLd data={{ "@context": "https://schema.org", "@type": "MedicalClinic", name: "GENEVITY — Лабораторія", url: "https://genevity.com.ua/laboratory", parentOrganization: { "@type": "MedicalBusiness", name: "GENEVITY", url: "https://genevity.com.ua" }, address: { "@type": "PostalAddress", streetAddress: "вул. Олеся Гончара, 12", addressLocality: "Дніпро", addressCountry: "UA" }, telephone: "+380730000150", medicalSpecialty: "Diagnostic" }} />

      {/* Hero — above fold, no animation */}
      <section className="relative overflow-hidden bg-champagne">
        <div className="absolute inset-x-0 top-0 z-[10]">
          <MegaMenuHeader variant="solid" position="fixed" />
        </div>
        <div className="relative z-[5]">
          <div className="max-w-container mx-auto w-full px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10">
              <div className="flex-1 max-w-lg lg:py-8">
                <Breadcrumbs items={[{ label: tLabels("home"), href: "/" }, { label: data.title, href: "/laboratory" }]} locale={locale} />
                <h1 className="heading-1 text-black mt-6">{data.h1 || data.title}</h1>
                {data.summary && <p className="body-l text-muted mt-5">{data.summary}</p>}
                <div className="mt-8">
                  <BookingCTA ctaKey="laboratoryMid" variant="primary" size="lg">{tLabels("bookConsultation")}</BookingCTA>
                </div>
              </div>
              <div className="flex-1 mt-8 lg:mt-0">
                <div className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                  <Image src="/clinic/semi1256-hdr.webp" alt={data.title} title={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px" />
      </section>

      {/* Services — tabbed */}
      {services.length > 0 && activeService && (
        <section ref={servicesRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 ${servicesVisible ? "revealed" : ""}`}>
          <h2 className="reveal heading-2 text-black mb-4">{tPage("servicesTitle")}</h2>
          <p className="reveal d1 body-l text-muted mb-10 max-w-2xl">{tPage("introSubtitle")}</p>

          <div className="reveal d2 flex flex-wrap gap-2 mb-8">
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
          </div>

          {/* key triggers remount + grid-enter animation on tab change */}
          <div key={activeService.id} className="grid-enter rounded-[var(--radius-card)] bg-champagne-dark p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h3 className="heading-3 text-black mb-4">{activeService.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeService.items.map((item, i) => (
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
                <p className="heading-3 text-main">{activeService.price}</p>
                <div className="mt-4">
                  <BookingCTA ctaKey="laboratoryHero" variant="primary" size="sm">{tLabels("book")}</BookingCTA>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Preparation steps */}
      {prepSteps.length > 0 && (
        <section ref={prepRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-24 ${prepVisible ? "revealed" : ""}`}>
          <h2 className="reveal heading-2 text-black mb-10">{tPage("stepsTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {prepSteps.map((step, i) => {
              const Icon = ICONS[step.iconKey] || Clock;
              return (
                <div key={step.id} className="reveal flex flex-col gap-3 p-6 rounded-[var(--radius-card)] bg-champagne-dark" style={{ "--rd": `${i * 0.07}s` } as React.CSSProperties}>
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-main" />
                  </div>
                  <h3 className="body-strong text-black">{step.label}</h3>
                  <p className="body-m text-muted">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section ref={galleryRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 ${galleryVisible ? "revealed" : ""}`}>
          <div className="reveal">
            <StripeGallery
              title={tPage("galleryTitle")}
              subtitle={tPage("gallerySubtitle")}
              items={gallery.map((g) => ({ src: g.imageUrl, alt: g.alt || g.label, label: g.label, sublabel: g.sublabel, description: g.description }))}
              height="380px"
            />
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section ref={faqRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 ${faqVisible ? "revealed" : ""}`}>
          <h2 className="reveal heading-2 text-black mb-8">{tLabels("faq")}</h2>
          <div className="reveal d1 border-t border-line">
            {faq.map((item, i) => (
              <div key={i} className="border-b border-line">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer group">
                  <span className="body-strong text-black group-hover:text-main transition-colors pr-4 text-lg">{item.question}</span>
                  <span className={`faq-icon text-muted text-2xl leading-none shrink-0 ${openFaq === i ? "open" : ""}`}>+</span>
                </button>
                <div className={`accordion-body ${openFaq === i ? "open" : ""}`}>
                  <div><p className="body-l text-muted pb-6 pr-8">{item.answer}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Doctors */}
      {doctors && doctors.length > 0 && doctorsUi && (
        <div className="mt-4">
          <Doctors doctors={doctors} ui={doctorsUi} detailsLabel={detailsLabel || ""} />
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
            <Link href="/doctors"><Button variant="outline" size="sm">{tLabels("allDoctors")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </div>
      )}

      {/* Final CTA */}
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
