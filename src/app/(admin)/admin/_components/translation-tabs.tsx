"use client";

import { useState } from "react";

const LOCALES = [
  { key: "uk", label: "UA", flag: "🇺🇦" },
  { key: "ru", label: "RU", flag: "🇷🇺" },
  { key: "en", label: "EN", flag: "🇬🇧" },
] as const;

export type LocaleKey = "uk" | "ru" | "en";

interface Props {
  children: (locale: LocaleKey) => React.ReactNode;
  /** Check which locales have content filled */
  completeness?: Record<LocaleKey, "full" | "partial" | "empty">;
}

export default function TranslationTabs({ children, completeness }: Props) {
  const [active, setActive] = useState<LocaleKey>("uk");

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-line">
        {LOCALES.map(({ key, label }) => {
          const status = completeness?.[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                active === key
                  ? "text-main border-b-2 border-main -mb-px"
                  : "text-muted hover:text-ink"
              }`}
            >
              {label}
              {status && (
                <span className={`absolute top-2 right-1 w-1.5 h-1.5 rounded-full ${
                  status === "full" ? "bg-success" : status === "partial" ? "bg-warning" : "bg-stone-light"
                }`} />
              )}
            </button>
          );
        })}
      </div>
      {/* Render ALL locales at once and just toggle visibility. If we unmounted the
          inactive tabs, their form fields would be missing from the submitted FormData
          and server-side NOT NULL columns (name_uk etc.) would explode. */}
      {LOCALES.map(({ key }) => (
        <div key={key} className={active === key ? "" : "hidden"}>
          {children(key)}
        </div>
      ))}
    </div>
  );
}

export { LOCALES };
