"use client";

import { motion } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/motion";

interface Props {
  _type: string;
  _key: string;
  heading: string;
  body: string;
  calloutBody?: string;
  heroImage?: string;
  index?: number;
}

export default function RichTextSection({ heading, body, calloutBody, index = 0 }: Props) {
  const isEven = index % 2 === 0;

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className={`rounded-[var(--radius-card)] p-8 lg:p-12 ${
        isEven ? "bg-champagne-dark" : "bg-champagne-dark"
      }`}
    >
      <div className="max-w-3xl">
        {heading && (
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 rounded-full bg-main hidden lg:block" />
            <h2 className="heading-2 text-black">{heading}</h2>
          </div>
        )}
        {body && (
          <p className="body-l text-muted leading-relaxed whitespace-pre-line rich-text-body">
            {body}
          </p>
        )}
        {calloutBody && (
          <div className="mt-6 bg-champagne rounded-[var(--radius-card)] p-6">
            <p className="body-m text-black-60 leading-relaxed whitespace-pre-line">{calloutBody}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
