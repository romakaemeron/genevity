"use client";

import { useState } from "react";
import { LOCALES, type LocaleKey } from "./translation-tabs";
import { Trash2, Plus } from "lucide-react";

type LocaleString = { uk: string; ru: string; en: string };
type LocaleArray = { uk: string[]; ru: string[]; en: string[] };

/** Compact tab bar shared across all locale inputs inside a section */
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

/** Single-line locale-aware text input with built-in tab switcher */
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
  const [active, setActive] = useState<LocaleKey>("uk");
  const inputClass = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all placeholder:text-stone-light";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wider">{label}</label>
          <MiniTabs active={active} onChange={setActive} />
        </div>
      )}
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

/** Array of strings, per locale (each item is edited in the active locale) */
export function LocaleStringList({
  label, value, onChange, itemPlaceholder = "Item",
}: {
  label?: string;
  value: LocaleArray;
  onChange: (v: LocaleArray) => void;
  itemPlaceholder?: string;
}) {
  const [active, setActive] = useState<LocaleKey>("uk");
  const items = value?.[active] || [];

  const updateItem = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange({ ...value, [active]: next });
  };
  const addItem = () => onChange({ ...value, [active]: [...items, ""] });
  const removeItem = (i: number) => {
    const next = items.filter((_, idx) => idx !== i);
    onChange({ ...value, [active]: next });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && <label className="text-[11px] font-medium text-muted uppercase tracking-wider">{label}</label>}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted">{items.length} items · {active.toUpperCase()}</span>
          <MiniTabs active={active} onChange={setActive} />
        </div>
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
