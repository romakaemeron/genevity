"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import LocaleSelector from "@/components/ui/LocaleSelector";
import MegaMenuPanel from "./MegaMenuPanel";
import { navTop, t } from "./navConfig";

export default function MegaMenuHeader() {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (document.body.style.position === "fixed") return;
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMega(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const activeItem = navTop.find((i) => i.key === activeMega);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-[999] transition-shadow duration-200 ${
        mobileOpen ? "bg-champagne" : "bg-champagne/90 backdrop-blur-xl"
      } ${
        scrolled || activeMega
          ? "shadow-[0_1px_0_var(--color-black-10)]"
          : "shadow-[0_1px_0_transparent]"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={scheduleClose}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/brand/LogoFullDark.svg"
              alt="GENEVITY"
              width={180}
              height={40}
              className="h-8 lg:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navTop.map((item) => {
              const hasMega = !!item.mega;
              const isActive = activeMega === item.key;
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => {
                    cancelClose();
                    if (hasMega) setActiveMega(item.key);
                    else setActiveMega(null);
                  }}
                >
                  <Link
                    href={item.href}
                    className={`relative body-l transition-colors duration-300 flex items-center gap-1 ${
                      isActive ? "text-main" : "text-black hover:text-main"
                    } after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:bg-main after:transition-all after:duration-300 ${
                      isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                    }`}
                  >
                    {t(item.label, locale)}
                    {hasMega && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
                      >
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <LocaleSelector />
            <BookingCTA variant="primary">{tNav("cta")}</BookingCTA>
          </div>

          {/* Mobile: locale + hamburger */}
          <div className="lg:hidden flex items-center gap-3">
            <LocaleSelector />
            <button
              className="flex flex-col gap-1.5 p-2 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <motion.span
                className="w-6 h-0.5 bg-black block"
                animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="w-6 h-0.5 bg-black block"
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="w-6 h-0.5 bg-black block"
                animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              />
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop Mega Panel */}
      <AnimatePresence>
        {activeItem?.mega && (
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="hidden lg:block"
          >
            <MegaMenuPanel item={activeItem} onNavigate={() => setActiveMega(null)} />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-[998] overflow-y-auto"
            style={{ backgroundColor: "#FAF9F6" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-start gap-1 px-4 sm:px-6 pt-6 pb-20">
              {navTop.map((item, i) => {
                const hasMega = !!item.mega;
                const isExpanded = mobileExpanded === item.key;
                return (
                  <motion.div
                    key={item.key}
                    className="w-full border-b border-black-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + i * 0.03, duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between py-4">
                      <Link
                        href={item.href}
                        className="heading-3 text-black"
                        onClick={() => setMobileOpen(false)}
                      >
                        {t(item.label, locale)}
                      </Link>
                      {hasMega && (
                        <button
                          onClick={() => setMobileExpanded(isExpanded ? null : item.key)}
                          aria-label="Toggle submenu"
                          aria-expanded={isExpanded}
                          className="p-2 -mr-2 cursor-pointer"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {hasMega && isExpanded && item.mega && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-4 pl-1 flex flex-col gap-5">
                            {item.mega.categories.map((cat) => (
                              <div key={cat.key} className="flex flex-col gap-2">
                                <Link
                                  href={cat.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="inline-flex items-center gap-1.5 body-strong text-black"
                                >
                                  <span>{t(cat.label, locale)}</span>
                                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="text-black-40">
                                    <path d="M3.5 2.5L7 6L3.5 9.5" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </Link>
                                <ul className="flex flex-col gap-1.5 pl-3 border-l border-black-10">
                                  {cat.items.map((leaf) => (
                                    <li key={leaf.key}>
                                      <Link
                                        href={leaf.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="body-m text-black-60"
                                      >
                                        {t(leaf.label, locale)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            {item.mega.extra && (
                              <div className="flex flex-col gap-2">
                                <p className="body-strong text-black">{t(item.mega.extra.label, locale)}</p>
                                <ul className="flex flex-col gap-1.5 pl-3 border-l border-black-10">
                                  {item.mega.extra.items.map((leaf) => (
                                    <li key={leaf.key}>
                                      <Link
                                        href={leaf.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="body-m text-black-60"
                                      >
                                        {t(leaf.label, locale)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              <div className="w-full mt-6">
                <BookingCTA variant="primary" className="w-full text-center">
                  {tNav("cta")}
                </BookingCTA>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
