"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { NavCategory, NavLeaf, NavTop } from "./navConfig";

type Props = {
  item: NavTop;
  onNavigate?: () => void;
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
  exit: {
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
};

const itemReveal = {
  initial: { opacity: 0, y: 10, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -4,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryBlock({ cat, onNavigate }: { cat: NavCategory; onNavigate?: () => void }) {
  const tNav = useTranslations("nav_mega");
  return (
    <motion.div className="flex flex-col gap-3" variants={itemReveal}>
      <Link
        href={cat.href}
        onClick={onNavigate}
        className="group inline-flex items-center gap-1.5 body-strong text-black hover:text-main transition-colors"
      >
        <span>{tNav(cat.key)}</span>
        <ArrowRight className="text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
      </Link>
      <ul className="flex flex-col gap-2">
        {cat.items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              onClick={onNavigate}
              className="body-m text-black-60 hover:text-main transition-colors"
            >
              {tNav(leaf.key)}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ExtraBlock({ headingKey, items, onNavigate }: { headingKey: string; items: NavLeaf[]; onNavigate?: () => void }) {
  const tNav = useTranslations("nav_mega");
  return (
    <motion.div className="flex flex-col gap-3" variants={itemReveal}>
      <p className="body-strong text-black">{tNav(headingKey)}</p>
      <ul className="flex flex-col gap-2">
        {items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              onClick={onNavigate}
              className="body-m text-black-60 hover:text-main transition-colors"
            >
              {tNav(leaf.key)}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function MegaMenuPanel({ item, onNavigate }: Props) {
  const tNav = useTranslations("nav_mega");
  const mega = item.mega;
  if (!mega) return null;

  const byKey = Object.fromEntries(mega.categories.map((c) => [c.key, c]));
  const injectable = byKey["injectable"];
  const apparatus = byKey["apparatus"];
  const intimate = byKey["intimate"];
  const laser = byKey["laser"];
  const longevity = byKey["longevity"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-[998] bg-champagne border-t border-black-10 shadow-[0_12px_36px_-16px_rgba(42,37,32,0.18)]"
    >
      <motion.div
        className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-6 pb-12 lg:pt-7 lg:pb-14"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* All services — compact hub link */}
        <motion.div variants={itemReveal}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="group mb-8 inline-flex items-center gap-2 heading-3 text-black-60 hover:text-main transition-colors"
          >
            <span>{tNav("allServices")}</span>
            <ArrowRight className="w-4 h-4 text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 xl:gap-x-16 gap-y-10">
          {injectable && <CategoryBlock cat={injectable} onNavigate={onNavigate} />}
          <div className="flex flex-col gap-10">
            {apparatus && <CategoryBlock cat={apparatus} onNavigate={onNavigate} />}
            {intimate && <CategoryBlock cat={intimate} onNavigate={onNavigate} />}
          </div>
          <div className="flex flex-col gap-10">
            {longevity && <CategoryBlock cat={longevity} onNavigate={onNavigate} />}
            {laser && <CategoryBlock cat={laser} onNavigate={onNavigate} />}
          </div>
          {mega.extra && (
            <ExtraBlock headingKey="more" items={mega.extra.items} onNavigate={onNavigate} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
