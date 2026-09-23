"use client";

import type { PriceCategory } from "@/lib/db/queries/phase2";

/** Sentinel slug for the "All categories" pill. Not a real category slug, but
 *  must survive a URL round trip (`?c=all`) and be distinguishable from "no
 *  selection" — hence a non-empty string rather than "". */
export const ALL_SLUG = "all";

interface Props {
  categories: PriceCategory[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  allLabel: string;
}

export default function CategoryPills({ categories, activeSlug, onSelect, allLabel }: Props) {
  const totalCount = categories.reduce((sum, cat) => sum + cat.itemCount, 0);

  return (
    <div className="sticky top-20 z-20 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12 py-3 bg-champagne/95 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => onSelect(ALL_SLUG)}
          aria-current={activeSlug === ALL_SLUG}
          className={`shrink-0 px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
            activeSlug === ALL_SLUG
              ? "bg-main text-champagne"
              : "bg-champagne-dark text-black hover:bg-champagne-darker"
          }`}
        >
          {allLabel}
          <span className="body-s opacity-60 ml-2">{totalCount}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onSelect(cat.slug)}
            aria-current={activeSlug === cat.slug}
            className={`shrink-0 px-4 py-2 rounded-[var(--radius-pill)] body-m cursor-pointer transition-colors ${
              activeSlug === cat.slug
                ? "bg-main text-champagne"
                : "bg-champagne-dark text-black hover:bg-champagne-darker"
            }`}
          >
            {cat.label}
            <span className="body-s opacity-60 ml-2">{cat.itemCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
