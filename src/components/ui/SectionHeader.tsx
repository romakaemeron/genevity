"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeInUp, viewportConfig } from "@/lib/motion";
import { ChevronRight } from "@/components/ui/Icons";

interface SectionHeaderProps {
  title: string;
  titleAccent?: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
}

export default function SectionHeader({
  title,
  titleAccent,
  subtitle,
  linkText,
  linkHref,
}: SectionHeaderProps) {
  return (
    <motion.div
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      <div className="flex flex-col gap-2">
        <h2 className="heading-2 text-black">
          {title}
          {titleAccent && (
            <>
              <br />
              <span className="text-black-60">{titleAccent}</span>
            </>
          )}
        </h2>
        {subtitle && (
          <p className="body-l text-black-60 max-w-[525px]">{subtitle}</p>
        )}
      </div>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="group inline-flex items-center gap-2 text-main font-medium text-base transition-colors hover:text-main-dark shrink-0"
        >
          {linkText}
          <ChevronRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </motion.div>
  );
}
