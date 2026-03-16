"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

export default function Technology() {
  const t = useTranslations("technology");

  const items = [
    { name: t("items.0.name"), description: t("items.0.description") },
    { name: t("items.1.name"), description: t("items.1.description") },
    { name: t("items.2.name"), description: t("items.2.description") },
  ];

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
      <SectionHeader
        title={t("title")}
        titleAccent={t("titleAccent")}
        linkText={t("link")}
        linkHref="/poslugy"
      />

      <motion.div
        className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
          >
            <div className="bg-main rounded-[var(--radius-card)] aspect-[352/252] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-main-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
                {item.name}
              </div>
            </div>
            <div className="mt-3 px-3">
              <p className="text-black">
                <span className="body-strong">{item.name}. </span>
                <span className="body-l text-black-60">{item.description}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
