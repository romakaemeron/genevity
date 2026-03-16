"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { fadeInUp, slideInRight } from "@/lib/motion";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative pt-20 lg:pt-24">
      <div className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]">
        <div className="relative bg-main rounded-[var(--radius-card)] overflow-hidden min-h-[500px] lg:min-h-[580px] flex items-end lg:items-center">
          {/* Content */}
          <div className="relative z-10 p-8 lg:p-16 pb-16 lg:pb-16 w-full lg:w-1/2">
            <motion.h1
              className="heading-1 text-champagne mb-4"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              className="body-l text-white-60 mb-8 max-w-lg"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
            >
              {t("subtitle")}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="secondary"
                href="#booking"
                className="bg-champagne text-black hover:bg-champagne-dark"
              >
                {t("cta")}
              </Button>
              <Button
                variant="ghost"
                href="/poslugy"
                className="text-champagne hover:text-white"
              >
                {t("programs")}
              </Button>
            </motion.div>
          </div>

          {/* Hero Image Placeholder */}
          <motion.div
            className="hidden lg:block absolute right-0 top-0 w-[45%] h-full"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="w-full h-full bg-gradient-to-l from-main-dark/20 to-transparent flex items-center justify-center">
              <div className="w-[400px] h-[500px] rounded-2xl bg-main-light/30 flex items-center justify-center text-champagne/30 body-m">
                Hero Image
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
