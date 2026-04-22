"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import { ChevronRight } from "lucide-react";
import type { ServiceCategoryData, ServiceCardData, DoctorItem } from "@/lib/db/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionRenderer from "@/components/sections/SectionRenderer";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLdMedicalProcedure } from "@/components/seo/JsonLdMedicalProcedure";
import { absoluteUrl } from "@/lib/url";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { useTranslations } from "next-intl";
import Doctors from "@/components/home/Doctors";

interface Props {
  category: ServiceCategoryData;
  services: ServiceCardData[];
  siblingCategories?: ServiceCategoryData[];
  locale: Locale;
  /** Hero image with optional object-position, flip, and scale (default 1 = 100%) */
  heroImage?: { src: string; position?: string; flip?: boolean; scale?: number };
  /** "light" = light photo, dark text, solid menu. "dark" = dark photo, light text, transparent menu. */
  heroVariant?: "light" | "dark";
  /** Clinic photos to use as visual breaks between sections */
  images?: string[];
  /** Doctors data for the doctors scroll section */
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
}

/** Default clinic images used when no category-specific images are provided */
const DEFAULT_IMAGES = [
  "/clinic/semi1737-hdr.webp",
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/hydrafacial.webp",
  "/clinic/acupulse.webp",
];

export default function CategoryHubTemplate({ category, services, locale, heroImage, heroVariant = "dark", images, doctors, doctorsUi, detailsLabel }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = useTranslations("labels");
  const faq = category.faq || [];
  const photos = images || DEFAULT_IMAGES;

  const breadcrumbs = [
    { label: t("home"), href: "/" },
    { label: t("services"), href: "/services" },
    { label: category.title, href: `/services/${category.slug}` },
  ];

  const sections = category.sections || [];

  return (
    <>
      {faq.length > 0 && (
        <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}
      <JsonLdMedicalProcedure
        name={category.title}
        description={category.summary || ""}
        url={absoluteUrl(`/services/${category.slug}`, locale)}
      />

      {/* ===== HERO ===== */}
      <section className={`relative overflow-hidden ${heroVariant === "light" ? "bg-champagne" : "bg-ink"}`}>
        {heroVariant === "light" ? (
          <>
            <div className="absolute inset-x-0 top-0 z-[10]">
              <MegaMenuHeader variant="transparent-dark" position="absolute" />
            </div>
          </>
        ) : (
          <>
            {/* Dark: full-bleed image */}
            <motion.div className="absolute inset-0" variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 1.2 }}>
              <Image src={heroImage?.src || photos[0]} alt={category.title} fill className="object-cover" style={{ objectPosition: heroImage?.position || "center" }} sizes="100vw" priority />
            </motion.div>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(42,37,32,0.85) 0%, rgba(42,37,32,0.6) 40%, rgba(42,37,32,0.2) 70%, transparent 100%)" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(42,37,32,0.7) 0%, transparent 40%)" }} />
            <div className="absolute inset-x-0 top-0 h-32 z-[3] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)" }} />
            <div className="absolute inset-x-0 top-0 z-[10]">
              <MegaMenuHeader variant="transparent" position="absolute" />
            </div>
          </>
        )}

        {/* Content */}
        <div className={`relative z-[5] ${heroVariant === "dark" ? "min-h-[80vh] lg:min-h-[85vh] flex items-center" : ""}`}>
          <div className="max-w-container mx-auto w-full px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
            <div className={`flex flex-col ${heroVariant === "light" ? "lg:flex-row lg:items-center lg:gap-10" : ""}`}>
              {/* Text */}
              <motion.div
                className={heroVariant === "light" ? "flex-1 max-w-lg lg:py-8" : "max-w-lg"}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Breadcrumbs items={breadcrumbs} locale={locale} variant={heroVariant === "light" ? "dark" : "light"} />
                <h1 className={`heading-1 mt-6 ${heroVariant === "light" ? "text-black" : "text-champagne"}`}>
                  {category.title}
                </h1>
                {category.summary && (
                  <p className={`body-l mt-5 ${heroVariant === "light" ? "text-muted" : "text-white-60"}`}>
                    {category.summary}
                  </p>
                )}
                <div className="mt-8 flex flex-col gap-3 w-fit">
                  <BookingCTA
                    variant={heroVariant === "light" ? "primary" : "secondary"}
                    size="lg"
                    className={`${heroVariant === "light" ? "" : "bg-champagne text-black hover:bg-champagne-dark"} text-center`}
                  >
                    {t("bookConsultation")}
                  </BookingCTA>
                  <Button variant="secondary" size="lg" onClick={() => {
                    const el = document.getElementById("procedures");
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 120;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}>
                    {t("viewProcedures")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Image — right column on desktop, below text on mobile */}
              {heroVariant === "light" && (
                <motion.div
                  className="flex-1 mt-8 lg:mt-0"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <div className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-[70vh] rounded-[var(--radius-card)] overflow-hidden">
                    <Image
                      src={heroImage?.src || photos[0]}
                      alt={category.title}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: heroImage?.position || "center",
                        transform: heroImage?.flip ? "scaleX(-1)" : undefined,
                      }}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Sentinel */}
        <div id="category-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px pointer-events-none" />
      </section>

      {/* ===== CONTENT ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">

        {/* Content sections with integrated visuals */}
        {sections.length > 0 && (
          <div className="flex flex-col gap-12 lg:gap-16">
            {sections.map((section, i) => {
              const isFirstRichText = i === 0 && section._type === "section.richText";
              const isBeforeLastThree = i === sections.length - 3;

              return (
                <div key={section._key}>
                  {/* First rich text section: side-by-side with image */}
                  {isFirstRichText ? (
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={viewportConfig}
                      className="flex flex-col gap-8"
                    >
                      {/* Heading + accent */}
                      {"heading" in section && section.heading && (
                        <h2 className="heading-2 text-black max-w-2xl">{section.heading as string}</h2>
                      )}

                      {/* Image + text side by side like About */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                        {/* Image */}
                        <div className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark">
                          <Image
                            src={photos[1] || photos[0]}
                            alt={category.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </div>

                        {/* Text + info block */}
                        <div className="flex flex-col gap-6 justify-center">
                          {"body" in section && section.body && (() => {
                            const text = section.body as string;
                            const paragraphs = text.split("\n\n").filter(Boolean);
                            const mainText = paragraphs[0] || "";
                            const infoText = paragraphs.slice(1).join("\n\n");
                            return (
                              <>
                                <p className="body-l text-black-80 leading-relaxed">{mainText}</p>
                                {infoText && (
                                  <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6">
                                    <p className="body-m text-black-60 leading-relaxed">{infoText}</p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div id={`section-${section._key}`}>
                      <SectionRenderer sections={[section]} />
                    </div>
                  )}

                  {/* Visual break: single image before the last 2 sections */}
                  {isBeforeLastThree && photos.length > 2 && (
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={viewportConfig}
                      className="mt-12 lg:mt-16 relative aspect-[21/9] rounded-[var(--radius-card)] overflow-hidden"
                    >
                      <Image
                        src={photos[2] || photos[0]}
                        alt={`${category.title} — GENEVITY`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== SERVICE GRID ===== */}
        {services.length > 0 && (
          <motion.section
            id="procedures"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mt-20"
          >
            <motion.div variants={fadeInUp} className="mb-10">
              <h2 className="heading-2 text-black">{t("typesOfProcedures")}</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc) => (
                <motion.div key={svc._id} variants={fadeInUp}>
                  <Link
                    href={`/services/${svc.categorySlug || category.slug}/${svc.slug}`}
                    className="group flex flex-col h-full rounded-[var(--radius-card)] border border-line hover:border-main/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 p-6"
                  >
                    <h3 className="heading-4 text-black group-hover:text-main transition-colors text-lg">
                      {svc.title}
                    </h3>
                    {svc.summary && (
                      <p className="body-m text-muted line-clamp-2 mt-2">{svc.summary}</p>
                    )}
                    {svc.priceFrom && (
                      <p className="body-strong text-main mt-3">{svc.priceFrom}</p>
                    )}
                    <div className="mt-auto pt-4">
                      <Button variant="outline" size="sm">
                        {t("learnMore")}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ===== FAQ ===== */}
        {faq.length > 0 && (
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mt-20"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <h2 className="heading-2 text-black">{t("faq")}</h2>
            </motion.div>

            <motion.div variants={fadeInUp} className="border-t border-line">
              {faq.map((item, i) => (
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
            </motion.div>
          </motion.section>
        )}

      </div>

      {/* ===== DOCTORS — full bleed like homepage ===== */}
      {doctors && doctors.length > 0 && doctorsUi && (
        <div className="mt-16 lg:mt-20">
          <Doctors doctors={doctors} ui={doctorsUi} detailsLabel={detailsLabel || ""} />
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
            <Link href="/doctors">
              <Button variant="outline" size="sm">
                {t("allDoctors")}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="relative mt-16 lg:mt-20 rounded-[var(--radius-card)] overflow-hidden min-h-[320px] flex items-center"
        >
          <Image
            src={photos[photos.length > 4 ? 4 : 0]}
            alt="GENEVITY клініка"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{t("bookCta")}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">
              {t("ctaSubtitle")}
            </p>
            <BookingCTA
              variant="secondary"
              size="lg"
              className="bg-champagne text-black hover:bg-champagne-dark"
            >
              {t("book")}
            </BookingCTA>
          </div>
        </motion.section>
      </div>
    </>
  );
}
