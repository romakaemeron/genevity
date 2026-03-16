"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { fadeInUp, viewportConfig } from "@/lib/motion";

const fastStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
};

export default function Services() {
  const t = useTranslations("services");

  const items: string[] = [];
  for (let i = 0; i < 12; i++) {
    items.push(t(`items.${i}`));
  }

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
      <SectionHeader title={t("title")} linkText={t("link")} linkHref="/poslugy" />

      <motion.div
        className="mt-8 lg:mt-12 flex flex-wrap gap-3 lg:gap-4"
        variants={fastStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {items.map((item, i) => (
          <motion.button
            key={i}
            variants={fadeInUp}
            className="px-4 py-2 rounded-[var(--radius-button)] border border-main text-black body-l hover:bg-main hover:text-champagne transition-colors duration-300 cursor-pointer"
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
