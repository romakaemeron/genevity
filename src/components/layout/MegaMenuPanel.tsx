"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { NavCategory, NavLeaf, NavTop } from "./navConfig";
import { t } from "./navConfig";

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
    transition: { duration: 0.15, ease: [0.32, 0, 0.67, 0] as const },
  },
};

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3.5 2.5L7 6L3.5 9.5"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryBlock({
  cat,
  locale,
  onNavigate,
}: {
  cat: NavCategory;
  locale: string;
  onNavigate?: () => void;
}) {
  return (
    <motion.div className="flex flex-col gap-3" variants={itemReveal}>
      <Link
        href={cat.href}
        onClick={onNavigate}
        className="group inline-flex items-center gap-1.5 body-strong text-black hover:text-main transition-colors"
      >
        <span>{t(cat.label, locale)}</span>
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
              {t(leaf.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ExtraBlock({
  heading,
  items,
  locale,
  onNavigate,
}: {
  heading: string;
  items: NavLeaf[];
  locale: string;
  onNavigate?: () => void;
}) {
  return (
    <motion.div className="flex flex-col gap-3" variants={itemReveal}>
      <p className="body-strong text-black">{heading}</p>
      <ul className="flex flex-col gap-2">
        {items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              onClick={onNavigate}
              className="body-m text-black-60 hover:text-main transition-colors"
            >
              {t(leaf.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function MegaMenuPanel({ item, onNavigate }: Props) {
  const locale = useLocale();
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
      className="fixed left-0 right-0 top-16 lg:top-20 z-[998] bg-champagne border-t border-black-10 shadow-[0_12px_36px_-16px_rgba(42,37,32,0.18)]"
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
            <span>{t({ ua: "Всі послуги", ru: "Все услуги", en: "All services" }, locale)}</span>
            <ArrowRight className="w-4 h-4 text-black-40 group-hover:text-main group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 xl:gap-x-16 gap-y-10">
          {/* Column 1: Ін'єкційна (tall) */}
          {injectable && (
            <CategoryBlock cat={injectable} locale={locale} onNavigate={onNavigate} />
          )}

          {/* Column 2: Апаратна + Інтимне (stacked) */}
          <div className="flex flex-col gap-10">
            {apparatus && (
              <CategoryBlock cat={apparatus} locale={locale} onNavigate={onNavigate} />
            )}
            {intimate && (
              <CategoryBlock cat={intimate} locale={locale} onNavigate={onNavigate} />
            )}
          </div>

          {/* Column 3: Longevity + Лазерна (stacked) */}
          <div className="flex flex-col gap-10">
            {longevity && (
              <CategoryBlock cat={longevity} locale={locale} onNavigate={onNavigate} />
            )}
            {laser && (
              <CategoryBlock cat={laser} locale={locale} onNavigate={onNavigate} />
            )}
          </div>

          {/* Column 4: Інші послуги */}
          {mega.extra && (
            <ExtraBlock
              heading={t(mega.extra.label, locale)}
              items={mega.extra.items}
              locale={locale}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
