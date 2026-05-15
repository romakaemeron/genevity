"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocItem } from "./ArticleBody";

interface Props {
  items: TocItem[];
  label: string;
}

export default function BlogTocBar({ items, label }: Props) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length < 2) return;
    const onScroll = () => {
      setVisible(window.scrollY > 300);
      let current = "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 160) current = item.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setOpen(false);
  }

  if (items.length < 2) return null;

  const activeItem = items.find((i) => i.id === active);

  return (
    <div
      ref={barRef}
      className={`lg:hidden fixed top-16 left-0 right-0 z-[900] bg-champagne border-b border-black-10 shadow-sm transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full py-2.5 flex items-center justify-between gap-3 text-left"
        >
          <span className="body-s font-medium text-main truncate">
            {label}{activeItem ? ` — ${activeItem.text}` : ""}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-black-40 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="pb-3 flex flex-col gap-0.5 border-t border-black-10 pt-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`text-left w-full px-3 py-2 rounded-lg body-s transition-colors ${
                  active === item.id ? "text-main font-medium bg-main/5" : "text-black-60 hover:text-main hover:bg-main/5"
                } ${item.level === 3 ? "pl-6" : ""}`}
              >
                {item.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
