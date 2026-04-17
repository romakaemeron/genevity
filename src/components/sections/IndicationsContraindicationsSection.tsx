"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { Check, X } from "lucide-react";

interface Props {
  _type: string;
  _key: string;
  indicationsHeading: string;
  indications: string[];
  contraindicationsHeading: string;
  contraindications: string[];
}

export default function IndicationsContraindicationsSection({
  indicationsHeading,
  indications,
  contraindicationsHeading,
  contraindications,
}: Props) {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Indications */}
      <motion.div
        variants={fadeInUp}
        className="rounded-[var(--radius-card)] bg-success/5 border border-success/20 p-7 lg:p-8"
      >
        {indicationsHeading && (
          <div className="flex items-center gap-3 mb-6">
            <h2 className="heading-3 text-black">{indicationsHeading}</h2>
          </div>
        )}
        {indications?.length > 0 && (
          <ul className="flex flex-col gap-3">
            {indications.map((item, i) => (
              <li key={i} className="flex items-start gap-3 body-l text-ink">
                <div className="shrink-0 mt-0.5" style={{ width: 24, height: 24 }}>
                  <div className="w-full h-full rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-success" />
                  </div>
                </div>
                {item}
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Contraindications */}
      <motion.div
        variants={fadeInUp}
        className="rounded-[var(--radius-card)] bg-warning/5 border border-warning/20 p-7 lg:p-8"
      >
        {contraindicationsHeading && (
          <div className="flex items-center gap-3 mb-6">
            <h2 className="heading-3 text-black">{contraindicationsHeading}</h2>
          </div>
        )}
        {contraindications?.length > 0 && (
          <ul className="flex flex-col gap-3">
            {contraindications.map((item, i) => (
              <li key={i} className="flex items-start gap-3 body-l text-ink">
                <div className="shrink-0 mt-0.5" style={{ width: 24, height: 24 }}>
                  <div className="w-full h-full rounded-full bg-warning/20 border border-warning/30 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-warning" />
                  </div>
                </div>
                {item}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.section>
  );
}
