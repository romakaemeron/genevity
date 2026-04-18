"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInUp, fadeIn, staggerContainer, viewportConfig } from "@/lib/motion";
import { MapPin, Phone, Clock, AtSign } from "lucide-react";
import type { SiteSettingsData } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BookingCTA from "@/components/ui/BookingCTA";
import { ui } from "@/lib/ui-strings";

interface Props {
  settings: SiteSettingsData;
  locale: Locale;
  contactsUi: { title: string; instagramLabel: string };
}

const L = (ua: string, ru: string, en: string) => ({ ua, ru, en });
const t = (obj: { ua: string; ru: string; en: string }, locale: string) =>
  obj[locale as "ua" | "ru" | "en"] || obj.ua;

const MAPS_URL = "https://www.google.com/maps?q=48.4647,35.0461";
const MAPS_EMBED = "https://maps.google.com/maps?q=вул.+Олеся+Гончара+12,+Дніпро,+Україна&t=&z=16&ie=UTF8&iwloc=&output=embed";

export default function ContactsPageComponent({ settings, locale, contactsUi }: Props) {
  return (
    <>
      {/* Hero — map + info split */}
      <section className="bg-champagne">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-10 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Breadcrumbs
              items={[
                { label: ui("home", locale), href: "/" },
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
              <p className="body-l text-muted max-w-md">
                {t(L(
                  "Ми раді вітати вас у центрі GENEVITY. Запишіться на консультацію або завітайте до нас — ми працюємо щодня.",
                  "Мы рады приветствовать вас в центре GENEVITY. Запишитесь на консультацию или приходите к нам — мы работаем ежедневно.",
                  "We are glad to welcome you at GENEVITY center. Book a consultation or visit us — we are open daily.",
                ), locale)}
              </p>

              <div className="flex flex-col gap-5">
                {/* Address */}
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-main" />
                  </div>
                  <div>
                    <p className="body-strong text-black group-hover:text-main transition-colors">{settings.address}</p>
                    <p className="body-s text-muted mt-1">{t(L("Відкрити на карті", "Открыть на карте", "Open on map"), locale)}</p>
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
                    <p className="body-s text-muted mt-0.5">{t(L("Без вихідних", "Без выходных", "No days off"), locale)}</p>
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

              <BookingCTA variant="primary" size="lg" className="self-start">
                {ui("bookConsultation", locale)}
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
                src={MAPS_EMBED}
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
        className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-16"
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
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pb-20">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig}
          className="relative rounded-[var(--radius-card)] overflow-hidden min-h-[280px] flex items-center">
          <Image src="/clinic/acupulse.webp" alt="GENEVITY" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center p-8 lg:p-14">
            <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
            <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{ui("ctaSubtitle", locale)}</p>
            <BookingCTA variant="secondary" size="lg" className="bg-champagne text-black hover:bg-champagne-dark">{ui("book", locale)}</BookingCTA>
          </div>
        </motion.div>
      </div>
    </>
  );
}
