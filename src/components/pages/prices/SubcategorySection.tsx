"use client";

import { ChevronDown } from "lucide-react";
import type { PriceSubcategoryView } from "@/lib/db/queries/phase2";
import PriceRow from "./PriceRow";

interface Props {
  /** The subcategory's owning category slug. Subcategory slugs are only
   *  unique per category (DB constraint UNIQUE(category_id, slug)), so the
   *  DOM id/aria-controls/state key must be composed with it — two
   *  categories can otherwise produce the same subcategory slug (taxonomy.ts
   *  already emits a shared "inshe" fallback) and collide. */
  categorySlug: string;
  sub: PriceSubcategoryView;
  open: boolean;
  countLabel: string;
  onToggle: () => void;
}

export default function SubcategorySection({ categorySlug, sub, open, countLabel, onToggle }: Props) {
  const key = `${categorySlug}/${sub.slug}`;
  return (
    <div id={key} className="border-b border-line last:border-b-0 scroll-mt-28">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`panel-${key}`}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-4 text-left cursor-pointer hover:bg-champagne-darker/40 transition-colors"
      >
        <span className="body-strong text-black">{sub.label}</span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="body-s text-muted">{sub.items.length} {countLabel}</span>
          <ChevronDown
            size={18}
            className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div id={`panel-${key}`} hidden={!open} className="divide-y divide-line">
        {sub.items.map((item) => <PriceRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}
