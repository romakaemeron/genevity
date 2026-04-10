"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

export default function LaserHairRemoval() {
  const t = useTranslations("laserHairRemoval");

  const suits = Array.from({ length: 4 }, (_, i) => t(`suits.${i}`));
  const results = Array.from({ length: 4 }, (_, i) => t(`results.${i}`));

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="bg-main rounded-[var(--radius-card)] p-8 lg:p-16 flex flex-col gap-8"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="heading-2 text-champagne mb-3">{t("title")}</h2>
          <p className="body-l text-white-60">{t("subtitle")}</p>
        </motion.div>

        <motion.p variants={fadeInUp} className="body-l text-champagne/80">
          {t("description")}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={fadeInUp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="body-strong text-champagne">{t("suitsTitle")}</p>
              <ul className="flex flex-col gap-1">
                {suits.map((suit, i) => (
                  <li key={i} className="body-m text-white-60 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne/40 mt-2 shrink-0" />
                    {suit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <p className="body-strong text-champagne">{t("howItWorksTitle")}</p>
              <p className="body-m text-white-60">{t("howItWorks")}</p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="body-strong text-champagne">{t("resultsTitle")}</p>
              <ul className="flex flex-col gap-1">
                {results.map((result, i) => (
                  <li key={i} className="body-m text-white-60 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne/40 mt-2 shrink-0" />
                    {result}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <p className="body-strong text-champagne">{t("zonesTitle")}</p>
              <div className="flex flex-col gap-1">
                <p className="body-m text-white-60">
                  <span className="text-champagne font-medium">{t("zonesWomenTitle")}</span>{" "}
                  {t("zonesWomen")}
                </p>
                <p className="body-m text-white-60">
                  <span className="text-champagne font-medium">{t("zonesMenTitle")}</span>{" "}
                  {t("zonesMen")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p variants={fadeInUp} className="body-s text-white-40 border-t border-white-20 pt-4">
          {t("note")}
        </motion.p>
      </motion.div>
    </section>
  );
}
