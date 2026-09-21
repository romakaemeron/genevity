"use client";

import { useTranslations } from "next-intl";
import type { PriceItemView } from "@/lib/db/queries/phase2";

export default function PriceRow({ item }: { item: PriceItemView }) {
  const tPage = useTranslations("pricesPage");
  return (
    <div className="flex items-start justify-between gap-4 px-4 sm:px-6 py-3.5 hover:bg-champagne-darker/50 transition-colors">
      <div className="min-w-0">
        <span className="body-m text-black">{item.name}</span>
        {item.note && <span className="body-s text-muted ml-2">{item.note}</span>}
      </div>
      <div className="flex items-baseline gap-3 shrink-0">
        {item.duration && (
          <span className="body-s text-muted whitespace-nowrap">{item.duration} {tPage("minutesShort")}</span>
        )}
        <span className="body-strong text-main whitespace-nowrap">
          {item.price} {item.currency}
        </span>
      </div>
    </div>
  );
}
