"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

export default function Services() {
  const t = useTranslations("services");

  const items: string[] = [];
  for (let i = 0; i < 12; i++) {
    items.push(t(`items.${i}`));
  }

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
      <SectionHeader title={t("title")} linkText={t("link")} linkHref="/poslugy" />

      <motion.div
        className="mt-8 lg:mt-12 flex flex-wrap gap-3 lg:gap-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {items.map((item, i) => (
          <motion.button
            key={i}
            variants={fadeInUp}
            whileHover={{ scale: 1.05, backgroundColor: "var(--color-main)", color: "var(--color-champagne)" }}
            className="px-4 py-2 rounded-[var(--radius-button)] border border-main text-black body-l transition-colors duration-300 cursor-pointer"
          >
            {item}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="mt-6"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <Button variant="secondary">{t("download")}</Button>
      </motion.div>
    </section>
  );
}
