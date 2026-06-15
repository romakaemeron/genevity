"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useScrollReveal } from "@/lib/useReveal";
import { Award, Heart, Microscope, Shield, ChevronRight } from "lucide-react";
import type { DoctorItem, AboutData } from "@/lib/db/types";
import type { GalleryItem } from "@/lib/db/queries/phase2";
import type { Locale } from "@/i18n/routing";
import dynamic from "next/dynamic";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import PhotoSlideshow from "@/components/ui/PhotoSlideshow";

const Doctors = dynamic(() => import("@/components/home/Doctors"));
const StripeGallery = dynamic(() => import("@/components/ui/StripeGallery"));

interface Props {
  about: AboutData;
  locale: Locale;
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  gallery?: GalleryItem[];
  breadcrumbLabel?: string;
  heroImage?: string | null;
  ctaBg?: GalleryItem | null;
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

export default function AboutPageComponent({ about, locale, doctors, doctorsUi, detailsLabel, gallery = [], breadcrumbLabel, heroImage, ctaBg }: Props) {
  const tLabels = useTranslations("labels");
  const tPage = useTranslations("aboutPage");
  const { ref: textRef, visible: textVisible } = useScrollReveal();
  const { ref: statsRef, visible: statsVisible } = useScrollReveal();
  const { ref: valuesRef, visible: valuesVisible } = useScrollReveal();
  const { ref: ctaRef, visible: ctaVisible } = useScrollReveal();

  return (
    <>
      {/* Hero — above fold, no animation */}
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            <div className="flex-1 max-w-lg lg:py-8">
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
                <BookingCTA ctaKey="aboutHero" variant="primary" size="lg">{tLabels("bookConsultation")}</BookingCTA>
              </div>
            </div>

            <div className="flex-1 mt-8 lg:mt-0">
              <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                {gallery.filter((g) => g.imageUrl).length > 0 ? (
                  <PhotoSlideshow
                    items={gallery.filter((g) => g.imageUrl).map((g) => ({ src: g.imageUrl, alt: g.alt, title: g.title || g.alt }))}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    withLightbox
                  />
                ) : (
                  <Image src="/clinic/semi1737-hdr.webp" alt="GENEVITY — центр довголіття та естетичної медицини" title="GENEVITY — центр довголіття та естетичної медицини" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About text — scroll reveal */}
      <section ref={textRef as React.RefObject<HTMLElement>} className={`cv-auto max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 ${textVisible ? "revealed" : ""}`}>
        <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="flex flex-col gap-6 justify-center">
            <p className="body-l text-black-80 leading-relaxed">{about.text1}</p>
            <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6">
              <p className="body-m text-black-60 leading-relaxed">{about.diagnostics}</p>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden">
            <Image src={heroImage || "/clinic/semi1287-hdr.webp"} alt={about.title} title={about.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section ref={statsRef as React.RefObject<HTMLElement>} className={`cv-auto max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16 ${statsVisible ? "revealed" : ""}`}>
        <div className="bg-champagne-dark rounded-[var(--radius-card)] px-8 lg:px-12 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STAT_KEYS.map((stat, i) => (
            <div key={i} className="reveal text-center lg:text-left" style={{ "--rd": `${i * 0.08}s` } as React.CSSProperties}>
              <p className="heading-2 text-black">{tPage(stat.valueKey)}</p>
              <p className="body-m text-muted mt-1">{tPage(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values grid */}
      <section ref={valuesRef as React.RefObject<HTMLElement>} className={`cv-auto max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 ${valuesVisible ? "revealed" : ""}`}>
        <h2 className="reveal heading-2 text-black mb-4">{tPage("valuesTitle")}</h2>
        <p className="reveal d1 body-l text-muted mb-10 max-w-2xl">{tPage("philosophyText")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUE_KEYS.map((val, i) => (
            <div key={i} className="reveal flex flex-col gap-4 p-6 rounded-[var(--radius-card)] bg-champagne-dark" style={{ "--rd": `${0.15 + i * 0.07}s` } as React.CSSProperties}>
              <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center">
                <val.icon className="w-5 h-5 text-main" />
              </div>
              <h3 className="body-strong text-black">{tPage(`${val.key}.title`)}</h3>
              <p className="body-m text-muted">{tPage(`${val.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="cv-auto max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <StripeGallery
            title={tPage("galleryTitle")}
            items={gallery.map((g) => ({ src: g.imageUrl, alt: g.alt || g.label, title: g.title || g.alt || g.label, label: g.label, sublabel: g.sublabel, description: g.description }))}
            height="420px"
          />
        </section>
      )}

      {/* Services links */}
      <section className="cv-auto max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <h2 className="heading-2 text-black mb-6">{tLabels("typesOfProcedures")}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/services"><Button variant="outline" size="sm">{tLabels("services")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          <Link href="/laboratory"><Button variant="outline" size="sm">{tLabels("viewProcedures")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
        </div>
      </section>

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
      <div ref={ctaRef as React.RefObject<HTMLDivElement>} className={`cv-auto max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20 ${ctaVisible ? "revealed" : ""}`}>
        <div className="reveal relative rounded-[var(--radius-card)] overflow-hidden min-h-[300px] flex items-center">
          <Image src={ctaBg?.imageUrl || "/clinic/acupulse.webp"} alt={ctaBg?.alt || "GENEVITY — апаратна косметологія"} title={ctaBg?.title || "GENEVITY — апаратна косметологія"} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center px-4 py-8 sm:p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
            <BookingCTA ctaKey="aboutFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark max-w-full !whitespace-normal">{tLabels("book")}</BookingCTA>
          </div>
        </div>
      </div>

      {/* Requisites */}
      {about.requisites && (
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <div className="border-t border-black-10 pt-10">
            <pre className="body-s text-black-40 whitespace-pre-wrap font-sans leading-relaxed">
              {about.requisites}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
