"use client";

import { ChevronDown } from "lucide-react";
import type { PriceSubcategoryView } from "@/lib/db/queries/phase2";
import PriceRow from "./PriceRow";

interface Props {
  sub: PriceSubcategoryView;
  open: boolean;
  countLabel: string;
  onToggle: () => void;
}

export default function SubcategorySection({ sub, open, countLabel, onToggle }: Props) {
  return (
    <div id={sub.slug} className="border-b border-line last:border-b-0 scroll-mt-28">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`panel-${sub.slug}`}
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
      <div id={`panel-${sub.slug}`} hidden={!open} className="divide-y divide-line">
        {sub.items.map((item) => <PriceRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}
