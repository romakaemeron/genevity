"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LOCALES = [
  { key: "uk", label: "UA", flag: "🇺🇦" },
  { key: "ru", label: "RU", flag: "🇷🇺" },
  { key: "en", label: "EN", flag: "🇬🇧" },
] as const;

export type LocaleKey = "uk" | "ru" | "en";

interface Props {
  children: (locale: LocaleKey) => React.ReactNode;
  completeness?: Record<LocaleKey, "full" | "partial" | "empty">;
}

export default function TranslationTabs({ children, completeness }: Props) {
  const [active, setActive] = useState<LocaleKey>("uk");

  return (
    <div>
      <Tabs value={active} onValueChange={(v) => setActive(v as LocaleKey)} className="mb-6">
        <TabsList className="h-auto bg-transparent border-b border-border rounded-none p-0 gap-0 w-full justify-start">
          {LOCALES.map(({ key, label }) => {
            const status = completeness?.[key];
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="relative px-4 py-2.5 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground -mb-px bg-transparent shadow-none"
              >
                {label}
                {status && (
                  <span
                    className={`absolute top-2 right-1 w-1.5 h-1.5 rounded-full ${
                      status === "full" ? "bg-green-500" : status === "partial" ? "bg-amber-400" : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      {/* All locales stay mounted so their form fields are included in FormData */}
      {LOCALES.map(({ key }) => (
        <div key={key} className={active === key ? "" : "hidden"}>
          {children(key)}
        </div>
      ))}
    </div>
  );
}

export { LOCALES };
