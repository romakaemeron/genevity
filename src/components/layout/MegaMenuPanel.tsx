"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { NavTop } from "./navConfig";
import { t } from "./navConfig";

type Props = {
  item: NavTop;
  onNavigate?: () => void;
};

export default function MegaMenuPanel({ item, onNavigate }: Props) {
  const locale = useLocale();
  const mega = item.mega;
  if (!mega) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 right-0 top-16 lg:top-20 z-[998] bg-champagne border-t border-black-10 shadow-[0_12px_36px_-16px_rgba(42,37,32,0.18)]"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
          {mega.categories.map((cat) => (
            <div key={cat.key} className="flex flex-col gap-3">
              <Link
                href={cat.href}
                onClick={onNavigate}
                className="body-strong text-black hover:text-main transition-colors"
              >
                {t(cat.label, locale)}
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
            </div>
          ))}

          {mega.extra && (
            <div className="flex flex-col gap-3">
              <p className="body-strong text-black">{t(mega.extra.label, locale)}</p>
              <ul className="flex flex-col gap-2">
                {mega.extra.items.map((leaf) => (
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
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
