"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ServiceData } from "@/lib/db/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import KeyFactsBar from "@/components/ui/KeyFactsBar";
import TocStickyBar from "@/components/ui/TocStickyBar";
import SectionRenderer from "@/components/sections/SectionRenderer";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import Doctors from "@/components/home/Doctors";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import EquipmentModalContent from "@/components/equipment/EquipmentModal";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLdMedicalProcedure } from "@/components/seo/JsonLdMedicalProcedure";
import BookingCTA from "@/components/ui/BookingCTA";
import { absoluteUrl } from "@/lib/url";
import { useScrollReveal } from "@/lib/useReveal";

interface Props {
  data: ServiceData;
  locale: Locale;
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  equipmentUi?: { title: string; details: string; suitsTitle: string; resultsTitle: string };
}

/** Replace Unicode subscript digits U+2080–U+2089 with small non-overflowing spans */
const SUB_SPLIT = new RegExp("([₀-₉]+)");
const SUB_TEST  = new RegExp("^[₀-₉]+$");
function H({ text }: { text: string }) {
  const parts = text.split(SUB_SPLIT);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        SUB_TEST.test(part) ? (
          <span key={i} style={{ fontSize: "0.55em", verticalAlign: "-0.1em", lineHeight: 0 }}>
            {part.split("").map((c) => String.fromCharCode(c.charCodeAt(0) - 0x2080 + 0x30)).join("")}
          </span>
        ) : part
      )}
    </>
  );
}

export const SERVICE_FIXED_BLOCKS = ["faq", "doctors", "equipment", "relatedServices", "finalCTA"] as const;
export type ServiceFixedBlockKey = typeof SERVICE_FIXED_BLOCKS[number];
export type ServiceBlockKey = ServiceFixedBlockKey | `section:${string}`;

