"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import CTAForm from "@/components/sections/CTAForm";

const doctors = [
  {
    name: "Др. Олена Коваленко",
    role: "Головний лікар-дерматолог",
    experience: "15 років досвіду",
    specialties: ["Дерматологія", "Anti-Age медицина", "Лазерна терапія"],
    bio: "Спеціаліст з дерматології та естетичної медицини. Міжнародна сертифікація EADV.",
  },
  {
    name: "Др. Андрій Мельник",
    role: "Лікар-косметолог",
    experience: "12 років досвіду",
    specialties: ["Ін'єкційна косметологія", "Контурна пластика"],
    bio: "Експерт з ін'єкційних технік. Сертифікований тренер Allergan та Galderma.",
  },
  {
    name: "Др. Марина Шевченко",
    role: "Лікар естетичної медицини",
    experience: "10 років досвіду",
    specialties: ["Апаратна косметологія", "Естетика тіла"],
    bio: "Спеціаліст з апаратних методик омолодження. Сертифікація InMode та Lumenis.",
  },
  {
    name: "Др. Ігор Петренко",
    role: "Лікар-терапевт, Longevity",
    experience: "18 років досвіду",
    specialties: ["Longevity медицина", "Функціональна діагностика"],
    bio: "Провідний спеціаліст з медицини довголіття. Член Європейської асоціації Anti-Aging Medicine.",
  },
];

export default function DoctorsPage() {
  const t = useTranslations("experts");

  return (
    <div className="flex flex-col gap-[var(--spacing-section)] pt-24">
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="heading-1 text-black mb-4">{t("title")}</h1>
          <p className="body-l text-black-60 max-w-2xl">{t("subtitle")}</p>
        </motion.div>
      </section>

      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {doctors.map((doc, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              className="flex flex-col lg:flex-row gap-6 bg-main/5 rounded-[var(--radius-card)] p-6 lg:p-8"
            >
              <div className="shrink-0 w-full lg:w-48 h-56 lg:h-auto bg-main rounded-[var(--radius-card)] flex items-center justify-center text-champagne/20 body-m">
                Photo
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="heading-3 text-black">{doc.name}</h2>
                <p className="body-strong text-main">{doc.role}</p>
                <p className="body-m text-black-60">{doc.experience}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {doc.specialties.map((s, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 rounded-[var(--radius-pill)] border border-main/30 body-s text-main"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="body-m text-black-60 mt-2">{doc.bio}</p>
                <Button variant="primary" className="mt-3 self-start">
                  {t("cta")}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <CTAForm variant="alt" />
    </div>
  );
}
