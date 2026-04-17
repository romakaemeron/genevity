"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import { ChevronRight } from "lucide-react";
import type { ServiceCategoryData, ServiceCardData } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionRenderer from "@/components/sections/SectionRenderer";
import { FaqSchema } from "@/components/seo/FaqSchema";
import BookingCTA from "@/components/ui/BookingCTA";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { ui } from "@/lib/ui-strings";

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
}

/** Default clinic images used when no category-specific images are provided */
const DEFAULT_IMAGES = [
  "/clinic/semi1737-hdr.webp",
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/hydrafacial.webp",
  "/clinic/acupulse.webp",
];

const cardGradients = [
  "from-main/8 to-champagne-dark",
  "from-rosegold/15 to-champagne-dark",
  "from-ice-light to-champagne-dark",
  "from-main-subtle to-champagne-dark",
  "from-ice-subtle to-champagne",
  "from-rosegold/10 to-white",
];

export default function CategoryHubTemplate({ category, services, locale, heroImage, heroVariant = "dark", images }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faq = category.faq || [];
  const photos = images || DEFAULT_IMAGES;

  const breadcrumbs = [
    { label: ui("home", locale), href: "/" },
    { label: ui("services", locale), href: "/services" },
    { label: category.title, href: `/services/${category.slug}` },
  ];

  // Split sections to insert visual breaks
  const sections = category.sections || [];
  const midPoint = Math.ceil(sections.length / 2);
  const firstHalf = sections.slice(0, midPoint);
  const secondHalf = sections.slice(midPoint);

  return (
    <>
      {faq.length > 0 && (
        <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}

      {/* ===== HERO ===== */}
      <section className={`relative overflow-hidden ${heroVariant === "light" ? "bg-champagne" : "bg-ink"}`}>
        {heroVariant === "light" ? (
          <>
            {/* Desktop image is rendered inline in the flex layout below */}
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

        {/* Two-column layout */}
        <div className={`relative z-[5] ${heroVariant === "dark" ? "min-h-[80vh] lg:min-h-[85vh] flex items-center" : ""}`}>
          <div className="max-w-[var(--container-max)] mx-auto w-full px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-10 lg:pb-16">
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
                <div className="mt-8">
                  <BookingCTA
                    variant={heroVariant === "light" ? "primary" : "secondary"}
                    size="lg"
                    className={heroVariant === "light" ? "" : "bg-champagne text-black hover:bg-champagne-dark"}
                  >
                    {ui("bookConsultation", locale)}
                  </BookingCTA>
                </div>
              </motion.div>

              {/* Image — right column on desktop, below text on mobile */}
              {heroVariant === "light" && (
                <motion.div
                  className="flex-1 mt-8 lg:mt-0"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 1, delay: 0.1 }}
                >
                  <div className="relative w-full aspect-[4/3] lg:aspect-[3/4] lg:max-h-[65vh] rounded-[var(--radius-card)] overflow-hidden">
                    <Image
                      src={heroImage?.src || photos[0]}
                      alt={category.title}
                      fill
                      className="object-cover object-top"
                      style={{ transform: heroImage?.flip ? "scaleX(-1)" : undefined }}
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
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16 lg:py-20">

        {/* First half of sections */}
        {firstHalf.length > 0 && (
          <SectionRenderer sections={firstHalf} />
        )}

        {/* ===== VISUAL BREAK: full-width image strip ===== */}
        {photos.length > 1 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="my-16 lg:my-20 -mx-4 sm:-mx-6 lg:mx-[calc((var(--container-max)-100vw)/2-var(--container-padding))] overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-2 lg:gap-3 h-48 sm:h-64 lg:h-80">
              {photos.slice(1, 4).map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-[var(--radius-sm)]">
                  <Image
                    src={src}
                    alt={`${category.title} — інтер'єр клініки ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="33vw"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Second half of sections */}
        {secondHalf.length > 0 && (
          <SectionRenderer sections={secondHalf} />
        )}

        {/* ===== SERVICE GRID ===== */}
        {services.length > 0 && (
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="mt-20"
          >
            <motion.div variants={fadeInUp} className="mb-10">
              <h2 className="heading-2 text-black">{ui("procedures", locale)}</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc, i) => (
                <motion.div key={svc._id} variants={fadeInUp}>
                  <Link
                    href={`/services/${svc.categorySlug || category.slug}/${svc.slug}`}
                    className="group flex flex-col h-full rounded-[var(--radius-card)] overflow-hidden border border-line hover:border-main/30 hover:shadow-[var(--shadow-card-hover)] transition-all"
                  >
                    <div className={`relative h-36 bg-gradient-to-br ${cardGradients[i % cardGradients.length]} overflow-hidden`}>
                      {svc.heroImage ? (
                        <Image
                          src={svc.heroImage}
                          alt={svc.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <span className="heading-1 text-main/8 absolute top-3 right-5 select-none">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2.5 p-5 flex-1">
                      <h3 className="body-strong text-black group-hover:text-main transition-colors text-lg">
                        {svc.title}
                      </h3>
                      {svc.summary && (
                        <p className="body-m text-muted line-clamp-3">{svc.summary}</p>
                      )}
                      <span className="inline-flex items-center gap-1 body-m text-main mt-auto pt-2">
                        {ui("learnMore", locale)}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
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
              <h2 className="heading-2 text-black">{ui("faq", locale)}</h2>
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

        {/* ===== FINAL CTA with image background ===== */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="relative mt-20 rounded-[var(--radius-card)] overflow-hidden min-h-[320px] flex items-center"
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
            <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">
              {ui("ctaSubtitle", locale)}
            </p>
            <BookingCTA
              variant="secondary"
              size="lg"
              className="bg-champagne text-black hover:bg-champagne-dark"
            >
              {ui("book", locale)}
            </BookingCTA>
          </div>
        </motion.section>
      </div>
    </>
  );
}
