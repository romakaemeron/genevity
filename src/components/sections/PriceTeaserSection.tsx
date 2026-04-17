"use client";

import { motion } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import BookingCTA from "@/components/ui/BookingCTA";
import type { SectionPriceTeaser } from "@/sanity/types";

export default function PriceTeaserSection({ heading, intro, ctaLabel }: SectionPriceTeaser) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className="rounded-[var(--radius-card)] bg-gradient-to-br from-champagne-dark to-champagne-darker p-8 lg:p-12 border border-line"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-xl">
          {heading && (
            <h2 className="heading-3 text-black mb-3">{heading}</h2>
          )}
          {intro && <p className="body-l text-muted">{intro}</p>}
        </div>
        {ctaLabel && (
          <BookingCTA variant="primary" size="lg">
            {ctaLabel}
          </BookingCTA>
        )}
      </div>
    </motion.section>
  );
}