export default function ServiceDetailTemplate({ data, locale, doctorsUi, detailsLabel, equipmentUi }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openEquipmentId, setOpenEquipmentId] = useState<string | null>(null);
  const t = useTranslations("labels");
  const selectedEquipment = (data.relatedEquipment || []).find((e) => e._id === openEquipmentId) ?? null;

  const heading = (override: string | undefined, fallback: string) =>
    override && override.trim().length > 0 ? override : fallback;

  const sectionBlockKeys: ServiceBlockKey[] = (data.sections || []).map(
    (s) => `section:${s._key}` as ServiceBlockKey,
  );
  const defaultOrder: ServiceBlockKey[] = [...sectionBlockKeys, ...SERVICE_FIXED_BLOCKS];
  const saved = (data.blockOrder as ServiceBlockKey[] | null) || null;
  const isValidKey = (k: ServiceBlockKey) =>
    k.startsWith("section:") ? sectionBlockKeys.includes(k) : (SERVICE_FIXED_BLOCKS as readonly string[]).includes(k);
  const savedValid = saved ? saved.filter(isValidKey) : null;
  const resolvedOrder: ServiceBlockKey[] = savedValid && savedValid.length
    ? [...savedValid, ...defaultOrder.filter((k) => !savedValid.includes(k))]
    : defaultOrder;

  const tocItems = (data.sections || [])
    .filter((s) => "heading" in s && s.heading)
    .map((s) => ({ key: s._key, label: (s as { heading: string }).heading }));

  const breadcrumbs = [
    { label: t("home"), href: "/" },
    { label: t("services"), href: "/services" },
    { label: data.category.title, href: `/services/${data.category.slug}` },
    { label: data.title, href: `/services/${data.category.slug}/${data.slug}` },
  ];

  return (
    <>
      <JsonLdMedicalProcedure
        name={data.h1 || data.title}
        description={data.summary || ""}
        url={absoluteUrl(`/services/${data.category.slug}/${data.slug}`, locale)}
        priceFrom={data.priceFrom ?? undefined}
      />
      {data.faq?.length > 0 && (
        <FaqSchema items={data.faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}

      {/* Hero — no animation, content visible immediately for LCP */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-4">
        <Breadcrumbs items={breadcrumbs} locale={locale} noSchema />
        <div className="mt-8 mb-6">
          <h1 className="heading-1 text-black"><H text={data.h1 || data.title} /></h1>
          {data.summary && <p className="body-l text-muted mt-8 max-w-3xl">{data.summary}</p>}
        </div>
        <KeyFactsBar
          procedureLength={data.procedureLength}
          effectDuration={data.effectDuration}
          sessionsRecommended={data.sessionsRecommended}
          priceFrom={data.priceFrom}
          priceUnit={data.priceUnit}
          locale={locale}
        />
        <div className="mt-4 mb-10">
          <BookingCTA ctaKey="serviceDetailHero" variant="primary" size="lg" initialInterest={`service:${data.slug}`}>
            {t("book")}
          </BookingCTA>
        </div>
        <TocStickyBar items={tocItems} />
      </div>

      {resolvedOrder.map((blockKey) => {
        if (blockKey.startsWith("section:")) {
          const sectionId = blockKey.slice("section:".length);
          const section = (data.sections || []).find((s) => s._key === sectionId);
          if (!section) return null;

          const firstSectionKey = resolvedOrder.find((k) => k.startsWith("section:"));
          const isFirstSection = blockKey === firstSectionKey;

          const richHeroImage =
            section._type === "section.richText" && "heroImage" in section
              ? (section.heroImage as string | undefined)
              : undefined;

          if (section._type === "section.richText" && richHeroImage) {
            const callout = "calloutBody" in section ? (section.calloutBody as string | undefined) : undefined;
            return (
              <RevealBlock key={blockKey} id={`section-${section._key}`} className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-20">
                {section.heading && <h2 className="heading-2 text-black max-w-3xl mb-8 lg:mb-10"><H text={section.heading} /></h2>}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                  <div className="flex flex-col gap-6 justify-center lg:order-1 order-2">
                    {section.body && <p className="body-l text-black-80 leading-relaxed whitespace-pre-line">{section.body}</p>}
                    {callout && (
                      <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6">
                        <p className="body-m text-black-60 leading-relaxed whitespace-pre-line">{callout}</p>
                      </div>
                    )}
                  </div>
                  <div className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark lg:order-2 order-1">
                    <Image
                      src={richHeroImage}
                      alt={data.title}
                      title={data.title}
                      fill
                      priority={isFirstSection}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      style={"heroImageFocalPoint" in section && section.heroImageFocalPoint
                        ? { objectPosition: section.heroImageFocalPoint as string }
                        : undefined}
                    />
                  </div>
                </div>
              </RevealBlock>
            );
          }

          return (
            <RevealBlock key={blockKey} id={`section-${section._key}`} className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-20">
              <SectionRenderer sections={[section]} />
            </RevealBlock>
          );
        }

        switch (blockKey) {
          case "faq":
            return data.faq?.length > 0 ? (
              <FaqBlock key="faq" heading={heading(data.blockHeadings.faq, t("faq"))} items={data.faq} openIndex={openFaq} onToggle={(i) => setOpenFaq(openFaq === i ? null : i)} className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-20 lg:mt-24" />
            ) : null;

          case "doctors":
            return data.relatedDoctors?.length > 0 && doctorsUi ? (
              <div key="doctors" className="mt-20 lg:mt-24">
                <Doctors
                  doctors={data.relatedDoctors}
                  ui={{ ...doctorsUi, title: heading(data.blockHeadings.doctors, doctorsUi.title) }}
                  detailsLabel={detailsLabel || ""}
                />
                <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
                  <Link href="/doctors"><Button variant="outline" size="sm">{t("allDoctors")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
                </div>
              </div>
            ) : null;

          case "equipment":
            return data.relatedEquipment?.length > 0 ? (
              <div key="equipment" className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-20 lg:mt-24">
                <h2 className="heading-2 text-black mb-8">{heading(data.blockHeadings.equipment, equipmentUi?.title || t("equipment"))}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.relatedEquipment.map((item) => (
                    <EquipmentCard key={item._id} item={item} detailsLabel={equipmentUi?.details || detailsLabel || t("learnMore")} onClick={() => setOpenEquipmentId(item._id)} />
                  ))}
                </div>
                {selectedEquipment !== null && (
                  <Modal open onClose={() => setOpenEquipmentId(null)} maxWidth={selectedEquipment.photo ? "sm:max-w-3xl" : "sm:max-w-lg"}>
                    <EquipmentModalContent item={selectedEquipment} suitsTitle={equipmentUi?.suitsTitle || ""} resultsTitle={equipmentUi?.resultsTitle || ""} />
                  </Modal>
                )}
              </div>
            ) : null;

          case "relatedServices":
            return data.relatedServices?.length > 0 ? (
              <RevealBlock key="relatedServices" className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-20 lg:mt-24">
                <h2 className="heading-2 text-black mb-8">{heading(data.blockHeadings.relatedServices, t("alsoInteresting"))}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.relatedServices.map((svc) => (
                    <Link key={svc._id} href={`/services/${(svc as { categorySlug?: string }).categorySlug || data.category.slug}/${svc.slug}`} className="group flex flex-col h-full rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-all duration-300 p-6">
                      <h3 className="body-strong text-black group-hover:text-main transition-colors text-lg">{svc.title}</h3>
                      {svc.summary && <p className="body-m text-muted line-clamp-2 mt-2">{svc.summary}</p>}
                      {(svc as { priceFrom?: string }).priceFrom && <p className="body-strong text-main mt-3">{(svc as { priceFrom?: string }).priceFrom}</p>}
                      <div className="mt-auto pt-4"><Button variant="outline" size="sm">{t("learnMore")}<ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></Button></div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6"><Link href="/services"><Button variant="outline" size="sm">{t("viewAllProcedures")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link></div>
              </RevealBlock>
            ) : null;

          case "finalCTA": {
            const cta = data.finalCta;
            const hasCustomImage = cta.bgType === "image" && cta.bgImage;
            const cardStyle: React.CSSProperties = {};
            if (cta.bgType === "color" && cta.bgColor) cardStyle.backgroundColor = `var(--${cta.bgColor})`;
            return (
              <div key="finalCTA" className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
                <div className={`mt-20 lg:mt-24 rounded-[var(--radius-card)] px-4 py-6 sm:p-8 lg:p-12 text-center relative overflow-hidden ${hasCustomImage || cta.bgType === "color" ? "" : "bg-main"}`} style={cardStyle}>
                  {hasCustomImage && (<><Image src={cta.bgImage!} alt="" fill className="object-cover" sizes="100vw" style={cta.bgFocalPoint ? { objectPosition: cta.bgFocalPoint } : undefined} /><div className="absolute inset-0 bg-black/40" /></>)}
                  <div className="relative">
                    <h2 className="heading-2 text-champagne mb-4">{data.finalCta.heading || heading(data.blockHeadings.finalCTA, t("bookCta"))}</h2>
                    <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{data.finalCta.subtitle || t("ctaSubtitle")}</p>
                    <BookingCTA ctaKey="serviceDetailFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark max-w-full !whitespace-normal" initialInterest={`service:${data.slug}`}>{data.finalCta.buttonText || t("bookConsultation")}</BookingCTA>
                  </div>
                </div>
              </div>
            );
          }

          default: return null;
        }
      })}
    </>
  );
}

/** Scroll-reveal wrapper for below-fold blocks */
function RevealBlock({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} id={id} className={`${className || ""} ${visible ? "revealed" : ""}`}>
      <div className="reveal">{children}</div>
    </div>
  );
}

/** Reusable FAQ accordion — CSS transitions, no Framer Motion */
function FaqBlock({ heading, items, openIndex, onToggle, className }: {
  heading: string;
  items: { question: string; answer: string }[];
  openIndex: number | null;
  onToggle: (i: number) => void;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`${className || ""} ${visible ? "revealed" : ""}`}>
      <h2 className="reveal heading-2 text-black mb-8">{heading}</h2>
      <div className="reveal d1 border-t border-line">
        {items.map((item, i) => (
          <div key={i} className="border-b border-line">
            <button onClick={() => onToggle(i)} className="w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer group" aria-expanded={openIndex === i}>
              <span className="body-strong text-black group-hover:text-main transition-colors pr-4 text-lg">{item.question}</span>
              <span className={`faq-icon text-muted text-2xl leading-none shrink-0 ${openIndex === i ? "open" : ""}`}>+</span>
            </button>
            <div className={`accordion-body ${openIndex === i ? "open" : ""}`}>
              <div><p className="body-l text-muted pb-6 pr-8">{item.answer}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
