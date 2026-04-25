"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { Check, AlertTriangle } from "lucide-react";

interface Props {
  _type: string;
  _key: string;
  heading: string;
  items: string[];
}

export default function BulletsSection({ heading, items }: Props) {
  const benefits = (items || []).filter((item) => !item.startsWith("⚠"));
  const drawbacks = (items || []).filter((item) => item.startsWith("⚠"));

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

      {(benefits.length > 0 || drawbacks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-champagne-dark"
            >
              <div className="shrink-0 mt-0.5" style={{ width: 28, height: 28 }}>
                <div className="w-full h-full rounded-full bg-success/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-success" />
                </div>
              </div>
              <p className="body-l text-ink">{item}</p>
            </motion.div>
          ))}
          {drawbacks.map((item, i) => (
            <motion.div
              key={`d-${i}`}
              variants={fadeInUp}
              className={`flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-warning/5 border border-warning/20${
                i === 0 && benefits.length % 2 !== 0 ? " sm:col-start-1" : ""
              }`}
            >
              <div className="shrink-0 mt-0.5" style={{ width: 28, height: 28 }}>
                <div className="w-full h-full rounded-full bg-warning/15 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                </div>
              </div>
              <p className="body-l text-ink">{item.replace(/^⚠\s*/, "")}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
