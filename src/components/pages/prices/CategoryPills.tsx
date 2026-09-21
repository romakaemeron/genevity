"use client";

import type { PriceCategory } from "@/lib/db/queries/phase2";

interface Props {
  categories: PriceCategory[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export default function CategoryPills({ categories, activeSlug, onSelect }: Props) {
  return (
    <div className="sticky top-20 z-20 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12 py-3 bg-champagne/95 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
