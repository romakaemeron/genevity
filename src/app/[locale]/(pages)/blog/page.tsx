"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

const articles = [
  {
    title: "Що таке медицина довголіття і чому вона важлива",
    category: "Longevity",
    author: "Др. Ігор Петренко",
    date: "15 березня 2026",
    excerpt: "Розбираємо концепцію longevity-медицини та її відмінність від традиційного підходу до здоров'я.",
  },
  {
    title: "5 процедур для підготовки шкіри до весни",
    category: "Естетика",
    author: "Др. Олена Коваленко",
    date: "10 березня 2026",
    excerpt: "Оптимальний набір процедур для відновлення шкіри після зимового сезону.",
  },
  {
    title: "Morpheus8: все, що потрібно знати про RF-ліфтинг",
    category: "Технології",
    author: "Др. Марина Шевченко",
    date: "5 березня 2026",
    excerpt: "Детальний огляд процедури Morpheus8: як працює, для кого підходить, чого очікувати.",
  },
  {
    title: "Check-Up 40+: профілактика vs лікування",
    category: "Check-Up",
    author: "Др. Ігор Петренко",
    date: "28 лютого 2026",
    excerpt: "Чому комплексне обстеження після 40 — це інвестиція в якість життя на десятиліття вперед.",
  },
  {
    title: "Біоревіталізація: мережі та реальність",
    category: "Ін'єкції",
    author: "Др. Андрій Мельник",
    date: "20 лютого 2026",
    excerpt: "Розвінчуємо поширені міфи про процедуру та пояснюємо, як вона насправді працює.",
  },
  {
    title: "IV-терапія: наукова база та клінічна ефективність",
    category: "Longevity",
    author: "Др. Ігор Петренко",
    date: "15 лютого 2026",
    excerpt: "Інфузійна терапія вітамінами: коли вона дійсно потрібна та які результати дає.",
  },
];

export default function BlogPage() {
  const t = useTranslations("nav");

  return (
    <div className="flex flex-col gap-[var(--spacing-section)] pt-24">
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="heading-1 text-black mb-6">{t("blog")}</h1>
          <p className="body-l text-black-60 max-w-2xl">
            Експертні статті від наших лікарів про здоров&apos;я, красу та сучасну медицину.
          </p>
        </motion.div>
      </section>

      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {articles.map((article, i) => (
            <motion.article
              key={i}
              variants={fadeInUp}
              className="group cursor-pointer"
            >
              <div className="bg-main rounded-[var(--radius-card)] aspect-[16/10] mb-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-[var(--radius-pill)] bg-champagne/90 body-s text-main font-semibold">
                    {article.category}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
                  Article Image
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="heading-3 text-black group-hover:text-main transition-colors">
                  {article.title}
                </h2>
                <p className="body-m text-black-60">{article.excerpt}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="body-s text-main">{article.author}</span>
                  <span className="body-s text-black-40">{article.date}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
