"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/useReveal";
import { FaqSchema } from "@/components/seo/FaqSchema";

const QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

function FaqItem({ question, answer, isOpen, onToggle }: {
  question: string; answer: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="body-strong text-black group-hover:text-main transition-colors pr-4">{question}</span>
        <span className={`faq-icon text-muted text-2xl leading-none shrink-0 ${isOpen ? "open" : ""}`}>+</span>
      </button>
      <div className={`accordion-body ${isOpen ? "open" : ""}`}>
        <div>
          <p className="body-l text-muted pb-5 pr-8">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomeFaq() {
  const t = useTranslations("homeFaq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, visible } = useScrollReveal();

  const items = QUESTION_KEYS.map((k) => ({
    question: t(`${k}.question`),
    answer: t(`${k}.answer`),
  })).filter((x) => x.question);

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 ${visible ? "revealed" : ""}`}>
      <FaqSchema items={items} />
      <div className="flex flex-col">
        <h2 className="reveal heading-2 text-black mb-8">{t("title")}</h2>
        <div className="reveal d1 border-t border-line">
          {items.map((item, i) => (
            <FaqItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
