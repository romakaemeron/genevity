"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Check, ChevronRight } from "lucide-react";
import { savePriceCategories } from "../_actions/phase2";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";

export interface PriceItem {
  id?: string;
  name_uk: string;
  name_ru: string;
  name_en: string;
  price: string;
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

const emptyItem = (): PriceItem => ({ name_uk: "", name_ru: "", name_en: "", price: "" });
const emptyCat = (): PriceCategory => ({ slug: "", label_uk: "", label_ru: "", label_en: "", link: null, items: [] });

interface Props {
  initial: PriceCategory[];
}

export default function PricesEditor({ initial }: Props) {
  const [cats, setCats] = useState<PriceCategory[]>(initial);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const updCat = (i: number, patch: Partial<PriceCategory>) => {
    const n = [...cats]; n[i] = { ...n[i], ...patch }; setCats(n);
  };
  const removeCat = (i: number) => {
    if (!confirm("Remove this category and all its items?")) return;
    setCats(cats.filter((_, idx) => idx !== i));
    if (expanded === i) setExpanded(null);
  };
  const addCat = () => { setCats([...cats, emptyCat()]); setExpanded(cats.length); };

  const updItem = (ci: number, ii: number, patch: Partial<PriceItem>) => {
    const n = [...cats]; n[ci] = { ...n[ci], items: [...n[ci].items] };
    n[ci].items[ii] = { ...n[ci].items[ii], ...patch }; setCats(n);
  };
  const removeItem = (ci: number, ii: number) => {
    const n = [...cats]; n[ci] = { ...n[ci], items: n[ci].items.filter((_, idx) => idx !== ii) }; setCats(n);
  };
  const addItem = (ci: number) => {
    const n = [...cats]; n[ci] = { ...n[ci], items: [...n[ci].items, emptyItem()] }; setCats(n);
  };

  const save = () => {
    // Strip empty categories/items
    const clean = cats
      .filter((c) => c.slug && c.label_uk)
      .map((c) => ({ ...c, items: c.items.filter((it) => it.name_uk && it.price) }));
    startTransition(async () => {
      await savePriceCategories(clean);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  const labelField = `label_${locale}` as const;
  const nameField = `name_${locale}` as const;
  const inputCls = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";

  const { getRowProps: getCatRowProps, getHandleProps: getCatHandleProps } = useReorderable(cats, setCats);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <MiniTabs active={locale} onChange={setLocale} />
      </div>

      {cats.map((cat, ci) => (
        <div
          key={ci}
          {...getCatRowProps(ci)}
          className={`rounded-xl border border-line bg-champagne-dark overflow-hidden ${REORDERABLE_ROW_CLASSES}`}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 bg-champagne/40 border-b border-line">
            <DragHandle {...getCatHandleProps(ci)} />
            <button type="button" onClick={() => setExpanded(expanded === ci ? null : ci)} className="flex-1 text-left cursor-pointer">
              <ChevronRight size={12} className={`inline mr-2 text-muted transition-transform ${expanded === ci ? "rotate-90" : ""}`} />
              <span className="text-sm font-medium text-ink">{cat[labelField] || <span className="text-muted italic">New category</span>}</span>
              <span className="text-xs text-muted ml-2">({cat.items.length} items · /{cat.slug || "?"})</span>
            </button>
            <button type="button" onClick={() => removeCat(ci)} className="text-muted hover:text-error cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>

          {expanded === ci && (
            <div className="p-4 flex flex-col gap-4 bg-champagne/20">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Slug</label>
                  <input value={cat.slug} onChange={(e) => updCat(ci, { slug: e.target.value })} placeholder="injectable" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Label ({locale.toUpperCase()})</label>
                  <input value={cat[labelField]} onChange={(e) => updCat(ci, { [labelField]: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Link (optional)</label>
                  <input value={cat.link || ""} onChange={(e) => updCat(ci, { link: e.target.value || null })} placeholder="/services/..." className={inputCls} />
                </div>
              </div>

              <ItemsList
                items={cat.items}
                onReorder={(next) => updCat(ci, { items: next })}
                onUpdate={(ii, patch) => updItem(ci, ii, patch)}
                onRemove={(ii) => removeItem(ci, ii)}
                onAdd={() => addItem(ci)}
                nameField={nameField}
                locale={locale}
              />
            </div>
          )}
        </div>
      ))}

      {cats.length === 0 && (
        <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No price categories yet.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={addCat} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer">
          <Plus size={14} /> Add category
        </button>
        <div className="flex-1" />
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button type="button" onClick={save} disabled={pending} className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer">
          {pending ? "Saving..." : "Save price list"}
        </button>
      </div>
    </div>
  );
}

/**
 * Items list for a single expanded category. Extracted into its own component
 * so each category gets an independent useReorderable hook (can't call hooks
 * inside a .map loop in the parent).
 */
function ItemsList({
  items,
  onReorder,
  onUpdate,
  onRemove,
  onAdd,
  nameField,
  locale,
}: {
  items: PriceItem[];
  onReorder: (next: PriceItem[]) => void;
  onUpdate: (ii: number, patch: Partial<PriceItem>) => void;
  onRemove: (ii: number) => void;
  onAdd: () => void;
  nameField: "name_uk" | "name_ru" | "name_en";
  locale: LocaleKey;
}) {
  const { getRowProps, getHandleProps } = useReorderable(items, onReorder);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Items ({items.length})</label>

      {items.map((it, ii) => (
        <div
          key={ii}
          {...getRowProps(ii)}
          className={`flex gap-3 items-end p-3 rounded-xl bg-white border border-line ${REORDERABLE_ROW_CLASSES}`}
        >
          <DragHandle {...getHandleProps(ii)} className="pb-2" />

          {/* Name (wide) — wrapping div handles sizing so there's no
              flex-1 vs w-full class conflict on the <input> itself */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
              Service / procedure name ({locale.toUpperCase()})
            </label>
            <input
              value={it[nameField]}
              onChange={(e) => onUpdate(ii, { [nameField]: e.target.value })}
              placeholder="e.g. Консультація косметолога"
              className="w-full px-3 py-2 rounded-lg bg-champagne border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
            />
          </div>

          {/* Price (narrow) */}
          <div className="w-36 shrink-0 flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
              Price
            </label>
            <input
              value={it.price}
              onChange={(e) => onUpdate(ii, { price: e.target.value })}
              placeholder="4 500"
              className="w-full px-3 py-2 rounded-lg bg-champagne border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
            />
          </div>

          <button type="button" onClick={() => onRemove(ii)} className="text-muted hover:text-error cursor-pointer pb-2 shrink-0" title="Remove item">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-main hover:bg-main/10 transition-colors cursor-pointer self-start mt-1">
        <Plus size={12} /> Add item
      </button>
    </div>
  );
}
