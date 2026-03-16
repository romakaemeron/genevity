"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollCarousel from "@/components/ui/ScrollCarousel";
import { fadeInUp } from "@/lib/motion";

export default function Concerns() {
  const t = useTranslations("concerns");

  const items = Array.from({ length: 7 }, (_, i) => ({
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`),
  }));

  return (
    <section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <SectionHeader title={t("title")} linkText={t("link")} linkHref="/poslugy" />
      </div>

      <ScrollCarousel className="mt-8 lg:mt-12">
        {items.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="shrink-0 w-[280px] lg:w-[300px] snap-start"
          >
            <div className="bg-main rounded-[var(--radius-card)] h-[300px] lg:h-[350px] overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
                {item.title}
              </div>
            </div>
            <div className="mt-3 px-3">
              <p className="text-black">
                <span className="body-strong">{item.title}: </span>
                <span className="body-l text-black-60">{item.description}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </ScrollCarousel>
    </section>
  );
}
