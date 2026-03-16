"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollCarousel from "@/components/ui/ScrollCarousel";
import Button from "@/components/ui/Button";
import { fadeInUp } from "@/lib/motion";

const doctors = [
  { name: "Др. Олена Коваленко", experience: "15 років досвіду", specialties: ["Дерматологія", "Anti-Age"] },
  { name: "Др. Андрій Мельник", experience: "12 років досвіду", specialties: ["Косметологія", "Ін'єкції"] },
  { name: "Др. Марина Шевченко", experience: "10 років досвіду", specialties: ["Лазерна терапія", "Естетика"] },
  { name: "Др. Ігор Петренко", experience: "18 років досвіду", specialties: ["Longevity", "Діагностика"] },
];

export default function Experts() {
  const t = useTranslations("experts");

  return (
    <section>
      <div className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <SectionHeader
          title={t("title")}
          subtitle={t("subtitle")}
          linkText={t("link")}
          linkHref="/likari"
        />
      </div>

      <ScrollCarousel className="mt-8 lg:mt-12">
        {doctors.map((doctor, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="shrink-0 w-[280px] lg:w-[300px] bg-main rounded-[var(--radius-card)] overflow-hidden pb-3 snap-start"
          >
            <div className="h-[280px] lg:h-[308px] bg-gradient-to-b from-main-light/40 to-main-dark/40 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
                Photo
              </div>
            </div>

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
      </ScrollCarousel>
    </section>
  );
}
