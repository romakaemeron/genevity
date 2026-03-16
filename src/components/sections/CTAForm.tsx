"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { fadeInUp, viewportConfig } from "@/lib/motion";

interface CTAFormProps {
  variant?: "default" | "alt";
}

export default function CTAForm({ variant = "default" }: CTAFormProps) {
  const t = useTranslations("ctaForm");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section
      id="booking"
      className="max-w-[var(--container-max)] mx-auto px-6 lg:px-[var(--container-padding)]"
    >
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <h2 className="heading-2 text-black mb-8">
          {variant === "alt" ? t("titleAlt") : t("title")}
        </h2>

        {submitted ? (
          <motion.p
            className="body-l text-success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t("success")}
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
            <input
              type="text"
              placeholder={t("name")}
              required
              className="bg-main text-champagne placeholder:text-champagne/60 px-4 py-3 rounded-[var(--radius-input)] body-m outline-none focus:ring-2 focus:ring-rosegold transition-shadow"
            />
            <input
              type="tel"
              placeholder={t("phone")}
              required
              className="bg-main text-champagne placeholder:text-champagne/60 px-4 py-3 rounded-[var(--radius-input)] body-m outline-none focus:ring-2 focus:ring-rosegold transition-shadow"
            />
            <div className="mt-2">
              <Button variant="secondary" type="submit">
                {t("submit")}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
}
