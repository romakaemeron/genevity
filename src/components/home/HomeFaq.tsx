"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { FaqSchema } from "@/components/seo/FaqSchema";

const QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="body-strong text-black group-hover:text-main transition-colors pr-4">
          {question}
        </span>
        <motion.span
          className="text-muted text-2xl leading-none shrink-0"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="body-l text-muted pb-5 pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeFaq() {
  const t = useTranslations("homeFaq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = QUESTION_KEYS.map((k) => ({
    question: t(`${k}.question`),
    answer: t(`${k}.answer`),
  })).filter((x) => x.question);

  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
      <FaqSchema items={items} />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="flex flex-col"
      >
        <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-8">
          {t("title")}
        </motion.h2>

        <motion.div variants={fadeInUp} className="border-t border-line">
          {items.map((item, i) => (
            <FaqItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
