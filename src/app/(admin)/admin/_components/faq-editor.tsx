"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { saveFaq } from "../_actions/sections";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";

interface FaqItem {
  question_uk: string;
  question_ru: string;
  question_en: string;
  answer_uk: string;
  answer_ru: string;
  answer_en: string;
}

const emptyFaq = (): FaqItem => ({
  question_uk: "", question_ru: "", question_en: "",
  answer_uk: "", answer_ru: "", answer_en: "",
});

interface Props {
  ownerType: "service" | "category" | "static_page";
  ownerId: string;
  initial: FaqItem[];
}

export default function FaqEditor({ ownerType, ownerId, initial }: Props) {
  const [items, setItems] = useState<FaqItem[]>(initial);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const update = (i: number, patch: Partial<FaqItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    setItems(next);
  };
  const remove = (i: number) => {
    if (!confirm("Remove this FAQ item?")) return;
    setItems(items.filter((_, idx) => idx !== i));
    if (expanded === i) setExpanded(null);
  };
  const add = () => {
    setItems([...items, emptyFaq()]);
    setExpanded(items.length);
  };

  const save = () => {
    startTransition(async () => {
      await saveFaq(ownerType, ownerId, items);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  const qKey = `question_${activeLocale}` as const;
  const aKey = `answer_${activeLocale}` as const;

  // Clear expanded row when the list reorders — indices shift and we'd show
  // the wrong expanded panel otherwise. Users can re-click to expand after drop.
  const { getRowProps, getHandleProps } = useReorderable(items, (next) => {
    setItems(next);
    setExpanded(null);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <MiniTabs active={activeLocale} onChange={setActiveLocale} />
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          {...getRowProps(i)}
          className={`rounded-xl border border-line bg-champagne-dark overflow-hidden ${REORDERABLE_ROW_CLASSES}`}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 bg-champagne/40 border-b border-line">
            <DragHandle {...getHandleProps(i)} />
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex-1 text-left text-sm font-medium text-ink hover:text-main transition-colors cursor-pointer truncate"
            >
              <span className="text-xs text-muted mr-2">Q{i + 1}</span>
              {item[qKey] || <span className="text-muted italic">Empty question ({activeLocale})</span>}
            </button>
            <button type="button" onClick={() => remove(i)} className="text-muted hover:text-error transition-colors cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
          {expanded === i && (
            <div className="p-4 flex flex-col gap-3">
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
      ))}

      {items.length === 0 && (
        <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No FAQ items yet.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add FAQ item
        </button>
        <div className="flex-1" />
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save FAQ"}
        </button>
      </div>
    </div>
  );
}
