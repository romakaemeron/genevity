"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import CTAForm from "@/components/sections/CTAForm";

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-[var(--spacing-section)] pt-24">
      {/* Hero */}
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <h1 className="heading-1 text-black mb-6">{t("nav.about")}</h1>
          <p className="body-l text-black-60 max-w-2xl">
            Genevity — це медичний центр нового покоління, де поєднуються
            передові технології та індивідуальний підхід до кожного пацієнта.
          </p>
        </motion.div>
      </section>

      {/* History */}
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div>
            <h2 className="heading-2 text-black mb-6">Історія центру</h2>
            <p className="body-l text-black-60 mb-4">
              Заснований у Дніпрі, Genevity народився з ідеї об&apos;єднати концепцію
              Generation та Longevity — здоров&apos;я для всіх поколінь.
            </p>
            <p className="body-l text-black-60">
              Наша команда створила простір, де кожен пацієнт отримує
              індивідуальну програму, розроблену з урахуванням його унікальних
              потреб та цілей.
            </p>
          </div>
          <div className="bg-main rounded-[var(--radius-card)] min-h-[300px] flex items-center justify-center text-champagne/20 body-m">
            Interior Photo
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <h2 className="heading-2 text-black mb-8">Наші цінності</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Індивідуальність", desc: "Кожен пацієнт — унікальний. Ми створюємо персоналізовані програми." },
              { title: "Інновації", desc: "Використовуємо найсучасніше обладнання світового рівня." },
              { title: "Безпека", desc: "Швейцарські стандарти безпеки у кожній процедурі." },
              { title: "Результат", desc: "Вимірюваний результат, підтверджений клінічними дослідженнями." },
            ].map((val, i) => (
              <div key={i} className="bg-main/5 rounded-[var(--radius-card)] p-6">
                <h3 className="heading-3 text-black mb-3">{val.title}</h3>
                <p className="body-l text-black-60">{val.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Gallery placeholder */}
      <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <h2 className="heading-2 text-black mb-8">Фотогалерея</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-main rounded-[var(--radius-card)] aspect-[4/3] flex items-center justify-center text-champagne/20 body-m"
              >
                Photo {i + 1}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <CTAForm variant="alt" />
    </div>
  );
}
