"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { fadeInUp, fadeIn, viewportConfig } from "@/lib/motion";
import { MapPin, Phone, Clock, AtSign } from "lucide-react";
import type { SiteSettingsData } from "@/lib/db/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";

interface Props {
  settings: SiteSettingsData;
  locale: Locale;
  contactsUi: { title: string; instagramLabel: string };
}

export default function ContactsPageComponent({ settings, locale, contactsUi }: Props) {
  const tLabels = useTranslations("labels");
  const tPage = useTranslations("contactsPage");
  // Site settings are the single source of truth for address / phones / etc.
  // Fall back to a search-by-address URL if the admin hasn't set an explicit link.
  const mapsUrl = settings.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(settings.address || "GENEVITY")}`;
  const mapsEmbed = settings.mapsEmbedUrl;

  return (
    <>
      {/* Hero — map + info split */}
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Breadcrumbs
              items={[
                { label: tLabels("home"), href: "/" },
                { label: contactsUi.title, href: "/contacts" },
              ]}
              locale={locale}
            />
            <h1 className="heading-1 text-black mt-6 mb-4">{contactsUi.title}</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Contact info */}
            <motion.div
              className="flex flex-col gap-8 lg:py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="body-l text-muted max-w-md">{tPage("heroSubtitle")}</p>

              <div className="flex flex-col gap-5">
                {/* Address */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-main" />
                  </div>
                  <div>
                    <p className="body-strong text-black group-hover:text-main transition-colors">{settings.address}</p>
                    <p className="body-s text-muted mt-1">{tPage("mapTitle")}</p>
                  </div>
                </a>

                {/* Phones */}
                <div className="flex flex-col gap-3 p-5 rounded-[var(--radius-card)] bg-champagne-dark">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-main" />
                    </div>
                    <div>
                      <a href={`tel:${settings.phone1.replace(/\s/g, "")}`} className="body-strong text-black hover:text-main transition-colors block">
                        {settings.phone1}
                      </a>
                      <a href={`tel:${settings.phone2.replace(/\s/g, "")}`} className="body-m text-muted hover:text-main transition-colors block mt-0.5">
                        {settings.phone2}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark">
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-main" />
                  </div>
                  <div>
                    <p className="body-strong text-black">{settings.hours}</p>
                    <p className="body-s text-muted mt-0.5">{tPage("hoursTitle")}</p>
                  </div>
                </div>

                {/* Instagram */}
                <a
                  href={`https://www.instagram.com/${settings.instagram}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                    <AtSign className="w-5 h-5 text-main" />
                  </div>
                  <div>
                    <p className="body-strong text-black group-hover:text-main transition-colors">@{settings.instagram}</p>
                    <p className="body-s text-muted mt-0.5">{contactsUi.instagramLabel}</p>
                  </div>
                </a>
              </div>

              <BookingCTA ctaKey="contactsHero" variant="primary" size="lg" className="self-start">
                {tLabels("bookConsultation")}
              </BookingCTA>
            </motion.div>

            {/* Map */}
            <motion.div
              className="relative rounded-[var(--radius-card)] overflow-hidden aspect-square lg:aspect-auto lg:min-h-[500px]"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <iframe
                src={mapsEmbed}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Genevity on Google Maps"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clinic photo strip */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16"
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {["/clinic/semi1737-hdr.webp", "/clinic/semi1256-hdr.webp", "/clinic/semi1287-hdr.webp"].map((src, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden">
              <Image src={src} alt={`GENEVITY ${i + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pb-20">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="relative rounded-[var(--radius-card)] overflow-hidden min-h-[280px] flex items-center">
          <Image src="/clinic/acupulse.webp" alt="GENEVITY" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{tLabels("bookCta")}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{tLabels("ctaSubtitle")}</p>
            <BookingCTA ctaKey="contactsFinal" variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{tLabels("book")}</BookingCTA>
          </div>
        </motion.div>
      </div>
    </>
  );
}
