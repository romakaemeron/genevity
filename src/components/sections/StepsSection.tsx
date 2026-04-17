"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";

interface Props {
  _type: string;
  _key: string;
  heading: string;
  steps: { title: string; description: string }[];
}

export default function StepsSection({ heading, steps }: Props) {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      {heading && (
        <motion.div variants={fadeInUp} className="mb-10">
          <h2 className="heading-2 text-black">{heading}</h2>
        </motion.div>
      )}
      {steps?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="relative flex flex-col gap-4 p-6 rounded-[var(--radius-card)] bg-white border border-line group hover:border-main/30 hover:shadow-[var(--shadow-card)] transition-all"
            >
              <span className="heading-1 text-main/15 absolute top-4 right-5 select-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-10 h-10 rounded-full bg-main flex items-center justify-center">
                <span className="body-strong text-champagne">{i + 1}</span>
              </div>
              <h3 className="body-strong text-black">{step.title}</h3>
              {step.description && (
                <p className="body-m text-muted">{step.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
