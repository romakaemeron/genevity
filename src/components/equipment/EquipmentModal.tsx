"use client";

import type { EquipmentItem } from "@/sanity/types";

interface EquipmentModalProps {
  item: EquipmentItem;
  suitsTitle: string;
  resultsTitle: string;
}

export default function EquipmentModal({ item, suitsTitle, resultsTitle }: EquipmentModalProps) {
  return (
    <div className="p-6 sm:p-8 pt-12 flex flex-col gap-6">
      <div>
        <h3 className="heading-3 text-black mb-2">
          {item.name}
        </h3>
        <p className="body-l text-black-80">
          {item.description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="body-strong text-black">{suitsTitle}</p>
        <ul className="flex flex-col gap-1">
          {item.suits.map((suit, i) => (
            <li key={i} className="body-m text-black-60 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-main mt-2 shrink-0" />
              {suit}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <p className="body-strong text-black">{resultsTitle}</p>
        <ul className="flex flex-col gap-1">
          {item.results.map((result, i) => (
            <li key={i} className="body-m text-black-60 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
              {result}
            </li>
          ))}
        </ul>
      </div>

      {item.note && (
        <p className="body-s text-black-40 border-t border-black-10 pt-4">
          {item.note}
        </p>
      )}
    </div>
  );
}
