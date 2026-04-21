"use client";

import { motion } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";
import type { SectionCallout } from "@/lib/db/types";

const toneConfig = {
  info: { bg: "bg-ice-subtle", border: "border-ice/30", icon: Info, iconBg: "bg-ice/15", iconColor: "text-ice-dark" },
  warning: { bg: "bg-warning-light", border: "border-warning/30", icon: AlertTriangle, iconBg: "bg-warning/15", iconColor: "text-warning" },
  success: { bg: "bg-success-light", border: "border-success/30", icon: CheckCircle, iconBg: "bg-success/15", iconColor: "text-success" },
};

export default function CalloutSection({ tone, body }: SectionCallout) {
  const config = toneConfig[tone] || toneConfig.info;
  const Icon = config.icon;

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      className={`${config.bg} border ${config.border} rounded-[var(--radius-card)] p-6 lg:p-8`}
    >
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <p className="body-l text-ink whitespace-pre-line pt-1.5">{body}</p>
      </div>
    </motion.section>
  );
}
