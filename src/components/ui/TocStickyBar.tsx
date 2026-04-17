"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface TocItem {
  key: string;
  label: string;
}

interface Props {
  items: TocItem[];
  showAfter?: number;
}

const SCROLL_OFFSET = 140; // navbar + sticky bar + spacing

export default function TocStickyBar({ items, showAfter = 400 }: Props) {
  const [visible, setVisible] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = items
      .map((item) => ({
        key: item.key,
        label: item.label,
        el: document.getElementById(`section-${item.key}`),
      }))
      .filter((e) => e.el);

    const onScroll = () => {
      setVisible(window.scrollY > showAfter);

      let current = "";
      for (const { label, el } of elements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= SCROLL_OFFSET + 20) {
            current = label;
          }
        }
      }
      setActiveLabel(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items, showAfter]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  const scrollTo = (key: string) => {
    const el = document.getElementById(`section-${key}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setDropdownOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && activeLabel && (
        <motion.div
          ref={barRef}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 lg:top-20 left-0 right-0 z-[900] bg-champagne border-b border-line shadow-sm"
        >
          <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex justify-start lg:justify-end">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="py-2.5 flex items-center gap-2 cursor-pointer"
              >
                <span className="body-m text-main hover:text-muted font-semibold truncate max-w-[500px]">
                  {activeLabel}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-1.5 bg-champagne border border-line rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-2 min-w-[260px] z-10 flex flex-col gap-0.5"
                  >
                    {items.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => scrollTo(item.key)}
                        className={`block w-full text-left px-3 py-2 rounded-[var(--radius-sm)] body-m transition-colors cursor-pointer ${
                          activeLabel === item.label
                            ? "text-main font-semibold bg-main/5"
                            : "text-muted hover:text-black hover:bg-black-5"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
