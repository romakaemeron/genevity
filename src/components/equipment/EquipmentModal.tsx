"use client";

import { useTranslations } from "next-intl";

interface EquipmentModalProps {
  index: number;
}

export default function EquipmentModal({ index }: EquipmentModalProps) {
  const t = useTranslations("equipment");

  const suits = (() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const key = `items.${index}.suits.${i}`;
      if (!t.has(key)) break;
      result.push(t(key));
    }
    return result;
  })();

  const results = (() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const key = `items.${index}.results.${i}`;
      if (!t.has(key)) break;
      result.push(t(key));
    }
    return result;
  })();

  const note = t(`items.${index}.note`);

  return (
    <div className="p-6 sm:p-8 pt-12 flex flex-col gap-6">
      <div>
        <h3 className="heading-3 text-black mb-2">
          {t(`items.${index}.name`)}
        </h3>
        <p className="body-l text-black-80">
          {t(`items.${index}.description`)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="body-strong text-black">{t("suitsTitle")}</p>
        <ul className="flex flex-col gap-1">
          {suits.map((suit, i) => (
            <li key={i} className="body-m text-black-60 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-main mt-2 shrink-0" />
              {suit}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <p className="body-strong text-black">{t("resultsTitle")}</p>
        <ul className="flex flex-col gap-1">
          {results.map((result, i) => (
            <li key={i} className="body-m text-black-60 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
              {result}
            </li>
          ))}
        </ul>
      </div>

      {note && (
        <p className="body-s text-black-40 border-t border-black-10 pt-4">
          {note}
        </p>
      )}
    </div>
  );
}
