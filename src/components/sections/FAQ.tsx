"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, Minus } from "@/components/ui/Icons";
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
        {items.map((item, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 bg-main text-champagne border-b border-rosegold/30 cursor-pointer hover:bg-main-dark transition-colors"
            >
              <span className="body-l text-left">{item.question}</span>
              {openIndex === i ? (
                <Minus className="w-6 h-6 shrink-0 text-champagne" />
              ) : (
                <Plus className="w-6 h-6 shrink-0 text-champagne" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-main-dark/80 text-champagne/80 body-l">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
