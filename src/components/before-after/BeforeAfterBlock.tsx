"use client";

/**
 * ТЗ #16 §1.1 (homepage) and §2.1 (service page) — the "До / Після" block.
 *
 * One case is shown at a time, large, with an interactive divider; the other
 * cases are reachable through prev/next buttons and a thumbnail strip. A single
 * big slider beats a horizontal scroller here: dragging the divider and
 * swiping a scroller would fight each other on touch.
 *
 * Captions carry the corrective zone and the number of sessions, which the
 * spec asks for explicitly on service pages.
 */

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import BeforeAfterSlider from "./BeforeAfterSlider";
import type { BeforeAfterCase } from "@/lib/db/queries/before-after";
import { isPreOptimized } from "@/lib/image-src";
import { useScrollReveal } from "@/lib/useReveal";

const COPY = {
  ua: {
    title: "До / Після",
    subtitle: "Реальні результати пацієнтів GENEVITY. Потягніть смугу, щоб побачити зміни.",
    before: "До", after: "Після",
    control: "Порівняти фото «до» і «після»",
    hint: "Потягніть, щоб порівняти",
    zone: "Зона корекції", sessions: "Сеансів",
    disclaimer: "Фото публікуються зі згоди пацієнтів. Результат індивідуальний і залежить від вихідного стану, віку та виконання рекомендацій лікаря.",
    caseLabel: "Випадок",
    prev: "Попередній випадок", next: "Наступний випадок",
  },
  ru: {
    title: "До / После",
    subtitle: "Реальные результаты пациентов GENEVITY. Потяните полосу, чтобы увидеть изменения.",
    before: "До", after: "После",
    control: "Сравнить фото «до» и «после»",
    hint: "Потяните, чтобы сравнить",
    zone: "Зона коррекции", sessions: "Сеансов",
    disclaimer: "Фото публикуются с согласия пациентов. Результат индивидуален и зависит от исходного состояния, возраста и соблюдения рекомендаций врача.",
    caseLabel: "Случай",
    prev: "Предыдущий случай", next: "Следующий случай",
  },
  en: {
    title: "Before / After",
    subtitle: "Real results of GENEVITY patients. Drag the divider to see the change.",
    before: "Before", after: "After",
    control: "Compare the before and after photos",
    hint: "Drag to compare",
    zone: "Treated area", sessions: "Sessions",
    disclaimer: "Photos are published with patient consent. Results are individual and depend on the starting condition, age and adherence to the doctor's recommendations.",
    caseLabel: "Case",
    prev: "Previous case", next: "Next case",
  },
} as const;

interface Props {
  cases: BeforeAfterCase[];
  locale: string;
  /** Overrides the built-in heading (service pages pass their block heading). */
  heading?: string;
  subtitle?: string;
  /** Homepage renders inside the page's own section rhythm. */
  className?: string;
}

export default function BeforeAfterBlock({ cases, locale, heading, subtitle, className }: Props) {
  const t = COPY[locale as keyof typeof COPY] ?? COPY.ua;
  const [active, setActive] = useState(0);
  const { ref, visible } = useScrollReveal();

  const go = useCallback(
    (dir: -1 | 1) => setActive((i) => Math.min(cases.length - 1, Math.max(0, i + dir))),
    [cases.length],
  );

  if (!cases.length) return null;

  const current = cases[Math.min(active, cases.length - 1)];
  const captionChips = [
    current.zone && { label: t.zone, value: current.zone },
    current.sessions && { label: t.sessions, value: current.sessions },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="before-after"
      className={`scroll-mt-28 ${visible ? "revealed" : ""} ${className ?? ""}`}
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="reveal flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="heading-2 text-black">{heading || t.title}</h2>
            <p className="body-l text-black-60 max-w-[600px]">{subtitle || t.subtitle}</p>
          </div>
          {cases.length > 1 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="body-s text-black-40 mr-1 tabular-nums">
                {active + 1} / {cases.length}
              </span>
              <Button variant="secondary" icon size="sm" onClick={() => go(-1)} disabled={active === 0} ariaLabel={t.prev}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="secondary" icon size="sm" onClick={() => go(1)} disabled={active === cases.length - 1} ariaLabel={t.next}>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="reveal d1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 lg:gap-8 items-start">
          <div className="flex flex-col gap-4">
            <BeforeAfterSlider
              /* Remounting per case resets the divider to the middle, so a new
                 photo never opens half-revealed from the previous drag. */
              key={current.id}
              beforeUrl={current.beforeUrl}
              afterUrl={current.afterUrl}
              alt={current.alt || current.title}
              labels={{ before: t.before, after: t.after, control: t.control, hint: t.hint }}
              sizes="(max-width: 1024px) 100vw, 760px"
            />

            {/* Thumbnail strip — only worth the space once there are several cases */}
            {cases.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {cases.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={i === active}
                    aria-label={`${t.caseLabel} ${i + 1}${c.title ? `: ${c.title}` : ""}`}
                    className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl transition-all cursor-pointer ${
                      i === active ? "ring-2 ring-main ring-offset-2 ring-offset-champagne" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={c.afterUrl}
                      unoptimized={isPreOptimized(c.afterUrl)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-28">
            {current.title && <h3 className="heading-3 text-black">{current.title}</h3>}
            {captionChips.length > 0 && (
              <dl className="flex flex-col gap-2">
                {captionChips.map((chip) => (
                  <div key={chip.label} className="flex items-baseline gap-2">
                    <dt className="body-s text-black-40 shrink-0">{chip.label}:</dt>
                    <dd className="body-m text-black">{chip.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {current.note && <p className="body-m text-black-60 leading-relaxed">{current.note}</p>}
            <p className="body-s text-black-40 leading-relaxed border-t border-black/[0.06] pt-4">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
