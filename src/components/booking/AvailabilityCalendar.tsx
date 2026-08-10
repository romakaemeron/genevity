"use client";

/**
 * Month calendar of a specialist's real availability.
 *
 * These schedules are sparse and irregular — one doctor may have a single free
 * hour on Monday and seven on Wednesday — so a plain "next 14 days" strip makes
 * the visitor hunt. Each day here carries a load bar showing how much of that
 * day is still open, which turns "when can I actually come in" into one glance.
 * The bar encodes real data; it isn't decoration.
 *
 * Days RoApp returns no slots for are inert: not clickable, no hover, clearly
 * secondary — but still shown, because an empty Tuesday is information too.
 */

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  kyivDateKey,
  formatMonth,
  weekdayLabels,
  parseDateKey,
  kyivToday,
} from "@/lib/booking-time";
import type { BookingSlot } from "@/lib/roapp/types";

interface Props {
  slots: BookingSlot[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  locale: string;
  /** Rendered under the grid — e.g. "12 вільних годин". */
  legend?: string;
}

export default function AvailabilityCalendar({
  slots, selectedDate, onSelectDate, locale, legend,
}: Props) {
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of slots) {
      const key = kyivDateKey(s.start);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [slots]);

  const busiest = useMemo(
    () => Math.max(1, ...Array.from(byDay.values())),
    [byDay],
  );

  // Start on the month holding the first free day, not today — if a doctor's
  // next opening is in three weeks, opening on an empty month is a dead end.
  const firstFree = useMemo(() => {
    const keys = Array.from(byDay.keys()).sort();
    return keys[0] ?? kyivToday();
  }, [byDay]);

  const [cursor, setCursor] = useState(() => {
    const { year, month } = parseDateKey(firstFree);
    return { year, month };
  });

  const monthsWithSlots = useMemo(() => {
    const set = new Set<string>();
    for (const key of byDay.keys()) {
      const { year, month } = parseDateKey(key);
      set.add(`${year}-${month}`);
    }
    return set;
  }, [byDay]);

  const step = (dir: -1 | 1) => {
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + dir, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  };

  const canPrev = monthsWithSlots.has(`${cursor.year}-${cursor.month - 1}`)
    || (cursor.month === 0 && monthsWithSlots.has(`${cursor.year - 1}-11`));
  const canNext = monthsWithSlots.has(`${cursor.year}-${cursor.month + 1}`)
    || (cursor.month === 11 && monthsWithSlots.has(`${cursor.year + 1}-0`));

  // Monday-first grid, including leading blanks.
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const lead = (first.getUTCDay() + 6) % 7; // Sun=0 → Mon-first
    const days = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    const out: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= days; d++) {
      out.push(
        `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      );
    }
    return out;
  }, [cursor]);

  const today = kyivToday();
  const labels = weekdayLabels(locale);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-champagne p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canPrev}
          aria-label="Previous month"
          className="w-8 h-8 rounded-full inline-flex items-center justify-center text-main hover:bg-champagne-dark disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="body-strong text-black first-letter:uppercase">
          {formatMonth(cursor.year, cursor.month, locale)}
        </p>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={!canNext}
          aria-label="Next month"
          className="w-8 h-8 rounded-full inline-flex items-center justify-center text-main hover:bg-champagne-dark disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {labels.map((l) => (
          <div key={l} className="text-center body-s text-black-40 py-1 capitalize">
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((key, i) => {
          if (!key) return <div key={`b${i}`} aria-hidden="true" />;
          const count = byDay.get(key) ?? 0;
          const free = count > 0;
          const selected = key === selectedDate;
          const isToday = key === today;
          const day = Number(key.slice(8));
          return (
            <button
              key={key}
              type="button"
              disabled={!free}
              onClick={() => free && onSelectDate(key)}
              aria-pressed={selected}
              aria-label={`${day} — ${count} slots`}
              className={`relative aspect-square rounded-[var(--radius-sm)] flex flex-col items-center justify-center gap-1 transition-colors duration-150 ${
                selected
                  ? "bg-main text-champagne"
                  : free
                    ? "bg-champagne-dark text-black hover:bg-champagne-darker cursor-pointer"
                    : "text-black-20 cursor-default"
              }`}
            >
              <span className={`text-[13px] leading-none ${isToday && !selected ? "font-semibold text-main" : ""}`}>
                {day}
              </span>
              {/* Load bar — width tracks how open the day is. */}
              <span
                aria-hidden="true"
                className={`h-[3px] rounded-full transition-all ${
                  free ? (selected ? "bg-champagne/70" : "bg-main/45") : "bg-transparent"
                }`}
                style={{ width: free ? `${Math.max(22, (count / busiest) * 70)}%` : 0 }}
              />
            </button>
          );
        })}
      </div>

      {legend && <p className="body-s text-black-40 mt-4 text-center">{legend}</p>}
    </div>
  );
}
