"use client";

import { createContext, useContext, useState } from "react";
import { LOCALES, type LocaleKey } from "./translation-tabs";
import { Trash2, Plus } from "lucide-react";

type LocaleString = { uk: string; ru: string; en: string };
type LocaleArray = { uk: string[]; ru: string[]; en: string[] };

/** Shared locale context — active language for all inputs inside a section */
export const SectionLocaleContext = createContext<LocaleKey>("uk");

/** Wrap one section's expanded content with this to get a single locale switcher */
export function SectionLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<LocaleKey>("uk");
  return (
    <SectionLocaleContext.Provider value={locale}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-champagne/30">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Language</span>
        <MiniTabs active={locale} onChange={setLocale} />
      </div>
      {children}
    </SectionLocaleContext.Provider>
  );
}

/** Compact tab bar — used by SectionLocaleProvider and any standalone locale pickers */
export function MiniTabs({ active, onChange }: { active: LocaleKey; onChange: (l: LocaleKey) => void }) {
  return (
    <div className="inline-flex gap-0.5 p-0.5 rounded-lg bg-champagne text-[11px] font-medium">
      {LOCALES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-2 py-1 rounded-md transition-colors ${
            active === key ? "bg-champagne-darker text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Single-line or multiline locale-aware text input — reads active locale from context */
export function LocaleText({
  label, value, onChange, placeholder, multiline = false, rows = 3,
}: {
  label?: string;
  value: LocaleString;
  onChange: (v: LocaleString) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const active = useContext(SectionLocaleContext);
  const inputClass = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all placeholder:text-stone-light";

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-medium text-muted uppercase tracking-wider">{label}</label>}
      {multiline ? (
        <textarea
          rows={rows}
          value={value?.[active] || ""}
          onChange={(e) => onChange({ ...value, [active]: e.target.value })}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value?.[active] || ""}
          onChange={(e) => onChange({ ...value, [active]: e.target.value })}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

/** Convert either LocaleArray or L[] (per-item objects from seed scripts) to LocaleArray */
function normalizeToLocaleArray(val: any): LocaleArray {
  if (!val) return { uk: [], ru: [], en: [] };
  if (!Array.isArray(val) && Array.isArray(val.uk)) return val as LocaleArray;
  if (Array.isArray(val)) {
    const uk: string[] = [], ru: string[] = [], en: string[] = [];
    for (const item of val) {
      if (typeof item === "string") { uk.push(item); ru.push(item); en.push(item); }
      else if (item && typeof item === "object") { uk.push(item.uk || ""); ru.push(item.ru || ""); en.push(item.en || ""); }
    }
    return { uk, ru, en };
  }
  return { uk: [], ru: [], en: [] };
}

/** List of strings per locale — reads active locale from context */
export function LocaleStringList({
  label, value, onChange, itemPlaceholder = "Item",
}: {
  label?: string;
  value: LocaleArray | any;
  onChange: (v: LocaleArray) => void;
  itemPlaceholder?: string;
}) {
  const active = useContext(SectionLocaleContext);
  const normalized = normalizeToLocaleArray(value);
  const items = normalized[active] || [];

  const updateItem = (i: number, v: string) => {
    const next = [...items]; next[i] = v;
    onChange({ ...normalized, [active]: next });
  };
  const addItem = () => onChange({ ...normalized, [active]: [...items, ""] });
  const removeItem = (i: number) => onChange({ ...normalized, [active]: items.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && <label className="text-[11px] font-medium text-muted uppercase tracking-wider">{label}</label>}
        <span className="text-[11px] text-muted">{items.length} items</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={itemPlaceholder}
              className="flex-1 px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="px-2 rounded-lg text-muted hover:text-error hover:bg-error-light transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-main hover:bg-main/10 transition-colors cursor-pointer self-start"
        >
          <Plus size={12} /> Add item
        </button>
      </div>
    </div>
  );
}

/** Empty locale values */
export const emptyLocaleString = (): LocaleString => ({ uk: "", ru: "", en: "" });
export const emptyLocaleArray = (): LocaleArray => ({ uk: [], ru: [], en: [] });

export type { LocaleString, LocaleArray };
