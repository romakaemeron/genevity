"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { ServiceData } from "@/sanity/types";
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
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLdMedicalProcedure } from "@/components/seo/JsonLdMedicalProcedure";
import BookingCTA from "@/components/ui/BookingCTA";
import { absoluteUrl } from "@/lib/seo";
import { ui } from "@/lib/ui-strings";

interface Props {
  data: ServiceData;
  locale: Locale;
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
  /** Clinic/procedure photos for visual breaks */
  images?: string[];
}

export default function ServiceDetailTemplate({ data, locale, doctorsUi, detailsLabel, images }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tocItems = (data.sections || [])
    .filter((s) => "heading" in s && s.heading)
    .map((s) => ({
      key: s._key,
      label: (s as { heading: string }).heading,
    }));

  const breadcrumbs = [
    { label: ui("home", locale), href: "/" },
    { label: ui("services", locale), href: "/services" },
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

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20">
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
          <BookingCTA variant="primary" size="lg">
            {ui("book", locale)}
          </BookingCTA>
        </motion.div>

        {/* Sticky section title bar */}
        <TocStickyBar items={tocItems} />

        {/* Content with integrated visuals */}
        <div className="mt-10">
          {(data.sections || []).length > 0 && (
            <div className="flex flex-col gap-12 lg:gap-16">
              {(data.sections || []).map((section, i) => {
                const photos = images || [];
                const isFirstRichText = i === 0 && section._type === "section.richText";
                const isMidpoint = i === Math.floor((data.sections || []).length / 2);

                return (
                  <div key={section._key}>
                    {/* First section: side-by-side with image */}
                    {isFirstRichText && photos.length > 0 ? (
                      <motion.div
                        id={`section-${section._key}`}
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        className="flex flex-col gap-8"
                      >
                        {"heading" in section && section.heading && (
                          <h2 className="heading-2 text-black max-w-2xl">{section.heading as string}</h2>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                          <div className="flex flex-col gap-6 justify-center lg:order-1 order-2">
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
                          <motion.div
                            className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark lg:order-2 order-1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <Image
                              src={photos[0]}
                              alt={data.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <div id={`section-${section._key}`}>
                        <SectionRenderer sections={[section]} />
                      </div>
                    )}

                    {/* Visual break at midpoint */}
                    {isMidpoint && photos.length > 1 && (
                      <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportConfig}
                        className="mt-12 lg:mt-16 relative aspect-[21/9] rounded-[var(--radius-card)] overflow-hidden hidden lg:block"
                      >
                        <Image
                          src={photos[1]}
                          alt={`${data.title} — GENEVITY`}
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
        </div>

      </div>

      {/* FAQ */}
      {data.faq?.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-20">
          <h2 className="heading-2 text-black mb-8">{ui("faq", locale)}</h2>
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
      )}

      {/* Doctors — full bleed */}
      {data.relatedDoctors?.length > 0 && doctorsUi && (
        <div className="mt-16 lg:mt-20">
          <Doctors doctors={data.relatedDoctors} ui={doctorsUi} detailsLabel={detailsLabel || ""} />
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mt-6">
            <Link href="/doctors">
              <Button variant="outline" size="sm">
                {ui("allDoctors", locale)}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Related services */}
      {data.relatedServices?.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-20">
          <h2 className="heading-2 text-black mb-8">{ui("alsoInteresting", locale)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.relatedServices.map((svc) => (
              <Link
                key={svc._id}
                href={`/services/${(svc as { categorySlug?: string }).categorySlug || data.category.slug}/${svc.slug}`}
                className="group flex flex-col h-full rounded-[var(--radius-card)] border border-line hover:border-main/30 hover:shadow-[var(--shadow-card)] transition-all duration-300 p-6"
              >
                <h3 className="body-strong text-black group-hover:text-main transition-colors text-lg">
                  {svc.title}
                </h3>
                {svc.summary && (
                  <p className="body-m text-muted line-clamp-2 mt-2">{svc.summary}</p>
                )}
                {(svc as { priceFrom?: string }).priceFrom && (
                  <p className="body-strong text-main mt-3">{(svc as { priceFrom?: string }).priceFrom}</p>
                )}
                <div className="mt-auto pt-4">
                  <Button variant="outline" size="sm">
                    {ui("learnMore", locale)}
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/services">
              <Button variant="outline" size="sm">
                {ui("viewAllProcedures", locale)}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <div className="mt-16 lg:mt-20 bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">
            {ui("ctaSubtitle", locale)}
          </p>
          <BookingCTA
            variant="secondary"
            size="lg"
            className="bg-champagne text-black hover:bg-champagne-dark"
          >
            {ui("bookConsultation", locale)}
          </BookingCTA>
        </div>
      </div>
    </>
  );
}
