"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import LocaleSelector from "@/components/ui/LocaleSelector";
import SearchTrigger from "@/components/ui/SearchTrigger";
import SearchModal from "@/components/ui/SearchModal";
import MegaMenuPanel from "./MegaMenuPanel";
import { navTop, type NavTop } from "./navConfig";

type MobileView = "top" | string; // "top" = main nav, string = itemKey for sub-panel

type Props = {
  variant?: "transparent" | "transparent-dark" | "solid";
  position?: "absolute" | "fixed";
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

export default function MegaMenuHeader({
  variant = "solid",
  position = "fixed",
  hideUntilScrollPastId,
}: Props = {}) {
  const tNav = useTranslations("nav_mega");
  const tLabels = useTranslations("labels");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("top");
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(!hideUntilScrollPastId);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (document.body.style.position === "fixed") return;
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!hideUntilScrollPastId) return;
    const el = document.getElementById(hideUntilScrollPastId);
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
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
    setTimeout(() => setMobileView("top"), 300);
  };

  const menuOpen = !!activeMega || mobileOpen;
  const effectiveVariant = menuOpen ? "solid" : variant;
  const isTransparent = effectiveVariant === "transparent" || effectiveVariant === "transparent-dark";
  const isLightText = effectiveVariant === "transparent";

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

  // Slide-in CSS: sentinel variant uses inline transition; fixed-on-mount uses CSS animation class
  const headerStyle: React.CSSProperties | undefined = hideUntilScrollPastId
    ? {
        transform: revealed ? "none" : "translateY(-100%)",
        opacity: revealed ? "1" : "0",
        transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: revealed ? "auto" : "none",
      }
    : undefined;

  const headerAnimClass = (position === "fixed" && !hideUntilScrollPastId) ? "header-fixed-appear" : "";

  const currentSubItem: NavTop | undefined =
    mobileView !== "top" ? navTop.find((i) => i.key === mobileView) : undefined;

  return (
    <header
      className={`${positionClass} top-0 left-0 right-0 z-[999] transition-[background,box-shadow] duration-300 ${headerBgClass} ${shadowClass} ${headerAnimClass}`}
      style={headerStyle}
      onMouseLeave={scheduleClose}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity duration-300" onClick={closeMobile}>
            <Image src={logoSrc} alt="GENEVITY" width={180} height={40} className="h-8 lg:h-9 w-auto" priority />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 lg:gap-3 xl:gap-6">
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
                    {tNav(item.key)}
                    {hasMega && (
                      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}>
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className={`hidden lg:flex items-center gap-2 shrink-0 ${navTextClass}`}>
            <LocaleSelector />
            <SearchTrigger onOpen={() => setSearchOpen(true)} variant={isLightText ? "outline-light" : "ghost"} />
            <BookingCTA ctaKey="megamenu" variant={isLightText ? "secondary" : "primary"} size="md">{tNav("cta")}</BookingCTA>
          </div>

          {/* Mobile: locale + search + hamburger */}
          <div className={`lg:hidden flex items-center gap-3 ${navTextClass}`}>
            <LocaleSelector />
            <SearchTrigger onOpen={() => setSearchOpen(true)} variant={isLightText ? "outline-light" : "ghost"} />
            <button
              className="flex flex-col gap-1.5 p-2 cursor-pointer"
              onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`w-6 h-0.5 ${hamburgerColorClass} block transition-transform duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-6 h-0.5 ${hamburgerColorClass} block transition-opacity duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`w-6 h-0.5 ${hamburgerColorClass} block transition-transform duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop Mega Panel + backdrop — conditionally rendered so CSS animation fires fresh */}
      {activeMega && activeItem?.mega && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="hidden lg:block absolute left-0 right-0 top-full z-[998]"
        >
          <MegaMenuPanel item={activeItem} onNavigate={() => setActiveMega(null)} />
          <div
            className="megamenu-backdrop absolute left-0 right-0 top-full h-screen bg-black/30 backdrop-blur-[2px] z-[-1]"
            onClick={() => setActiveMega(null)}
            onMouseEnter={() => setActiveMega(null)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Mobile Menu — always mounted, shown/hidden via opacity + pointer-events for perf */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 z-[998] overflow-hidden bg-champagne transition-opacity duration-220 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div className="relative h-full overflow-hidden">
          {/* Top view */}
          <div
            className="absolute inset-0 overflow-y-auto"
            style={{
              transform: mobileView === "top" ? "none" : "translateX(-40%)",
              opacity: mobileView === "top" ? 1 : 0,
              filter: mobileView === "top" ? "blur(0px)" : "blur(8px)",
              transition: "transform 0.36s cubic-bezier(0.32,0.72,0,1), opacity 0.36s cubic-bezier(0.32,0.72,0,1), filter 0.36s cubic-bezier(0.32,0.72,0,1)",
              pointerEvents: mobileView === "top" ? "auto" : "none",
            }}
          >
            <div className="flex flex-col items-start gap-1 px-4 sm:px-6 pt-6 pb-24">
              {navTop.map((item, i) => {
                const hasMega = !!item.mega;
                const rowClass = "w-full flex items-center justify-between py-4 heading-3 text-black cursor-pointer text-left";
                return (
                  <div
                    key={item.key}
                    className="w-full border-b border-black-10"
                    style={{
                      opacity: mobileOpen ? 1 : 0,
                      animation: mobileOpen ? `grid-enter 0.28s ${0.06 + i * 0.035}s both` : "none",
                    }}
                  >
                    {hasMega ? (
                      <button type="button" onClick={() => setMobileView(item.key)} className={rowClass}>
                        <span>{tNav(item.key)}</span>
                        <ChevronRight className="text-black-40" />
                      </button>
                    ) : (
                      <Link href={item.href} onClick={closeMobile} className={rowClass}>
                        <span>{tNav(item.key)}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
              <div
                className="w-full mt-6"
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  animation: mobileOpen ? "grid-enter 0.28s 0.3s both" : "none",
                }}
              >
                <BookingCTA ctaKey="megamenuMobile" variant="primary" className="w-full text-center">
                  {tNav("cta")}
                </BookingCTA>
              </div>
            </div>
          </div>

          {/* Sub views — one per mega item, CSS transform controls which is visible */}
          {navTop.filter((i) => !!i.mega).map((item) => {
            const isActive = mobileView === item.key;
            return (
              <div
                key={item.key}
                className="absolute inset-0 overflow-y-auto"
                style={{
                  transform: isActive ? "none" : "translateX(40%)",
                  opacity: isActive ? 1 : 0,
                  filter: isActive ? "blur(0px)" : "blur(8px)",
                  transition: "transform 0.36s cubic-bezier(0.32,0.72,0,1), opacity 0.36s cubic-bezier(0.32,0.72,0,1), filter 0.36s cubic-bezier(0.32,0.72,0,1)",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div className="px-4 sm:px-6 pt-4 pb-24">
                  <button
                    onClick={() => setMobileView("top")}
                    className="flex items-center gap-1.5 py-2 -ml-1 body-l text-black-60 hover:text-main transition-colors cursor-pointer"
                  >
                    <ChevronLeft />
                    <span>{tLabels("prev")}</span>
                  </button>

                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className="group mt-3 inline-flex items-center gap-1.5 heading-3 text-black-60 active:text-main transition-colors"
                  >
                    <span>{tNav("allServices")}</span>
                    <ChevronRight className="text-black-40 w-3 h-3" />
                  </Link>

                  <div className="flex flex-col gap-8 mt-8">
                    {item.mega!.categories.map((cat, ci) => (
                      <div
                        key={cat.key}
                        className="flex flex-col gap-4"
                        style={{
                          animation: isActive ? `grid-enter 0.3s ${0.08 + ci * 0.04}s both` : "none",
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        {cat.href ? (
                          <Link href={cat.href} onClick={closeMobile} className="inline-flex items-center gap-1.5 heading-3 text-black">
                            <span>{tNav(cat.key)}</span>
                            <ChevronRight className="text-black-40 w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 heading-3 text-black cursor-default select-none">
                            <span>{tNav(cat.key)}</span>
                          </span>
                        )}
                        <ul className="flex flex-col gap-4 pl-3 border-l border-black-10">
                          {cat.items.map((leaf) => (
                            <li key={leaf.key}>
                              <Link href={leaf.href} onClick={closeMobile} className="body-l text-black-60 hover:text-main transition-colors">
                                {tNav(leaf.key)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {item.mega!.extra && (
                      <div
                        className="flex flex-col gap-3"
                        style={{
                          animation: isActive ? `grid-enter 0.3s ${0.08 + item.mega!.categories.length * 0.04}s both` : "none",
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        <p className="body-strong text-black">{tNav("more")}</p>
                        <ul className="flex flex-col gap-2 pl-3 border-l border-black-10">
                          {item.mega!.extra.items.map((leaf) => (
                            <li key={leaf.key}>
                              <Link href={leaf.href} onClick={closeMobile} className="body-m text-black-60 hover:text-main transition-colors">
                                {tNav(leaf.key)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
