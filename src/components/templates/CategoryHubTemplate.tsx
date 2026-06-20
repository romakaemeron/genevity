"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
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
import { useScrollReveal } from "@/lib/useReveal";
import { renderInlineMarkdown } from "@/lib/inline-markdown";

interface Props {
  category: ServiceCategoryData;
  services: ServiceCardData[];
  siblingCategories?: ServiceCategoryData[];
  locale: Locale;
  heroImage?: { src: string; position?: string; flip?: boolean; scale?: number };
  heroVariant?: "light" | "dark";
  images?: string[];
  doctors?: DoctorItem[];
  doctorsUi?: { title: string; subtitle: string; cta: string; experience: string };
  detailsLabel?: string;
}

const DEFAULT_IMAGES = [
  "/clinic/semi1737-hdr.webp",
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/hydrafacial.webp",
  "/clinic/acupulse.webp",
];

function RevealSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} id={id} className={`${className || ""} ${visible ? "revealed" : ""}`}>
      {children}
    </section>
  );
}

export default function CategoryHubTemplate({ category, services, locale, heroImage, heroVariant = "dark", images, doctors, doctorsUi, detailsLabel }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = useTranslations("labels");
  const faq = category.faq || [];
  const photos = images || DEFAULT_IMAGES;
  const sections = category.sections || [];

  const breadcrumbs = [
    { label: t("home"), href: "/" },
    { label: t("services"), href: "/services" },
    { label: category.title, href: `/services/${category.slug}` },
  ];

  return (
    <>
      {faq.length > 0 && <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />}
      <JsonLdMedicalProcedure name={category.title} description={category.summary || ""} url={absoluteUrl(`/services/${category.slug}`, locale)} />

      {/* ===== HERO — no animation, LCP visible immediately ===== */}
      <section className={`relative overflow-hidden ${heroVariant === "light" ? "bg-champagne" : "bg-ink"}`}>
        {heroVariant === "light" ? (
          <div className="absolute inset-x-0 top-0 z-[10]">
            <MegaMenuHeader variant="transparent-dark" position="absolute" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0">
              <Image src={heroImage?.src || photos[0]} alt={category.title} title={category.title} fill className="object-cover" style={{ objectPosition: heroImage?.position || "center" }} sizes="100vw" priority />
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(42,37,32,0.85) 0%, rgba(42,37,32,0.6) 40%, rgba(42,37,32,0.2) 70%, transparent 100%)" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(42,37,32,0.7) 0%, transparent 40%)" }} />
            <div className="absolute inset-x-0 top-0 h-32 z-[3] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)" }} />
            <div className="absolute inset-x-0 top-0 z-[10]"><MegaMenuHeader variant="transparent" position="absolute" /></div>
          </>
        )}

        <div className={`relative z-[5] ${heroVariant === "dark" ? "min-h-[80vh] lg:min-h-[85vh] flex items-center" : ""}`}>
          <div className="max-w-container mx-auto w-full px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
            <div className={`flex flex-col ${heroVariant === "light" ? "lg:flex-row lg:items-center lg:gap-10" : ""}`}>
              <div className={heroVariant === "light" ? "flex-1 max-w-lg lg:py-8" : "max-w-lg"}>
                <Breadcrumbs items={breadcrumbs} locale={locale} variant={heroVariant === "light" ? "dark" : "light"} noSchema />
                <h1 className={`heading-1 mt-6 ${heroVariant === "light" ? "text-black" : "text-champagne"}`}>{category.title}</h1>
                {category.summary && <p className={`body-l mt-5 ${heroVariant === "light" ? "text-muted" : "text-white-60"}`}>{renderInlineMarkdown(category.summary)}</p>}
                <div className="mt-8 flex flex-col gap-3 w-fit">
                  <BookingCTA ctaKey="categoryHero" variant={heroVariant === "light" ? "primary" : "secondary"} size="lg" className={`${heroVariant === "light" ? "" : "bg-champagne text-black hover:bg-champagne-dark"} text-center`}>{t("bookConsultation")}</BookingCTA>
                  <Button variant="secondary" size="lg" onClick={() => { const el = document.getElementById("procedures"); if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" }); } }}>
                    {t("viewProcedures")}<ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {heroVariant === "light" && (
                <div className="flex-1 mt-8 lg:mt-0">
                  <div className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-[70vh] rounded-[var(--radius-card)] overflow-hidden">
                    <Image src={heroImage?.src || photos[0]} alt={category.title} title={category.title} fill className="object-cover" style={{ objectPosition: heroImage?.position || "center", transform: heroImage?.flip ? "scaleX(-1)" : undefined }} sizes="(max-width: 1024px) 100vw, 50vw" priority />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div id="category-hero-sentinel" aria-hidden="true" className="absolute bottom-0 left-0 w-px h-px pointer-events-none" />
      </section>

      {/* ===== CONTENT ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
        {sections.length > 0 && (
          <div className="flex flex-col gap-16 lg:gap-20">
            {sections.map((section, i) => {
              const isFirstRichText = i === 0 && section._type === "section.richText";
              const isBeforeLastThree = i === sections.length - 3;
              return (
                <div key={section._key}>
                  {isFirstRichText ? (
                    <RevealSection className="flex flex-col gap-8">
                      {"heading" in section && section.heading && <h2 className="reveal heading-2 text-black max-w-2xl">{section.heading as string}</h2>}
                      <div className="reveal d1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                        <div className="relative w-full aspect-[4/3] lg:aspect-auto rounded-[var(--radius-card)] overflow-hidden bg-champagne-dark">
                          <Image src={photos[1] || photos[0]} alt={category.title} title={category.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                        </div>
                        <div className="flex flex-col gap-6 justify-center">
                          {"body" in section && section.body && (() => {
                            const text = section.body as string;
                            const paragraphs = text.split("\n\n").filter(Boolean);
                            const mainText = paragraphs[0] || "";
                            const infoText = paragraphs.slice(1).join("\n\n");
                            return (<>
                              <p className="body-l text-black-80 leading-relaxed whitespace-pre-line">{renderInlineMarkdown(mainText)}</p>
                              {infoText && <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6"><p className="body-m text-black-60 leading-relaxed whitespace-pre-line">{renderInlineMarkdown(infoText)}</p></div>}
                            </>);
                          })()}
                        </div>
                      </div>
                    </RevealSection>
                  ) : (
                    <div id={`section-${section._key}`}>
                      <SectionRenderer sections={[section]} />
                    </div>
                  )}

                  {isBeforeLastThree && photos.length > 2 && (
                    <div className="mt-12 lg:mt-16 relative aspect-[21/9] rounded-[var(--radius-card)] overflow-hidden">
                      <Image src={photos[2] || photos[0]} alt={`${category.title} — GENEVITY`} title={`${category.title} — GENEVITY`} fill className="object-cover" sizes="100vw" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== SERVICE GRID ===== */}
        {services.filter(svc => svc.slug !== category.slug).length > 0 && (
          <RevealSection id="procedures" className="mt-20">
            <div className="reveal mb-10"><h2 className="heading-2 text-black">{t("typesOfProcedures")}</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.filter(svc => svc.slug !== category.slug).map((svc, i) => (
                <Link key={svc._id} href={`/services/${svc.categorySlug || category.slug}/${svc.slug}`}
                  className="reveal group flex flex-col h-full rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-all duration-300 p-6"
                  style={{ "--rd": `${i * 0.05}s` } as React.CSSProperties}
                >
                  <h3 className="heading-4 text-black group-hover:text-main transition-colors text-lg">{svc.title}</h3>
                  {svc.summary && <p className="body-m text-muted line-clamp-2 mt-2">{renderInlineMarkdown(svc.summary)}</p>}
                  {svc.priceFrom && <p className="body-strong text-main mt-3">{svc.priceFrom}</p>}
                  <div className="mt-auto pt-4"><Button variant="outline" size="sm">{t("learnMore")}<ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></Button></div>
                </Link>
              ))}
            </div>
          </RevealSection>
        )}

        {/* ===== FAQ ===== */}
        {faq.length > 0 && (
          <RevealSection className="mt-20">
            <div className="reveal mb-8"><h2 className="heading-2 text-black">{t("faq")}</h2></div>
            <div className="reveal d1 border-t border-line">
              {faq.map((item, i) => (
                <div key={i} className="border-b border-line">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer group" aria-expanded={openFaq === i}>
                    <span className="body-strong text-black group-hover:text-main transition-colors pr-4 text-lg">{item.question}</span>
                    <span className={`faq-icon text-muted text-2xl leading-none shrink-0 ${openFaq === i ? "open" : ""}`}>+</span>
                  </button>
                  <div className={`accordion-body ${openFaq === i ? "open" : ""}`}>
                    <div><p className="body-l text-muted pb-6 pr-8">{renderInlineMarkdown(item.answer)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        )}
      </div>

      {/* ===== DOCTORS ===== */}
      {doctors && doctors.length > 0 && doctorsUi && (
        <div className="mt-16 lg:mt-20">
          <Doctors doctors={doctors} ui={doctorsUi} detailsLabel={detailsLabel || ""} />
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
            <Link href="/doctors"><Button variant="outline" size="sm">{t("allDoctors")}<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </div>
      )}

      {/* ===== FINAL CTA ===== */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <RevealSection className="mt-16 lg:mt-20">
          <div className="reveal relative rounded-[var(--radius-card)] overflow-hidden min-h-[320px] flex items-center">
            <Image src={photos[photos.length > 4 ? 4 : 0]} alt="GENEVITY клініка" title="GENEVITY — клініка довголіття та естетичної медицини" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 w-full text-center p-8 lg:p-14">
              <h2 className="heading-2 text-champagne mb-4">{t("bookCta")}</h2>
              <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{t("ctaSubtitle")}</p>
              <BookingCTA ctaKey="categoryFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{t("book")}</BookingCTA>
            </div>
          </div>
        </RevealSection>
      </div>
    </>
  );
}
