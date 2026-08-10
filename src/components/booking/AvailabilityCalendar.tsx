"use client";

/**
 * A week of the specialist's real availability, one row of seven days.
 *
 * A week strip rather than a month grid: the visitor is choosing among the
 * *next* openings, not planning a quarter, and seven wide targets read better
 * on a phone than a 42-cell month. Each day carries a dot when the specialist
 * has free hours; days with nothing free stay visible but dimmed and inert,
 * because an empty Sunday is information too.
 *
 * Navigation is clamped to the window RoApp actually returns, so the arrows
 * never walk the visitor past the last bookable day.
 */

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { kyivDateKey, formatMonthYear, weekdayShort } from "@/lib/booking-time";
import type { BookingSlot } from "@/lib/roapp/types";

interface Props {
  slots: BookingSlot[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  /** Offset in days from the first bookable day. */
  weekStart: number;
  onWeekStart: (next: number) => void;
  locale: string;
  legend: string;
}

/** "YYYY-MM-DD" + n days, without timezone drift. */
function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export default function AvailabilityCalendar({
  slots, selectedDate, onSelectDate, weekStart, onWeekStart, locale, legend,
}: Props) {
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of slots) {
      const key = kyivDateKey(s.start);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [slots]);

  /** Anchor on the first free day so the strip opens on something bookable. */
  const anchor = useMemo(() => {
    const keys = Array.from(byDay.keys()).sort();
    return keys[0] ?? kyivDateKey(new Date().toISOString());
  }, [byDay]);

  const lastFree = useMemo(() => {
    const keys = Array.from(byDay.keys()).sort();
    return keys[keys.length - 1] ?? anchor;
  }, [byDay, anchor]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(anchor, weekStart + i)),
    [anchor, weekStart],
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="body-strong text-black first-letter:uppercase">
          {formatMonthYear(days[0], locale)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary" icon size="sm"
            onClick={() => onWeekStart(Math.max(0, weekStart - 7))}
            disabled={weekStart <= 0}
            ariaLabel="Previous week"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="secondary" icon size="sm"
            onClick={() => onWeekStart(weekStart + 7)}
            disabled={days[6] >= lastFree}
            ariaLabel="Next week"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((key) => {
          const count = byDay.get(key) ?? 0;
          const free = count > 0;
          const selected = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              disabled={!free}
              onClick={() => free && onSelectDate(key)}
              aria-pressed={selected}
              aria-label={`${key} — ${count}`}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-[var(--radius-sm)] border transition-colors duration-200 ${
                selected
                  ? "bg-main border-main text-champagne"
                  : free
                    ? "bg-champagne-dark border-line hover:bg-champagne-darker cursor-pointer text-black"
                    : "border-line/60 text-black-20 opacity-50 cursor-default"
              }`}
            >
              <span className={`body-s uppercase tracking-[0.08em] ${selected ? "text-champagne/75" : "text-black-40"}`}>
                {weekdayShort(key, locale)}
              </span>
              <span className="heading-3 text-[20px] leading-none">{Number(key.slice(8))}</span>
              <span
                aria-hidden="true"
                className={`w-[5px] h-[5px] rounded-full ${
                  free ? (selected ? "bg-champagne" : "bg-success") : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="border-t border-line mt-5 pt-4 flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
        <span className="body-s text-muted">{legend}</span>
      </div>
    </div>
  );
}
