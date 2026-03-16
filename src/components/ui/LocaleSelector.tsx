"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  ua: "UA",
  ru: "RU",
  en: "EN",
};

export default function LocaleSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (newLocale: string) => {
    // Replace the current locale prefix in pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setOpen(false);
  };

  const otherLocales = routing.locales.filter((l) => l !== locale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg body-m font-medium text-black hover:text-main transition-colors cursor-pointer"
      >
        {localeLabels[locale] || locale.toUpperCase()}
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-black-10 overflow-hidden min-w-[56px] z-50">
          {otherLocales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className="w-full px-3 py-2 body-m font-medium text-black hover:bg-main/5 hover:text-main transition-colors text-center cursor-pointer"
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
