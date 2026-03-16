"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

export default function BeforeAfter() {
  const t = useTranslations("beforeAfter");

  const items = [
    { service: "Morpheus8 RF-ліфтинг" },
    { service: "Lumenis M22 фотоомолодження" },
    { service: "HydraFacial очищення" },
  ];

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        linkText={t("link")}
        linkHref="#"
      />

      <motion.div
        className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {items.map((item, i) => (
          <motion.div key={i} variants={fadeInUp} className="group">
            <div className="bg-main rounded-[var(--radius-card)] aspect-[352/252] overflow-hidden relative">
              {/* Split line */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-champagne/40 z-10" />

              {/* Before / After labels */}
              <div className="absolute bottom-4 left-4 z-10">
                <span className="body-strong text-champagne bg-black/30 px-2 py-1 rounded">
                  {t("before")}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 z-10">
                <span className="body-strong text-champagne bg-black/30 px-2 py-1 rounded">
                  {t("after")}
                </span>
              </div>

              {/* Center drag handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-champagne flex items-center justify-center shadow-lg">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8H12M4 8L6 6M4 8L6 10M12 8L10 6M12 8L10 10" stroke="#8B7B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">
                Before / After
              </div>
            </div>
            <div className="mt-3 px-3">
              <p className="body-strong text-black">{item.service}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
