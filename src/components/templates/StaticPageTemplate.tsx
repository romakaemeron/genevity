"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, viewportConfig } from "@/lib/motion";
import { ChevronRight } from "lucide-react";
import type { StaticPageData, DoctorItem } from "@/lib/db/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionRenderer from "@/components/sections/SectionRenderer";
import { FaqSchema } from "@/components/seo/FaqSchema";
import BookingCTA from "@/components/ui/BookingCTA";
import Button from "@/components/ui/Button";
import Doctors from "@/components/home/Doctors";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

interface Props {
  data: StaticPageData;
  locale: Locale;
  /** Hero image */
  heroImage?: string;
  /** "light" = champagne bg with image, "dark" = image bg with overlay */
  heroVariant?: "light" | "dark";
  /** Photos for visual breaks */
  images?: string[];
  /** Doctors data */
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  /** Custom CTA in hero */
  heroCta?: boolean;
}

export default function StaticPageTemplate({
  data, locale, heroImage, heroVariant = "light", images,
  doctors, doctorsUi, detailsLabel, heroCta = true,
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const photos = images || [];
  const t = useTranslations("labels");

  const breadcrumbs = [
    { label: t("home"), href: "/" },
    { label: data.title, href: `/${data.slug}` },
  ];

  const sections = data.sections || [];

  return (
    <>
      {data.faq?.length > 0 && (
        <FaqSchema items={data.faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}

      {/* ===== HERO ===== */}
      {heroVariant === "dark" && heroImage ? (
        <section className="relative overflow-hidden bg-ink">
          <motion.div className="absolute inset-0" variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 1.2 }}>
            <Image src={heroImage} alt={data.title} fill className="object-cover" sizes="100vw" priority />
          </motion.div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(42,37,32,0.85) 0%, rgba(42,37,32,0.5) 50%, rgba(42,37,32,0.2) 100%)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(42,37,32,0.6) 0%, transparent 40%)" }} />
          <div className="absolute inset-x-0 top-0 h-32 z-[3] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)" }} />
          <div className="absolute inset-x-0 top-0 z-[10]">
            <MegaMenuHeader variant="transparent" position="absolute" />
          </div>

          <div className="relative z-[5] min-h-[60vh] lg:min-h-[65vh] flex items-end">
            <div className="max-w-container mx-auto w-full px-4 sm:px-6 lg:px-12 pb-12 lg:pb-16 pt-28">
              <motion.div className="max-w-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
                <Breadcrumbs items={breadcrumbs} locale={locale} variant="light" />
                <h1 className="heading-1 text-champagne mt-6">{data.h1 || data.title}</h1>
                {data.summary && <p className="body-l text-white-60 mt-5">{data.summary}</p>}
                {heroCta && (
                  <div className="mt-8">
                    <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">
                      {t("bookConsultation")}
                    </BookingCTA>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
          <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px pointer-events-none" />
        </section>
      ) : (
        <section className="bg-champagne">
          {heroImage && (
            <div className="absolute inset-x-0 top-0 z-[10]">
              <MegaMenuHeader variant="transparent-dark" position="absolute" />
            </div>
          )}

          <div className={`relative z-[5] ${heroImage ? "" : ""}`}>
            <div className="max-w-container mx-auto w-full px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
              <div className={`flex flex-col ${heroImage ? "lg:flex-row lg:items-center lg:gap-10" : ""}`}>
                <motion.div className={heroImage ? "flex-1 max-w-lg lg:py-8" : "max-w-3xl"} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
                  <Breadcrumbs items={breadcrumbs} locale={locale} />
                  <h1 className="heading-1 text-black mt-6">{data.h1 || data.title}</h1>
                  {data.summary && <p className="body-l text-muted mt-5">{data.summary}</p>}
                  {heroCta && (
                    <div className="mt-8">
                      <BookingCTA variant="primary" size="lg">{t("bookConsultation")}</BookingCTA>
                    </div>
                  )}
                </motion.div>

                {heroImage && (
                  <motion.div className="flex-1 mt-8 lg:mt-0" variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 1, delay: 0.5 }}>
                    <div className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-[60vh] rounded-[var(--radius-card)] overflow-hidden">
                      <Image src={heroImage} alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div id="static-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px pointer-events-none" />
        </section>
      )}

      {/* ===== CONTENT ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
        {sections.length > 0 && (
          <div className="flex flex-col gap-12 lg:gap-16">
            {sections.map((section, i) => {
              const isFirstRichText = i === 0 && section._type === "section.richText" && photos.length > 0;
              const isMidpoint = i === Math.floor(sections.length / 2) && photos.length > 1;

              return (
                <div key={section._key}>
                  {isFirstRichText ? (
                    <motion.div id={`section-${section._key}`} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="flex flex-col gap-8">
                      {"heading" in section && section.heading && (
                        <h2 className="heading-2 text-black max-w-2xl">{section.heading as string}</h2>
                      )}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                        <div className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark">
                          <Image src={photos[0]} alt={data.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                        </div>
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

                  {isMidpoint && (
                    <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
                      className="mt-12 lg:mt-16 relative aspect-[21/9] rounded-[var(--radius-card)] overflow-hidden hidden lg:block">
                      <Image src={photos[1]} alt={`${data.title} — GENEVITY`} fill className="object-cover" sizes="100vw" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== FAQ ===== */}
      {data.faq?.length > 0 && (
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <h2 className="heading-2 text-black mb-8">{t("faq")}</h2>
          <div className="border-t border-line">
            {data.faq.map((item, i) => (
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
        </div>
      )}

      {/* ===== DOCTORS ===== */}
      {doctors && doctors.length > 0 && doctorsUi && (
        <div className="mt-4 lg:mt-8">
          <Doctors doctors={doctors} ui={doctorsUi} detailsLabel={detailsLabel || ""} />
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
            <Link href="/doctors"><Button variant="outline" size="sm">{t("allDoctors")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </div>
      )}

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
        <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{t("bookCta")}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{t("ctaSubtitle")}</p>
          <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{t("book")}</BookingCTA>
        </div>
      </div>
    </>
  );
}
