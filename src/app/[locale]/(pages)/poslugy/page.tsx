"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import CTAForm from "@/components/sections/CTAForm";

const serviceCategories = [
  {
    title: "Ін'єкційна косметологія",
    items: ["Ботулінотерапія", "Контурна пластика", "Біоревіталізація", "Мезотерапія", "PRP-терапія"],
  },
  {
    title: "Апаратна косметологія",
    items: ["Morpheus8 RF-ліфтинг", "Lumenis M22", "HydraFacial", "Лазерне омолодження", "Мікрострумова терапія"],
  },
  {
    title: "Естетика тіла",
    items: ["Лазерна ліпосакція", "Кріоліполіз", "Антицелюлітні програми", "Лімфодренаж", "Контурна корекція"],
  },
  {
    title: "Longevity & Anti-Age",
    items: ["Check-Up 40+", "Longevity програма", "Гормональний баланс", "IV-терапія", "Нутрицевтика"],
  },
];

export default function ServicesPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-[var(--spacing-section)] pt-24">
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="heading-1 text-black mb-6">{t("nav.services")}</h1>
          <p className="body-l text-black-60 max-w-2xl">
            Повний спектр послуг естетичної медицини та довголіття на обладнанні
            світового класу.
          </p>
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
          {serviceCategories.map((cat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-main/5 rounded-[var(--radius-card)] p-8"
            >
              <h2 className="heading-3 text-black mb-6">{cat.title}</h2>
              <ul className="flex flex-col gap-3">
                {cat.items.map((item, j) => (
                  <li
                    key={j}
                    className="body-l text-black-60 flex items-center gap-3 group cursor-pointer hover:text-main transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-main shrink-0 group-hover:scale-150 transition-transform" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <CTAForm />
    </div>
  );
}
