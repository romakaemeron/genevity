"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import BookingCTA from "@/components/ui/BookingCTA";
import LocaleSelector from "@/components/ui/LocaleSelector";

export default function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Skip if body is fixed (modal open) — keep current scrolled state
      if (document.body.style.position === "fixed") return;
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: t("about"), href: "#about" },
    { label: t("services"), href: "#equipment" },
    { label: t("doctors"), href: "#doctors" },
    { label: t("contacts"), href: "#contacts" },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-999 transition-shadow duration-200 ${
        mobileOpen
          ? "bg-champagne"
          : "bg-champagne/90 backdrop-blur-xl"
      } ${
        scrolled
          ? "shadow-[0_1px_0_var(--color-black-10)]"
          : "shadow-[0_1px_0_transparent]"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center">
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
          <div className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative body-l text-black hover:text-main transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-main after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <LocaleSelector />
            <BookingCTA variant="primary">
              {t("cta")}
            </BookingCTA>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
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
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-[998]"
            style={{ backgroundColor: "#FAF9F6" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-start gap-6 px-4 sm:px-6 pt-10">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                >
                  <Link
                    href={item.href}
                    className="heading-3 text-black hover:text-main transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="w-full mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.25 }}
              >
                <BookingCTA variant="primary" className="w-full text-center">
                  {t("cta")}
                </BookingCTA>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                <LocaleSelector />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
