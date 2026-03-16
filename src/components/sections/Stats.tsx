"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");
  const numericPart = parseInt(value.replace(/\D/g, ""));
  const suffix = value.replace(/\d/g, "");

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = numericPart / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericPart) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current) + suffix);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, numericPart, suffix, value]);

  return <span ref={ref}>{display}</span>;
}

export default function Stats() {
  const t = useTranslations("stats");

  const items = [
    { value: t("items.0.value"), label: t("items.0.label") },
    { value: t("items.1.value"), label: t("items.1.label") },
    { value: t("items.2.value"), label: t("items.2.label") },
    { value: t("items.3.value"), label: t("items.3.label") },
  ];

  return (
    <section className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
      <SectionHeader title={t("title")} linkText={t("link")} linkHref="/pro-tsentr" />

      <motion.div
        className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-rows-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {/* Row 1: Stats card + Image */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <motion.div
            variants={fadeInUp}
            className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 flex flex-col justify-between min-h-[200px] lg:min-h-[233px]"
          >
            <div className="grid grid-cols-2 gap-8">
              {items.map((item, i) => (
                <div key={i}>
                  <p className="font-[var(--font-heading)] text-champagne text-4xl lg:text-5xl font-semibold">
                    <AnimatedNumber value={item.value} />
                  </p>
                  <p className="body-m text-champagne/60 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            variants={fadeInUp}
            className="bg-main rounded-[var(--radius-card)] min-h-[200px] lg:min-h-[233px] flex items-center justify-center text-champagne/20 body-m"
          >
            Image
          </motion.div>
        </div>

        {/* Row 2: Image + Wide Image */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <motion.div
            variants={fadeInUp}
            className="bg-main rounded-[var(--radius-card)] min-h-[200px] lg:min-h-[252px] flex items-center justify-center text-champagne/20 body-m"
          >
            Image
          </motion.div>
          <motion.div
            variants={fadeInUp}
            className="bg-main rounded-[var(--radius-card)] min-h-[200px] lg:min-h-[252px] flex items-center justify-center text-champagne/20 body-m"
          >
            Image
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
