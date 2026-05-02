"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { DoctorProfileData } from "@/lib/db/queries";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import DoctorReviews from "@/components/doctors/DoctorReviews";
import CertificateGallery from "@/components/doctors/CertificateGallery";
import { JsonLd } from "@/components/seo/JsonLd";

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

interface Props {
  doctor: DoctorProfileData;
  locale: Locale;
}

function GraduationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
function BadgeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
}

export default function DoctorProfilePage({ doctor, locale }: Props) {
  const tLabels = useTranslations("labels");

  const photo = doctor.photoFull || doctor.photoCard || doctor.photoCircle;
  const hasEducation = doctor.education.length > 0;
  const hasCerts = doctor.certifications.length > 0;
  const hasServices = doctor.services.length > 0;
  const hasCertImages = doctor.certificateImages.length > 0;

  const certImagesForSchema = doctor.certificateImages
    .filter((c) => c.type === "image")
    .map((c) => ({
      "@type": "ImageObject",
      "@id": c.url,
      url: c.url,
      contentUrl: c.url,
      name: c[`alt_${locale === "ua" ? "uk" : locale}` as keyof typeof c] ?? c.alt_uk,
      description: `Документ про кваліфікацію лікаря ${doctor.name}`,
      representativeOfPage: false,
    }));

  const certTitle = locale === "ru" ? "Сертификаты" : locale === "en" ? "Certificates" : "Сертифікати";

  return (
    <>
      {/* Hero */}
      <section className="bg-champagne pt-28 pb-12 lg:pt-32 lg:pb-16">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div {...fade}>
            <Breadcrumbs
              items={[
                { label: tLabels("home"), href: "/" },
                { label: tLabels("doctors"), href: "/doctors" },
                { label: doctor.name, href: `/doctors/${doctor.slug}` },
              ]}
              locale={locale}
            />
          </motion.div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 lg:gap-16 items-start">
            {/* Left: text */}
            <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-6">
              <motion.div variants={fade}>
                <h1 className="heading-1 text-black">{doctor.name}</h1>
                <p className="body-m text-main font-medium mt-3">{doctor.role}</p>
              </motion.div>

              {doctor.experience && (
                <motion.div variants={fade}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-main/10 text-main body-s font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                    <span>{tLabels("experience")}:&nbsp;{doctor.experience}</span>
                  </div>
                </motion.div>
              )}

              {doctor.specialties.length > 0 && (
                <motion.div variants={fade} className="flex flex-wrap gap-2">
                  {doctor.specialties.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-black/5 body-s text-black-60">{s}</span>
                  ))}
                </motion.div>
              )}

              {doctor.bio && (
                <motion.div variants={fade} className="max-w-2xl">
                  {doctor.bio.split("\n\n").map((para, i) => (
                    <p key={i} className={`body-l text-black-70 leading-relaxed ${i > 0 ? "mt-4" : ""}`}>{para}</p>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Right: photo + CTA */}
            {photo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-5 lg:sticky lg:top-28 order-first lg:order-last"
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-champagne-dark shadow-lg">
                  <div
                    className="absolute inset-0"
                    style={doctor.profileScale !== 1 ? { transform: `scale(${doctor.profileScale})`, transformOrigin: doctor.profileFocalPoint } : undefined}
                  >
                    <Image src={photo} alt={doctor.name} title={doctor.name} fill className="object-cover" style={{ objectPosition: doctor.profileFocalPoint }} sizes="(max-width: 1024px) 100vw, 340px" priority />
                  </div>
                </div>
                <BookingCTA ctaKey="doctorProfile" variant="primary" size="md">
                  {tLabels("bookConsultation")}
                </BookingCTA>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Education & Certifications — contained card block */}
      {(hasEducation || hasCerts) && (
        <section className="bg-champagne py-12 lg:py-16">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-champagne-dark rounded-3xl p-4 md:p-6 lg:p-8 xl:p-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                {hasEducation && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-main/10 text-main flex items-center justify-center shrink-0"><GraduationIcon /></div>
                      <h2 className="heading-3 text-black">{locale === "ru" ? "Образование" : locale === "en" ? "Education" : "Освіта"}</h2>
                    </div>
                    <ul className="flex flex-col gap-5">
                      {doctor.education.map((e, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="mt-2 w-2 h-2 rounded-full bg-main shrink-0" />
                          <div>
                            <p className="body-strong text-black">{e.institution}</p>
                            <p className="body-m text-black-60 mt-0.5">{e.degree}</p>
                            {e.year && <p className="body-s text-black-40 mt-0.5">{e.year}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {hasCerts && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-main/10 text-main flex items-center justify-center shrink-0"><BadgeIcon /></div>
                      <h2 className="heading-3 text-black">{locale === "ru" ? "Сертификаты и обучение" : locale === "en" ? "Certifications & Training" : "Сертифікати та навчання"}</h2>
                    </div>
                    <ul className="flex flex-col gap-4">
                      {doctor.certifications.map((c, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="mt-[0.35em] w-2 h-2 rounded-full bg-rosegold shrink-0" />
                          <div>
                            <p className="body-m text-black">{c.title}</p>
                            {c.issuer && <p className="body-s text-black-50 mt-0.5">{c.issuer}</p>}
                            {c.year && <p className="body-s text-black-40">{c.year}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Certificate gallery */}
      {hasCertImages && (
        <>
          {certImagesForSchema.length > 0 && (
            <JsonLd data={certImagesForSchema.length === 1 ? certImagesForSchema[0] : { "@context": "https://schema.org", "@graph": certImagesForSchema }} />
          )}
          <CertificateGallery
            images={doctor.certificateImages}
            doctorName={doctor.name}
            locale={locale}
            title={certTitle}
          />
        </>
      )}

      {/* Services */}
      {hasServices && (
        <section className="bg-champagne py-12 lg:py-16">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="heading-2 text-black mb-8">
              {locale === "ru" ? "Процедуры и услуги" : locale === "en" ? "Procedures & Services" : "Процедури та послуги"}
            </motion.h2>
            <motion.ul variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {doctor.services.map((svc) => (
                <motion.li key={svc.slug} variants={fade}>
                  <Link href={`/services/${svc.categorySlug}/${svc.slug}`} className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-champagne-dark hover:bg-champagne-darker transition-all">
                    <span className="body-m text-black transition-colors">{svc.title}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 text-black-40 group-hover:translate-x-0.5 group-hover:text-black transition-all duration-200">
                      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>
      )}

      {/* Reviews */}
      <DoctorReviews
        reviews={doctor.reviews}
        locale={locale}
        doctorSlug={doctor.slug}
        doctorId={doctor._id}
        doctorName={doctor.name}
        services={doctor.services.map((s) => ({ slug: s.slug, title: s.title }))}
      />

      {/* Final CTA block */}
      {(() => {
        const cta = doctor.finalCta;
        const hasCustomImage = cta.bgType === "image" && cta.bgImage;
        const cardStyle: React.CSSProperties = {};
        if (cta.bgType === "color" && cta.bgColor) {
          cardStyle.backgroundColor = `var(--${cta.bgColor})`;
        }
        return (
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
            <div
              className={`mt-16 rounded-[var(--radius-card)] p-8 lg:p-12 text-center relative overflow-hidden ${
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
                  <div className="absolute inset-0 bg-black/40" />
                </>
              )}
              <div className="relative">
                <h2 className="heading-2 text-champagne mb-4">
                  {cta.heading || tLabels("bookCta")}
                </h2>
                <p className="body-l text-white/60 mb-8 max-w-2xl mx-auto">
                  {cta.subtitle || tLabels("ctaSubtitle")}
                </p>
                <BookingCTA
                  ctaKey="doctorProfile"
                  variant="secondary"
                  size="lg"
                  className="bg-champagne text-black hover:bg-champagne-dark"
                  initialInterest={`doctor:${doctor.slug}`}
                >
                  {cta.buttonText || tLabels("bookConsultation")}
                </BookingCTA>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
