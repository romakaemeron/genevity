"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, Phone, Clock } from "@/components/ui/Icons";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import CTAForm from "@/components/sections/CTAForm";

export default function ContactsPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-[var(--spacing-section)] pt-24">
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="heading-1 text-black mb-6">{t("nav.contacts")}</h1>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-main" />
              </div>
              <div>
                <h3 className="body-strong text-black mb-1">Адреса</h3>
                <p className="body-l text-black-60">{t("footer.address")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-main" />
              </div>
              <div>
                <h3 className="body-strong text-black mb-1">Телефон</h3>
                <p className="body-l text-black-60">{t("footer.phone")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-main/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-main" />
              </div>
              <div>
                <h3 className="body-strong text-black mb-1">Години роботи</h3>
                <p className="body-l text-black-60">{t("footer.hours")}</p>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-main/10 rounded-[var(--radius-card)] min-h-[400px] flex items-center justify-center text-black-40 body-m">
            Google Maps
          </div>
        </motion.div>
      </section>

      <CTAForm variant="alt" />
    </div>
  );
}
