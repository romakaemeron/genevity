"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ServiceData } from "@/lib/db/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import KeyFactsBar from "@/components/ui/KeyFactsBar";
import TocStickyBar from "@/components/ui/TocStickyBar";
import SectionRenderer from "@/components/sections/SectionRenderer";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUp, fadeIn, viewportConfig } from "@/lib/motion";
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

interface Props {
  data: ServiceData;
  locale: Locale;
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  /** Shared Equipment block labels (suitsTitle / resultsTitle) used by the modal. */
  equipmentUi?: {
    title: string;
    details: string;
    suitsTitle: string;
    resultsTitle: string;
  };
}

/** Fixed (non-section) block keys that can be reordered on service detail pages. */
export const SERVICE_FIXED_BLOCKS = ["faq", "doctors", "equipment", "relatedServices", "finalCTA"] as const;
export type ServiceFixedBlockKey = typeof SERVICE_FIXED_BLOCKS[number];
/** Block keys in the array are either a fixed key above OR `section:<id>` — each
 *  individual content section becomes its own reorderable block so the admin can
 *  freely interleave sections with FAQ, doctors, equipment, etc. */
export type ServiceBlockKey = ServiceFixedBlockKey | `section:${string}`;

export default function ServiceDetailTemplate({ data, locale, doctorsUi, detailsLabel, equipmentUi }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openEquipmentId, setOpenEquipmentId] = useState<string | null>(null);
  const t = useTranslations("labels");
  const selectedEquipment = (data.relatedEquipment || []).find((e) => e._id === openEquipmentId) ?? null;

  // Per-service heading with global ui_strings fallback. `override` wins when
  // it's a non-empty string — that's what the admin typed into the block
  // overrides editor on the Layout tab.
  const heading = (override: string | undefined, fallback: string) =>
    override && override.trim().length > 0 ? override : fallback;

  // Every block the page CAN render right now — one per individual section
  // plus the fixed blocks. Used as the default order when no admin layout is set.
  const sectionBlockKeys: ServiceBlockKey[] = (data.sections || []).map(
    (s) => `section:${s._key}` as ServiceBlockKey,
  );
  const defaultOrder: ServiceBlockKey[] = [...sectionBlockKeys, ...SERVICE_FIXED_BLOCKS];

  // Validate the admin-configured order: drop unknown keys, then append any
  // blocks that exist but aren't in the saved list (new sections added later,
  // new fixed block types added by code).
  const saved = (data.blockOrder as ServiceBlockKey[] | null) || null;
  const isValidKey = (k: ServiceBlockKey) =>
    k.startsWith("section:")
      ? sectionBlockKeys.includes(k)
      : (SERVICE_FIXED_BLOCKS as readonly string[]).includes(k);
  const savedValid = saved ? saved.filter(isValidKey) : null;
  const resolvedOrder: ServiceBlockKey[] = savedValid && savedValid.length
    ? [...savedValid, ...defaultOrder.filter((k) => !savedValid.includes(k))]
    : defaultOrder;
  const tocItems = (data.sections || [])
    .filter((s) => "heading" in s && s.heading)
    .map((s) => ({
      key: s._key,
      label: (s as { heading: string }).heading,
    }));

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
      />
      {data.faq?.length > 0 && (
        <FaqSchema items={data.faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Breadcrumbs items={breadcrumbs} locale={locale} />
        </motion.div>

        {/* Hero area */}
        <motion.div
          className="mt-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="heading-1 text-black">{data.h1 || data.title}</h1>
          {data.summary && (
            <p className="body-l text-muted mt-4 max-w-3xl">{data.summary}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <KeyFactsBar
            procedureLength={data.procedureLength}
            effectDuration={data.effectDuration}
            sessionsRecommended={data.sessionsRecommended}
            priceFrom={data.priceFrom}
            priceUnit={data.priceUnit}
            locale={locale}
          />
        </motion.div>

        <motion.div
          className="mt-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <BookingCTA ctaKey="serviceDetailHero" variant="primary" size="lg" initialInterest={`service:${data.slug}`}>
            {t("book")}
          </BookingCTA>
        </motion.div>

        {/* Sticky section title bar */}
        <TocStickyBar items={tocItems} />
      </div>

      {/* ═════ Reorderable blocks ═════
          Each block below is keyed in SERVICE_BLOCKS. The admin's saved
          `block_order` on the `services` row decides which one renders when. */}
      {/* The first section:<id> in the resolved order gets the rich hero-image
          side-by-side treatment when it's a richText section AND we have photos.
          Every other section renders via the standard SectionRenderer. */}
      {resolvedOrder.map((blockKey) => {
        // Each individual content section is its own reorderable block —
        // admins can now drop FAQ / doctors / equipment between sections.
        if (blockKey.startsWith("section:")) {
          const sectionId = blockKey.slice("section:".length);
          const section = (data.sections || []).find((s) => s._key === sectionId);
          if (!section) return null;

          const firstSectionKey = resolvedOrder.find((k) => k.startsWith("section:"));
          const isFirstSection = blockKey === firstSectionKey;

          // First rich-text section that has its own `heroImage` uploaded →
          // signature 2-column hero layout with body on one side, callout card
          // + image on the other. Image + callout are explicit per-section
          // fields, controlled from the admin — no more route hardcoded photos
          // and no paragraph-splitting magic.
          // heroImage is now an explicit per-section CMS field. No route-level
          // fallback — admins upload it directly in the Sections tab.
          const richHeroImage =
            section._type === "section.richText" && "heroImage" in section
              ? (section.heroImage as string | undefined)
              : undefined;
          if (isFirstSection && section._type === "section.richText" && richHeroImage) {
            const callout = "calloutBody" in section ? (section.calloutBody as string | undefined) : undefined;
            return (
              <motion.div
                key={blockKey}
                id={`section-${section._key}`}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportConfig}
                className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-12 lg:mt-16 flex flex-col gap-8"
              >
                {section.heading && (
                  <h2 className="heading-2 text-black max-w-2xl">{section.heading}</h2>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                  <div className="flex flex-col gap-6 justify-center lg:order-1 order-2">
                    {section.body && (
                      <p className="body-l text-black-80 leading-relaxed whitespace-pre-line">{section.body}</p>
                    )}
                    {callout && (
                      <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6">
                        <p className="body-m text-black-60 leading-relaxed whitespace-pre-line">{callout}</p>
                      </div>
                    )}
                  </div>
                  <motion.div
                    className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark lg:order-2 order-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Image src={richHeroImage} alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  </motion.div>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={blockKey}
              id={`section-${section._key}`}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-12 lg:mt-16"
            >
              <SectionRenderer sections={[section]} />
            </motion.div>
          );
        }

        switch (blockKey) {
          case "faq":
            return data.faq?.length > 0 ? (
              <div key="faq" className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-20">
                <h2 className="heading-2 text-black mb-8">{heading(data.blockHeadings.faq, t("faq"))}</h2>
                <div className="border-t border-line">
                  {data.faq.map((item, i) => (
                    <div key={i} className="border-b border-line">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer group"
                      >
                        <span className="body-strong text-black group-hover:text-main transition-colors pr-4 text-lg">
                          {item.question}
                        </span>
                        <motion.span
                          className="text-muted text-2xl leading-none shrink-0"
                          animate={{ rotate: openFaq === i ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          +
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="body-l text-muted pb-6 pr-8">{item.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;

          case "doctors":
            return data.relatedDoctors?.length > 0 && doctorsUi ? (
              <div key="doctors" className="mt-16 lg:mt-20">
                <Doctors
                  doctors={data.relatedDoctors}
                  ui={{ ...doctorsUi, title: heading(data.blockHeadings.doctors, doctorsUi.title) }}
                  detailsLabel={detailsLabel || ""}
                />
                <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
                  <Link href="/doctors">
                    <Button variant="outline" size="sm">
                      {t("allDoctors")}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null;

          case "equipment":
            return data.relatedEquipment?.length > 0 ? (
              <div key="equipment" className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-20">
                <h2 className="heading-2 text-black mb-8">{heading(data.blockHeadings.equipment, equipmentUi?.title || t("equipment"))}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.relatedEquipment.map((item) => (
                    <EquipmentCard
                      key={item._id}
                      item={item}
                      detailsLabel={equipmentUi?.details || detailsLabel || t("learnMore")}
                      onClick={() => setOpenEquipmentId(item._id)}
                    />
                  ))}
                </div>
                <AnimatePresence>
                  {selectedEquipment !== null && (
                    <Modal
                      open
                      onClose={() => setOpenEquipmentId(null)}
                      maxWidth={selectedEquipment.photo ? "sm:max-w-3xl" : "sm:max-w-lg"}
                    >
                      <EquipmentModalContent
                        item={selectedEquipment}
                        suitsTitle={equipmentUi?.suitsTitle || ""}
                        resultsTitle={equipmentUi?.resultsTitle || ""}
                      />
                    </Modal>
                  )}
                </AnimatePresence>
              </div>
            ) : null;

          case "relatedServices":
            return data.relatedServices?.length > 0 ? (
              <div key="relatedServices" className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-20">
                <h2 className="heading-2 text-black mb-8">{heading(data.blockHeadings.relatedServices, t("alsoInteresting"))}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.relatedServices.map((svc) => (
                    <Link
                      key={svc._id}
                      href={`/services/${(svc as { categorySlug?: string }).categorySlug || data.category.slug}/${svc.slug}`}
                      className="group flex flex-col h-full rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-all duration-300 p-6"
                    >
                      <h3 className="body-strong text-black group-hover:text-main transition-colors text-lg">
                        {svc.title}
                      </h3>
                      {svc.summary && <p className="body-m text-muted line-clamp-2 mt-2">{svc.summary}</p>}
                      {(svc as { priceFrom?: string }).priceFrom && (
                        <p className="body-strong text-main mt-3">{(svc as { priceFrom?: string }).priceFrom}</p>
                      )}
                      <div className="mt-auto pt-4">
                        <Button variant="outline" size="sm">
                          {t("learnMore")}
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/services">
                    <Button variant="outline" size="sm">
                      {t("viewAllProcedures")}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null;

          case "finalCTA": {
            const cta = data.finalCta;
            const hasCustomImage = cta.bgType === "image" && cta.bgImage;
            // Default (no override): taupe (bg-main). Color override: inline
            // style via CSS var. Image override: absolute-positioned <Image>.
            const cardStyle: React.CSSProperties = {};
            if (cta.bgType === "color" && cta.bgColor) {
              cardStyle.backgroundColor = `var(--${cta.bgColor})`;
            }
            return (
              <div key="finalCTA" className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
                <div
                  className={`mt-16 lg:mt-20 rounded-[var(--radius-card)] p-8 lg:p-12 text-center relative overflow-hidden ${
                    hasCustomImage || cta.bgType === "color" ? "" : "bg-main"
                  }`}
                  style={cardStyle}
                >
                  {hasCustomImage && (
                    <>
                      <Image
                        src={cta.bgImage!}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="100vw"
                        style={cta.bgFocalPoint ? { objectPosition: cta.bgFocalPoint } : undefined}
                      />
                      {/* Scrim so the light text stays legible on any photo. */}
                      <div className="absolute inset-0 bg-black/40" />
                    </>
                  )}
                  <div className="relative">
                    <h2 className="heading-2 text-champagne mb-4">{heading(data.blockHeadings.finalCTA, t("bookCta"))}</h2>
                    <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{t("ctaSubtitle")}</p>
                    <BookingCTA
                      ctaKey="serviceDetailFinal"
                      variant="secondary"
                      size="lg"
                      className="bg-champagne text-black hover:bg-champagne-dark"
                      initialInterest={`service:${data.slug}`}
                    >
                      {t("bookConsultation")}
                    </BookingCTA>
                  </div>
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
