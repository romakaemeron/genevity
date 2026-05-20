"use client";

import { Languages, ChevronDown, Check } from "lucide-react";
import { useAdminLocale } from "../_i18n/context";
import type { AdminLocale } from "../_i18n/strings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LOCALES: { key: AdminLocale; label: string; short: string }[] = [
  { key: "uk", label: "Українська", short: "UA" },
  { key: "ru", label: "Русский",    short: "RU" },
  { key: "en", label: "English",    short: "EN" },
];

export default function LocaleSelector() {
  const { locale, setLocale } = useAdminLocale();
  const current = LOCALES.find((l) => l.key === locale) ?? LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md h-8 text-sm",
          "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent",
          "transition-colors cursor-pointer outline-none select-none",
        )}
      >
        <Languages size={15} className="shrink-0" />
        <span className="flex-1 text-left truncate">{current.label}</span>
        <ChevronDown size={12} className="shrink-0 opacity-50" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-40 p-1 flex flex-col gap-0.5">
        {LOCALES.map((opt) => (
          <DropdownMenuItem
            key={opt.key}
            onClick={() => setLocale(opt.key)}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md cursor-pointer text-sm",
              locale === opt.key && "font-medium",
            )}
          >
            <span className="flex-1">{opt.label}</span>
            {locale === opt.key && <Check size={12} className="shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
