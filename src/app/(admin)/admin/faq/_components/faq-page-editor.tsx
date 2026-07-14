"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { MiniTabs } from "../../_components/locale-inputs";
import type { LocaleKey } from "../../_components/translation-tabs";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "../../_components/reorderable";
import { saveFaqPageItems } from "../../_actions/faq-page";
import { FAQ_CATEGORY_KEYS, type FaqCategoryKey, type FaqPageItem } from "../../_actions/faq-page-constants";

const CATEGORY_LABELS: Record<FaqCategoryKey, string> = {
  booking: "Booking",
  preparation: "Preparation",
  payment: "Payment",
  safety: "Safety & compliance",
  lab: "Lab / diagnostics",
  visit: "Visit logistics",
};

const emptyItem = (category: FaqCategoryKey): FaqPageItem => ({
  category,
  question_uk: "", question_ru: "", question_en: "",
  answer_uk: "", answer_ru: "", answer_en: "",
});

interface Props {
  initialByCategory: Record<string, FaqPageItem[]>;
}

function CategorySection({
  category,
  items,
  onChange,
  activeLocale,
  expandedKey,
  setExpandedKey,
  onMoveToCategory,
}: {
  category: FaqCategoryKey;
  items: FaqPageItem[];
  onChange: (next: FaqPageItem[]) => void;
  activeLocale: LocaleKey;
  expandedKey: string | null;
  setExpandedKey: (key: string | null) => void;
  onMoveToCategory: (item: FaqPageItem, index: number, target: FaqCategoryKey) => void;
}) {
  const qKey = `question_${activeLocale}` as const;
  const aKey = `answer_${activeLocale}` as const;

  const update = (i: number, patch: Partial<FaqPageItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => {
    if (!confirm("Remove this FAQ item?")) return;
    onChange(items.filter((_, idx) => idx !== i));
  };
  const add = () => {
    onChange([...items, emptyItem(category)]);
    setExpandedKey(`${category}-${items.length}`);
  };

  const { getRowProps, getHandleProps } = useReorderable(items, (next) => onChange(next));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{CATEGORY_LABELS[category]}</h2>
        <span className="text-xs text-muted">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.map((item, i) => {
        const key = `${category}-${i}`;
        const isExpanded = expandedKey === key;
        return (
          <div
            key={key}
            {...getRowProps(i)}
            className={`rounded-xl border border-line bg-champagne-dark overflow-hidden ${REORDERABLE_ROW_CLASSES}`}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 bg-champagne/40 border-b border-line">
              <DragHandle {...getHandleProps(i)} />
              <button
                type="button"
                onClick={() => setExpandedKey(isExpanded ? null : key)}
                className="flex-1 text-left text-sm font-medium text-ink hover:text-main transition-colors cursor-pointer truncate"
              >
                <span className="text-xs text-muted mr-2">Q{i + 1}</span>
                {item[qKey] || <span className="text-muted italic">Empty question ({activeLocale})</span>}
              </button>
              <button type="button" onClick={() => remove(i)} className="text-muted hover:text-error transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
            {isExpanded && (
              <div className="p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => onMoveToCategory(item, i, e.target.value as FaqCategoryKey)}
                    className="px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
                  >
                    {FAQ_CATEGORY_KEYS.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Question ({activeLocale.toUpperCase()})</label>
                  <input
                    value={item[qKey]}
                    onChange={(e) => update(i, { [qKey]: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Answer ({activeLocale.toUpperCase()})</label>
                  <textarea
                    rows={4}
                    value={item[aKey]}
                    onChange={(e) => update(i, { [aKey]: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 resize-y"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-6 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No items in this category yet.
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer self-start"
      >
        <Plus size={14} /> Add FAQ item
      </button>
    </div>
  );
}

export default function FaqPageEditor({ initialByCategory }: Props) {
  const [byCategory, setByCategory] = useState<Record<string, FaqPageItem[]>>(initialByCategory);
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("uk");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const moveToCategory = (item: FaqPageItem, index: number, target: FaqCategoryKey) => {
    if (target === item.category) return;
    setByCategory((prev) => {
      const source = prev[item.category].filter((_, idx) => idx !== index);
      const dest = [...prev[target], { ...item, category: target }];
      return { ...prev, [item.category]: source, [target]: dest };
    });
    setExpandedKey(null);
  };

  const save = () => {
    startTransition(async () => {
      const flat = FAQ_CATEGORY_KEYS.flatMap((cat) => byCategory[cat] || []);
      await saveFaqPageItems(flat);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-end sticky top-0 z-10 bg-background py-2">
        <MiniTabs active={activeLocale} onChange={setActiveLocale} />
      </div>

      {FAQ_CATEGORY_KEYS.map((category) => (
        <CategorySection
          key={category}
          category={category}
          items={byCategory[category] || []}
          onChange={(next) => setByCategory((prev) => ({ ...prev, [category]: next }))}
          activeLocale={activeLocale}
          expandedKey={expandedKey}
          setExpandedKey={setExpandedKey}
          onMoveToCategory={moveToCategory}
        />
      ))}

      <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border px-8 py-4 -mx-8 flex items-center justify-end gap-3">
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save FAQ Page"}
        </button>
      </div>
    </div>
  );
}
