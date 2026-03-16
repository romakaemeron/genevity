"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { ChevronRight } from "@/components/ui/Icons";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

export default function Concerns() {
  const t = useTranslations("concerns");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 324;
    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const items = [
    { title: t("items.0.title"), description: t("items.0.description") },
    { title: t("items.1.title"), description: t("items.1.description") },
    { title: t("items.2.title"), description: t("items.2.description") },
    { title: t("items.3.title"), description: t("items.3.description") },
  ];

  return (
    <section>
      <div className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <SectionHeader title={t("title")} linkText={t("link")} linkHref="/poslugy" />
      </div>

      <motion.div
        className="mt-8 lg:mt-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pl-[max(1.5rem,calc((100vw-var(--container-max))/2+var(--container-padding)))] pr-6 snap-x snap-mandatory"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="group shrink-0 w-[280px] lg:w-[300px] cursor-pointer snap-start"
            >
              <div className="bg-main rounded-[var(--radius-card)] h-[300px] lg:h-[350px] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
        </div>

        {/* Carousel Controls */}
        <div className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)] flex items-center justify-end gap-2 mt-4">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full border border-main/30 flex items-center justify-center text-main hover:bg-main hover:text-champagne transition-all cursor-pointer"
            aria-label="Previous"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-main flex items-center justify-center text-champagne hover:bg-main-dark transition-all cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
