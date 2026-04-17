"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { Check } from "lucide-react";

interface Props {
  _type: string;
  _key: string;
  heading: string;
  items: string[];
}

export default function BulletsSection({ heading, items }: Props) {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      {heading && (
        <motion.div variants={fadeInUp} className="mb-8">
          <h2 className="heading-2 text-black">{heading}</h2>
        </motion.div>
      )}
      {items?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-main/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-main" />
              </div>
              <p className="body-l text-ink">{item}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
