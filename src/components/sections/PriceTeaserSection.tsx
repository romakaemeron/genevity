"use client";

import { motion } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import BookingCTA from "@/components/ui/BookingCTA";
import type { SectionPriceTeaser } from "@/lib/db/types";

export default function PriceTeaserSection({ heading, intro, ctaLabel }: SectionPriceTeaser) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className="rounded-[var(--radius-card)] bg-gradient-to-br from-champagne-dark to-champagne-darker p-8 lg:p-12 "
    >
      <div className="flex flex-col gap-6">
        {heading && (
          <h2 className="heading-3 text-black">{heading}</h2>
        )}
        {intro && <p className="body-l text-muted max-w-2xl">{intro}</p>}
        {ctaLabel && (
          <BookingCTA ctaKey="priceTeaser" variant="primary" size="lg" className="self-start">
            {ctaLabel}
          </BookingCTA>
        )}
      </div>
    </motion.section>
  );
}
