"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "@/components/ui/Icons";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

export default function FAQ() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = Array.from({ length: 6 }, (_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
      <motion.h2
        className="heading-2 text-black mb-8 lg:mb-12"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {t("title")}
      </motion.h2>

      <motion.div
        className="max-w-2xl rounded-[var(--radius-button)] overflow-hidden"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div key={i} variants={fadeInUp} layout="position">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-4 bg-main text-champagne border-b border-rosegold/30 cursor-pointer hover:bg-main-dark transition-colors"
              >
                <span className="body-l text-left">{item.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <Plus className="w-6 h-6 text-champagne" />
                </motion.span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="p-4 bg-main-dark/80 text-champagne/80 body-l">
                    {item.answer}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
