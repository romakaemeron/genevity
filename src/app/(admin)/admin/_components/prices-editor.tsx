"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { updatePriceItem } from "../_actions/phase2";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";

export interface PriceItem {
  id?: string;
  name_uk: string;
  name_ru: string;
  name_en: string;
  price: string;
  is_visible?: boolean;
  duration?: string | null;
  subcategory_label?: string | null;
}

export interface PriceCategory {
  id?: string;
  slug: string;
  label_uk: string;
  label_ru: string;
  label_en: string;
  link: string | null;
  items: PriceItem[];
}

interface Props { initial: PriceCategory[] }

export default function PricesEditor({ initial }: Props) {
  const [cats, setCats] = useState<PriceCategory[]>(initial);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [activeSlug, setActiveSlug] = useState(initial[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = cats.find((c) => c.slug === activeSlug) ?? cats[0];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = q ? cats.flatMap((c) => c.items) : (active?.items ?? []);
    return q ? source.filter((i) => i.name_uk.toLowerCase().includes(q)) : source;
  }, [cats, active, query]);

  const patch = (id: string, p: Partial<PriceItem>) => {
    setCats((prev) => prev.map((c) => ({
      ...c,
      items: c.items.map((i) => (i.id === id ? { ...i, ...p } : i)),
    })));
  };

  const save = (item: PriceItem) => {
    if (!item.id) return;
    startTransition(async () => {
      await updatePriceItem({
        id: item.id!,
        name_uk: item.name_uk,
        name_ru: item.name_ru,
        name_en: item.name_en,
        price: item.price,
        is_visible: item.is_visible ?? true,
      });
      setSavedId(item.id!);
      setTimeout(() => setSavedId(null), 1500);
    });
  };

  const nameField = (`name_${locale}`) as "name_uk" | "name_ru" | "name_en";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <MiniTabs active={locale} onChange={setLocale} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all categories…"
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-md text-sm"
        />
      </div>

      {!query && (
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActiveSlug(c.slug)}
              className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${
                activeSlug === c.slug ? "bg-neutral-900 text-white" : "bg-neutral-100"
              }`}
            >
              {c.label_uk} <span className="opacity-60">{c.items.length}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        {rows.length} rows. Editing a row marks it as a manual override — the
        next spreadsheet import will keep your name, price, notes and
        translations (visibility is always yours to control here) but will
        still update its category, subcategory, duration and RoApp link from
        the sheet.
      </p>

      <div className="divide-y border rounded-md">
        {rows.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2">
            <button
              type="button"
              onClick={() => { patch(item.id!, { is_visible: !(item.is_visible ?? true) }); }}
              title={item.is_visible ?? true ? "Visible" : "Hidden"}
              className="shrink-0 text-neutral-500 cursor-pointer"
            >
              {item.is_visible ?? true ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <input
              value={item[nameField] ?? ""}
              onChange={(e) => patch(item.id!, { [nameField]: e.target.value })}
              className="flex-1 px-2 py-1.5 border rounded text-sm"
            />
            <input
              value={item.price}
              onChange={(e) => patch(item.id!, { price: e.target.value })}
              className="w-28 px-2 py-1.5 border rounded text-sm text-right"
            />
            <button
              type="button"
              onClick={() => save(item)}
              disabled={pending}
              className="shrink-0 px-3 py-1.5 text-sm bg-neutral-900 text-white rounded cursor-pointer disabled:opacity-50"
            >
              {savedId === item.id ? <Check size={14} /> : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
