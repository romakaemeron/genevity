"use client";

import { motion } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import BookingCTA from "@/components/ui/BookingCTA";
import type { SectionCta } from "@/sanity/types";

export default function CtaSection({ heading, body, ctaLabel }: SectionCta) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-50%] right-[-20%] w-[70%] h-[200%] rounded-full bg-gradient-radial from-champagne/30 to-transparent blur-3xl" />
      </div>
      <div className="relative">
        {heading && <h2 className="heading-2 text-champagne mb-4">{heading}</h2>}
        {body && <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{body}</p>}
        {ctaLabel && (
          <BookingCTA
            variant="secondary"
            size="lg"
            className="bg-champagne text-black hover:bg-champagne-dark"
          >
            {ctaLabel}
          </BookingCTA>
        )}
      </div>
    </motion.section>
  );
}
