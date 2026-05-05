"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/useReveal";
import {
  ShieldCheck, Heart, Clock, Users, Bed, Stethoscope,
  Droplets, Activity, FlaskConical, ChevronRight,
} from "lucide-react";
import type { StaticPageData, DoctorItem } from "@/lib/db/types";
import type { GalleryItem } from "@/lib/db/queries/phase2";
import type { Locale } from "@/i18n/routing";
import dynamic from "next/dynamic";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLd } from "@/components/seo/JsonLd";

const Doctors = dynamic(() => import("@/components/home/Doctors"));
const StripeGallery = dynamic(() => import("@/components/ui/StripeGallery"));

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
  const { ref: comfortRef, visible: comfortVisible } = useScrollReveal();
  const { ref: servicesRef, visible: servicesVisible } = useScrollReveal();
  const { ref: galleryRef, visible: galleryVisible } = useScrollReveal();
  const { ref: indicationsRef, visible: indicationsVisible } = useScrollReveal();
  const { ref: stepsRef, visible: stepsVisible } = useScrollReveal();
  const { ref: pricingRef, visible: pricingVisible } = useScrollReveal();
  const { ref: faqRef, visible: faqVisible } = useScrollReveal();
  const { ref: ctaRef, visible: ctaVisible } = useScrollReveal();

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

      {/* Hero — above fold, no animation */}
      <section className="relative overflow-hidden bg-champagne">
        <div className="relative z-[5]">
          <div className="max-w-container mx-auto w-full px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
            <div className={`flex flex-col ${data.heroImage ? "lg:flex-row lg:items-center lg:gap-10" : ""}`}>
              <div className={data.heroImage ? "flex-1 max-w-lg lg:py-8" : "max-w-3xl"}>
                <Breadcrumbs items={[{ label: tLabels("home"), href: "/" }, { label: data.title, href: "/stationary" }]} locale={locale} />
                <h1 className="heading-1 text-black mt-6">{data.h1 || data.title}</h1>
                {data.summary && <p className="body-l text-muted mt-5">{data.summary}</p>}
                <div className="mt-8">
                  <BookingCTA ctaKey="stationaryHero" variant="primary" size="lg">
                    {tLabels("bookConsultation")}
                  </BookingCTA>
                </div>
              </div>
              {data.heroImage && (
                <div className="flex-1 mt-8 lg:mt-0">
                  <div className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                    <Image src={data.heroImage} alt={data.title} title={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px" />
      </section>

      {/* Comfort features */}
      <section ref={comfortRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 cv-auto ${comfortVisible ? "revealed" : ""}`}>
        <h2 className="reveal heading-2 text-black mb-4">{tPage("comfort.title")}</h2>
        <p className="reveal d1 body-l text-muted mb-10 max-w-2xl">{tPage("comfort.subtitle")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {comfortFeatures.map((feat, i) => (
            <div
              key={i}
              className={`reveal relative flex flex-col gap-4 p-6 rounded-[var(--radius-card)] overflow-hidden ${
                i === 0 ? "lg:col-span-2 lg:row-span-2" : "bg-champagne-dark"
              }`}
              style={{ "--rd": `${0.1 + i * 0.07}s` } as React.CSSProperties}
            >
              {i === 0 && (
                <>
                  <Image src="/clinic/semi1256-hdr.webp" alt={feat.label} title={feat.label} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                  <div className="absolute inset-0 bg-black/55" />
                </>
              )}
              <div className={`relative z-10 ${i === 0 ? "flex flex-col gap-4 h-full justify-end" : ""}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${i === 0 ? "bg-champagne/15" : "bg-main/10"}`}>
                  <feat.icon className={`w-6 h-6 ${i === 0 ? "text-champagne" : "text-main"}`} />
                </div>
                <h3 className={`${i === 0 ? "heading-3 text-champagne" : "body-strong text-black"}`}>{feat.label}</h3>
                <p className={`${i === 0 ? "body-l text-white-60" : "body-m text-muted"}`}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section ref={servicesRef as React.RefObject<HTMLElement>} className={`py-16 lg:py-24 cv-auto ${servicesVisible ? "revealed" : ""}`}>
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="reveal heading-2 text-black mb-10">{tPage("servicesTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => (
              <div key={i} className="reveal flex flex-col gap-3 p-6 rounded-[var(--radius-card)] bg-champagne-dark" style={{ "--rd": `${i * 0.07}s` } as React.CSSProperties}>
                <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                  <svc.icon className="w-5 h-5 text-main" />
                </div>
                <h3 className="body-strong text-black">{svc.label}</h3>
                <p className="body-m text-muted">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section ref={galleryRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-8 cv-auto ${galleryVisible ? "revealed" : ""}`}>
          <div className="reveal">
            <StripeGallery
              title={tPage("galleryTitle")}
              subtitle={tPage("gallerySubtitle")}
              items={gallery.map((g) => ({ src: g.imageUrl, alt: g.alt || g.label, label: g.label, sublabel: g.sublabel, description: g.description }))}
              height="420px"
            />
          </div>
        </section>
      )}

      {/* Indications */}
      <section ref={indicationsRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 ${indicationsVisible ? "revealed" : ""}`}>
        <h2 className="reveal heading-2 text-black mb-8">{tPage("indicationsTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {indications.map((item, i) => (
            <div key={i} className="reveal flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark" style={{ "--rd": `${i * 0.05}s` } as React.CSSProperties}>
              <div className="shrink-0 mt-0.5" style={{ width: 24, height: 24 }}>
                <div className="w-full h-full rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                </div>
              </div>
              <p className="body-l text-ink">{item}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/laboratory"><Button variant="outline" size="sm">{tPage("relatedLaboratory")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          <Link href="/services/longevity/iv-therapy"><Button variant="outline" size="sm">{tPage("relatedIv")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          <Link href="/services/plastic-surgery"><Button variant="outline" size="sm">{tPage("relatedPlastic")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
        </div>
      </section>

      {/* How it works — timeline */}
      <section ref={stepsRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 ${stepsVisible ? "revealed" : ""}`}>
        <h2 className="reveal heading-2 text-black mb-12">{tPage("stepsTitle")}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="reveal relative" style={{ "--rd": `${i * 0.1}s` } as React.CSSProperties}>
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
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 ${pricingVisible ? "revealed" : ""}`}>
        <div className="reveal bg-champagne-dark rounded-[var(--radius-card)] p-8 lg:p-12 flex flex-col gap-6">
          <div>
            <h2 className="heading-3 text-black mb-3">{tPage("pricingTitle")}</h2>
            <p className="body-l text-muted">{tPage("pricingBody")}</p>
          </div>
          <BookingCTA ctaKey="stationaryMid" variant="primary" size="lg" className="self-start shrink-0">
            {tLabels("bookConsultation")}
          </BookingCTA>
        </div>
      </section>

      {/* FAQ */}
      {faq.length > 0 && (
        <section ref={faqRef as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 ${faqVisible ? "revealed" : ""}`}>
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

      {/* Final CTA */}
      <div ref={ctaRef as React.RefObject<HTMLDivElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20 ${ctaVisible ? "revealed" : ""}`}>
        <div className="reveal relative rounded-[var(--radius-card)] overflow-hidden min-h-[300px] flex items-center">
          <Image src="/clinic/acupulse.webp" alt="GENEVITY" title="GENEVITY — денний стаціонар" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
            <BookingCTA ctaKey="stationaryFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{tLabels("book")}</BookingCTA>
          </div>
        </div>
      </div>
    </>
  );
}
