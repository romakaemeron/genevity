"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { ChevronRight } from "@/components/ui/Icons";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

const doctors = [
  { name: "Др. Олена Коваленко", experience: "15 років досвіду", specialties: ["Дерматологія", "Anti-Age"] },
  { name: "Др. Андрій Мельник", experience: "12 років досвіду", specialties: ["Косметологія", "Ін'єкції"] },
  { name: "Др. Марина Шевченко", experience: "10 років досвіду", specialties: ["Лазерна терапія", "Естетика"] },
  { name: "Др. Ігор Петренко", experience: "18 років досвіду", specialties: ["Longevity", "Діагностика"] },
];

export default function Experts() {
  const t = useTranslations("experts");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "right" ? 324 : -324,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        linkText={t("link")}
        linkHref="/likari"
      />

      <motion.div
        className="mt-8 lg:mt-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 snap-x snap-mandatory"
        >
          {doctors.map((doctor, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="group shrink-0 w-[280px] lg:w-[300px] bg-main rounded-[var(--radius-card)] overflow-hidden pb-3 snap-start"
            >
              {/* Photo placeholder */}
              <div className="h-[280px] lg:h-[308px] bg-gradient-to-b from-main-light/40 to-main-dark/40 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
                  Photo
                </div>
              </div>

              {/* Info */}
              <div className="px-3 pt-3 flex flex-col gap-2">
                <p className="body-strong text-champagne">{doctor.name}</p>
                <p className="body-strong text-champagne/80">{doctor.experience}</p>
                {doctor.specialties.map((s, j) => (
                  <p key={j} className="body-strong text-champagne/60">{s}</p>
                ))}
                <Button
                  variant="primary"
                  className="mt-2 bg-champagne text-black hover:bg-champagne-dark w-full"
                >
                  {t("cta")}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
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
