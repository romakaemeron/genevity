"use client";

import Image from "next/image";
import type { EquipmentItem } from "@/lib/db/types";

interface EquipmentModalProps {
  item: EquipmentItem;
  suitsTitle: string;
  resultsTitle: string;
}

function ModalText({ item, suitsTitle, resultsTitle }: EquipmentModalProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="heading-3 text-black mb-2">{item.name}</h3>
        <p className="body-l text-black-80">{item.description}</p>
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

export default function EquipmentModal({ item, suitsTitle, resultsTitle }: EquipmentModalProps) {
  if (!item.photo) {
    return (
      <div className="p-6 sm:p-8 pt-12">
        <ModalText item={item} suitsTitle={suitsTitle} resultsTitle={resultsTitle} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Photo — left on desktop, top on mobile */}
      <div className="relative lg:w-[45%] shrink-0 bg-champagne-dark overflow-hidden">
        <div className="relative w-full h-64 lg:h-full lg:min-h-[480px]">
          <Image
            src={item.photo}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 400px"
          />
        </div>
      </div>

      {/* Text — right on desktop, below on mobile */}
      <div className="flex-1 p-6 sm:p-8 pt-12 lg:pt-8 overflow-y-auto lg:max-h-[80vh]">
        <ModalText item={item} suitsTitle={suitsTitle} resultsTitle={resultsTitle} />
      </div>
    </div>
  );
}
