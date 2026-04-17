"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ui } from "@/lib/ui-strings";

interface TocItem {
  key: string;
  label: string;
}

interface Props {
  items: TocItem[];
  locale?: string;
}

export default function TocDropdown({ items, locale = "ua" }: Props) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden sticky top-16 z-20 bg-champagne border-b border-line">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 body-strong text-black cursor-pointer"
      >
        <span>{ui("toc", locale)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="flex flex-col border-t border-line">
          {items.map((item) => (
            <li key={item.key}>
              <a
                href={`#section-${item.key}`}
                className="block px-4 py-2.5 body-m text-muted hover:text-main transition-colors"
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    document.getElementById(`section-${item.key}`)?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
