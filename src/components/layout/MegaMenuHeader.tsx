"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import LocaleSelector from "@/components/ui/LocaleSelector";
import MegaMenuPanel from "./MegaMenuPanel";
import { navTop, t, type NavTop } from "./navConfig";

type MobileView = { type: "top" } | { type: "sub"; itemKey: string };

type Props = {
  /** "transparent" = light text on dark hero. "transparent-dark" = dark text on light hero. "solid" = champagne bg + dark text. */
  variant?: "transparent" | "transparent-dark" | "solid";
  /** "absolute" anchors to the top of its parent (e.g. inside a hero); "fixed" sticks to viewport top. */
  position?: "absolute" | "fixed";
  /** When set with position="fixed", the header stays hidden until the element with this id has been scrolled past, then slides in from the top. */
  hideUntilScrollPastId?: string;
};

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className={className}>
      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const viewTransition = { duration: 0.36, ease: [0.32, 0.72, 0, 1] as const };

const viewVariants: Variants = {
  initial: (d: number) => ({ x: d === 1 ? "40%" : "-40%", opacity: 0, filter: "blur(8px)" }),
  animate: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (d: number) => ({ x: d === 1 ? "-40%" : "40%", opacity: 0, filter: "blur(8px)" }),
};

export default function MegaMenuHeader({
  variant = "solid",
  position = "fixed",
  hideUntilScrollPastId,
}: Props = {}) {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>({ type: "top" });
  const [direction, setDirection] = useState<1 | -1>(1);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  // For position="fixed" with hideUntilScrollPastId: track whether sentinel is in view
  const [revealed, setRevealed] = useState(!hideUntilScrollPastId);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (document.body.style.position === "fixed") return;
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sentinel observer for the "appear after hero" sticky header.
  useEffect(() => {
    if (!hideUntilScrollPastId) return;
    const el = document.getElementById(hideUntilScrollPastId);
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Reveal once the sentinel has scrolled out of view (above the viewport).
        const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setRevealed(past);
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hideUntilScrollPastId]);

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

  const closeMobile = () => {
    setMobileOpen(false);
    setTimeout(() => {
      setMobileView({ type: "top" });
      setDirection(1);
    }, 300);
  };

  const pushSub = (itemKey: string) => {
    setDirection(1);
    setMobileView({ type: "sub", itemKey });
  };

  const popToTop = () => {
    setDirection(-1);
    setMobileView({ type: "top" });
  };

  const currentSubItem: NavTop | undefined =
    mobileView.type === "sub" ? navTop.find((i) => i.key === mobileView.itemKey) : undefined;

  // Effective visual variant: any open menu forces "solid".
  const menuOpen = !!activeMega || mobileOpen;
  const effectiveVariant = menuOpen ? "solid" : variant;
  const isTransparent = effectiveVariant === "transparent" || effectiveVariant === "transparent-dark";
  const isLightText = effectiveVariant === "transparent"; // only original transparent gets light text

  const headerBgClass = mobileOpen
    ? "bg-champagne"
    : isTransparent
      ? "bg-transparent"
      : "bg-champagne";

  const navTextClass = isLightText ? "text-champagne" : "text-black";
  const navHoverClass = isLightText ? "hover:text-white" : "hover:text-main";
  const underlineClass = isLightText ? "after:bg-champagne" : "after:bg-main";
  const activeTextClass = isLightText ? "text-white" : "text-main";
  const hamburgerColorClass = isLightText ? "bg-champagne" : "bg-black";
  const logoSrc = isLightText ? "/brand/LogoFullLight.svg" : "/brand/LogoFullDark.svg";

  const positionClass = position === "absolute" ? "absolute" : "fixed";
  const shadowClass = isTransparent
    ? "shadow-[0_1px_0_transparent]"
    : scrolled || activeMega
      ? "shadow-[0_1px_0_var(--color-black-10)]"
      : "shadow-[0_1px_0_transparent]";

  // Slide-in animation only for fixed reveal-on-scroll variant.
  const initialAnim = hideUntilScrollPastId
    ? { y: -100, opacity: 0 }
    : { y: position === "fixed" ? -100 : 0, opacity: position === "fixed" ? 0 : 1 };
  const animateAnim = revealed ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 };

  return (
    <motion.header
      className={`${positionClass} top-0 left-0 right-0 z-[999] transition-[background,box-shadow] duration-300 ${headerBgClass} ${shadowClass}`}
      initial={initialAnim}
      animate={animateAnim}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={scheduleClose}
      style={{
        pointerEvents: hideUntilScrollPastId && !revealed ? "none" : "auto",
      }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity duration-300" onClick={closeMobile}>
            <Image
              src={logoSrc}
              alt="GENEVITY"
              width={180}
              height={40}
              className="h-8 lg:h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 lg:gap-4 xl:gap-8">
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
                    className={`relative body-m transition-colors duration-300 flex items-center gap-1 ${
                      isActive ? activeTextClass : `${navTextClass} ${navHoverClass}`
                    } after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] ${underlineClass} after:transition-all after:duration-300 ${
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

          <div className={`hidden lg:flex items-center gap-4 shrink-0 ${navTextClass}`}>
            <LocaleSelector />
            <BookingCTA variant={isLightText ? "secondary" : "primary"}>{tNav("cta")}</BookingCTA>
          </div>

          {/* Mobile: locale + hamburger */}
          <div className={`lg:hidden flex items-center gap-3 ${navTextClass}`}>
            <LocaleSelector />
            <button
              className="flex flex-col gap-1.5 p-2 cursor-pointer"
              onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <motion.span
                className={`w-6 h-0.5 ${hamburgerColorClass} block`}
                animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className={`w-6 h-0.5 ${hamburgerColorClass} block`}
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className={`w-6 h-0.5 ${hamburgerColorClass} block`}
                animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              />
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop Mega Panel + backdrop */}
      <AnimatePresence>
        {activeItem?.mega && (
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="hidden lg:block absolute left-0 right-0 top-full z-[998]"
          >
            <MegaMenuPanel item={activeItem} onNavigate={() => setActiveMega(null)} />
            {/* Backdrop — starts below panel, covers rest of page */}
            <motion.div
              key="mega-backdrop"
              className="absolute left-0 right-0 top-full h-screen bg-black/30 backdrop-blur-[2px] z-[-1]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setActiveMega(null)}
              onMouseEnter={() => setActiveMega(null)}
              aria-hidden="true"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu — iOS-style page stack */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-[998] overflow-hidden"
            style={{ backgroundColor: "#FAF9F6" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              {mobileView.type === "top" && (
                <motion.div
                  key="top"
                  custom={direction}
                  variants={viewVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={viewTransition}
                  className="absolute inset-0 overflow-y-auto"
                >
                  <div className="flex flex-col items-start gap-1 px-4 sm:px-6 pt-6 pb-24">
                    {navTop.map((item, i) => {
                      const hasMega = !!item.mega;
                      const rowClass =
                        "w-full flex items-center justify-between py-4 heading-3 text-black cursor-pointer text-left";
                      return (
                        <motion.div
                          key={item.key}
                          className="w-full border-b border-black-10"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.06 + i * 0.035, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {hasMega ? (
                            <button
                              type="button"
                              onClick={() => pushSub(item.key)}
                              aria-label={`Open ${t(item.label, locale)} submenu`}
                              className={rowClass}
                            >
                              <span>{t(item.label, locale)}</span>
                              <ChevronRight className="text-black-40" />
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={closeMobile}
                              className={rowClass}
                            >
                              <span>{t(item.label, locale)}</span>
                            </Link>
                          )}
                        </motion.div>
                      );
                    })}
                    <motion.div
                      className="w-full mt-6"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.28 }}
                    >
                      <BookingCTA variant="primary" className="w-full text-center">
                        {tNav("cta")}
                      </BookingCTA>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {mobileView.type === "sub" && currentSubItem?.mega && (
                <motion.div
                  key={`sub-${mobileView.itemKey}`}
                  custom={direction}
                  variants={viewVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={viewTransition}
                  className="absolute inset-0 overflow-y-auto"
                >
                  <div className="px-4 sm:px-6 pt-4 pb-24">
                    <button
                      onClick={popToTop}
                      className="flex items-center gap-1.5 py-2 -ml-1 body-l text-black-60 hover:text-main transition-colors cursor-pointer"
                    >
                      <ChevronLeft />
                      <span>{t({ ua: "Назад", ru: "Назад", en: "Back" }, locale)}</span>
                    </button>

                    <Link
                      href={currentSubItem.href}
                      onClick={closeMobile}
                      className="group mt-3 inline-flex items-center gap-1.5 heading-3 text-black-60 active:text-main transition-colors"
                    >
                      <span>{t({ ua: "Всі послуги", ru: "Все услуги", en: "All services" }, locale)}</span>
                      <ChevronRight className="text-black-40 w-3 h-3" />
                    </Link>

                    <div className="flex flex-col gap-8 mt-8">
                      {currentSubItem.mega.categories.map((cat, ci) => (
                        <motion.div
                          key={cat.key}
                          className="flex flex-col gap-4"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + ci * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Link
                            href={cat.href}
                            onClick={closeMobile}
                            className="inline-flex items-center gap-1.5 heading-3 text-black"
                          >
                            <span>{t(cat.label, locale)}</span>
                            <ChevronRight className="text-black-40 w-3 h-3" />
                          </Link>
                          <ul className="flex flex-col gap-4 pl-3 border-l border-black-10">
                            {cat.items.map((leaf) => (
                              <li key={leaf.key}>
                                <Link
                                  href={leaf.href}
                                  onClick={closeMobile}
                                  className="body-l text-black-60 hover:text-main transition-colors"
                                >
                                  {t(leaf.label, locale)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                      {currentSubItem.mega.extra && (
                        <motion.div
                          className="flex flex-col gap-3"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + currentSubItem.mega.categories.length * 0.04, duration: 0.3 }}
                        >
                          <p className="body-strong text-black">
                            {t(currentSubItem.mega.extra.label, locale)}
                          </p>
                          <ul className="flex flex-col gap-2 pl-3 border-l border-black-10">
                            {currentSubItem.mega.extra.items.map((leaf) => (
                              <li key={leaf.key}>
                                <Link
                                  href={leaf.href}
                                  onClick={closeMobile}
                                  className="body-m text-black-60 hover:text-main transition-colors"
                                >
                                  {t(leaf.label, locale)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
