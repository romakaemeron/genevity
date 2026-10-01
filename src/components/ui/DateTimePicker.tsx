"use client";

/**
 * Preferred-appointment date + time picker for the booking form.
 *
 * Deliberately *not* a real availability calendar — the short CTA form
 * doesn't talk to the clinic's schedule, it collects a preference that an
 * operator confirms by phone. So: any upcoming day inside a six-month
 * window, and a flat grid of half-hour marks across the clinic's day.
 * Time is optional even once a day is picked ("any time"), because most
 * visitors care about the day far more than the hour.
 *
 * Visually it's the SearchSelect pattern rebuilt around a month grid: same
 * champagne-dark trigger, same line border, same taupe focus ring, same
 * portaled panel that flips above the anchor when the viewport is tight.
 * The portal matters — the form lives inside a modal whose panel is
 * `overflow-hidden`, so an in-flow popover would be clipped.
 *
 * Self-contained by design: no imports from the RoApp booking wizard, so
 * this file can ship to `main` on its own.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

export interface PreferredSlot {
  /** "YYYY-MM-DD" in Kyiv terms, or null when nothing is picked. */
  date: string | null;
  /** "HH:MM" 24h, or null for "any time". */
  time: string | null;
}

interface Props {
  value: PreferredSlot;
  onChange: (next: PreferredSlot) => void;
  locale: string;
  /** `id` of the field's <label> — wires aria-labelledby. */
  labelId?: string;
  placeholder: string;
  /** Heading above the time grid, e.g. "Час". */
  timeHeading: string;
  /** Hint shown in the time section before a day is picked. */
  timeHint: string;
  /** Label for the "no particular hour" pill. */
  anyTimeLabel: string;
  clearLabel: string;
  /** Accessible names for the month arrows. */
  prevMonthLabel: string;
  nextMonthLabel: string;
  disabled?: boolean;
}

const KYIV = "Europe/Kyiv";
/** Clinic day, as offered to visitors. Half-hour marks, last one before close. */
const DAY_START_MIN = 9 * 60;
const DAY_END_MIN = 19 * 60;
const STEP_MIN = 30;
/** How far ahead a preference may point. Past that it's not a preference. */
const MONTHS_AHEAD = 6;

function localeTag(locale: string) {
  return locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
}

/** Today's "YYYY-MM-DD" as seen in Kyiv — en-CA gives ISO ordering. */
function kyivTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** Current Kyiv wall clock in minutes past midnight. */
function kyivNowMinutes(): number {
  const hhmm = new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Date keys are treated as UTC midnight throughout so month arithmetic
 *  and weekday math never drift across a DST boundary. */
function keyToUtc(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}
function utcToKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addMonthsToKey(key: string, months: number): string {
  const d = keyToUtc(key);
  return utcToKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, d.getUTCDate())));
}

/** "жовтень 2026" — month grid heading. */
function formatMonthYear(key: string, locale: string): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    timeZone: "UTC", month: "long", year: "numeric",
  }).format(keyToUtc(key));
}

/** "субота, 11 жовтня" — trigger summary and day aria-labels. */
function formatDateLong(key: string, locale: string): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    timeZone: "UTC", weekday: "long", day: "numeric", month: "long",
  }).format(keyToUtc(key));
}

function minutesToLabel(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** Monday-first weekday initials, pulled from Intl so they localize. */
function weekdayHeads(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(localeTag(locale), { timeZone: "UTC", weekday: "short" });
  // 2024-01-01 was a Monday — seven consecutive days from there give the row.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i))));
}

/** The 1st-of-month key for a given date key. */
function monthStart(key: string): string {
  const d = keyToUtc(key);
  return utcToKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
}

/** Leading blanks + every day of the month, Monday-first. */
function monthCells(monthKey: string): Array<string | null> {
  const d = keyToUtc(monthKey);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // getUTCDay(): 0 = Sunday. Shift so Monday is index 0.
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells: Array<string | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(utcToKey(new Date(Date.UTC(year, month, day))));
  }
  return cells;
}

export default function DateTimePicker({
  value, onChange, locale, labelId, placeholder, timeHeading, timeHint,
  anyTimeLabel, clearLabel, prevMonthLabel, nextMonthLabel, disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  // Today / max are read once per mount: the picker is short-lived and a
  // visitor crossing midnight mid-session would still get a valid window
  // (the server re-validates anyway).
  const today = useMemo(() => kyivTodayKey(), []);
  const maxDate = useMemo(() => addMonthsToKey(today, MONTHS_AHEAD), [today]);
  const [month, setMonth] = useState(() => monthStart(value.date || today));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<
    { top: number; left: number; width: number; maxHeight: number } | null
  >(null);

  // Each opening starts on the month that's actually relevant rather than
  // wherever the visitor browsed to last time.
  const toggle = useCallback(() => {
    if (!open) setMonth(monthStart(value.date || today));
    setOpen(!open);
  }, [open, value.date, today]);

  const heads = useMemo(() => weekdayHeads(locale), [locale]);
  const cells = useMemo(() => monthCells(month), [month]);
  const canPrev = month > monthStart(today);
  const canNext = month < monthStart(maxDate);

  const slots = useMemo(() => {
    const out: number[] = [];
    for (let m = DAY_START_MIN; m < DAY_END_MIN; m += STEP_MIN) out.push(m);
    return out;
  }, []);
  // Today's already-passed marks are offered as disabled rather than hidden,
  // so the grid doesn't silently reflow as the day goes on.
  const minMinutes = value.date === today ? kyivNowMinutes() : -1;

  /* ── Outside click ──────────────────────────────────────────────────
   *  Capture phase, same as SearchSelect: the form often sits inside a
   *  modal whose backdrop closes on click, and without swallowing the
   *  event one gesture would close both the popover and the modal.     */
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("click", onDoc, true);
    return () => document.removeEventListener("click", onDoc, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Close the popover only — don't let the modal's Esc handler also fire.
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  // Position in viewport coordinates; flip above when the space below is
  // tighter, and clamp the height so the panel never runs off-screen.
  useEffect(() => {
    if (!open) { setAnchor(null); return; }
    const GAP = 6;
    const EDGE_PAD = 12;
    const MIN_HEIGHT = 300;
    const PREFERRED_HEIGHT = 460;
    const MIN_WIDTH = 296;
    // Capped independently of the trigger: a month grid stretched to a
    // 700 px form field turns into absurdly tall day cells.
    const MAX_WIDTH = 360;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom - GAP - EDGE_PAD;
      const spaceAbove = r.top - GAP - EDGE_PAD;
      const openDown = spaceBelow >= PREFERRED_HEIGHT || spaceBelow >= spaceAbove;
      const available = Math.max(MIN_HEIGHT, openDown ? spaceBelow : spaceAbove);
      const maxHeight = Math.min(PREFERRED_HEIGHT, available);
      const top = openDown ? r.bottom + GAP : Math.max(EDGE_PAD, r.top - GAP - maxHeight);
      const width = Math.min(
        Math.max(Math.min(r.width, MAX_WIDTH), MIN_WIDTH),
        window.innerWidth - EDGE_PAD * 2,
      );
      // Keep the panel inside the viewport when the trigger is narrow and
      // close to the right edge.
      const left = Math.min(Math.max(EDGE_PAD, r.left), window.innerWidth - width - EDGE_PAD);
      setAnchor({ top, left, width, maxHeight });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  const pickDate = useCallback((key: string) => {
    // Switching to today can invalidate an already-picked hour — drop it
    // rather than submit a time that has already passed.
    const keepTime =
      value.time && !(key === today && toMinutes(value.time) <= kyivNowMinutes());
    onChange({ date: key, time: keepTime ? value.time : null });
    // The hours live below the month grid, usually past the panel's fold —
    // bring them into view so picking a day visibly leads somewhere.
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [onChange, value.time, today]);

  const pickTime = useCallback((time: string | null) => {
    onChange({ date: value.date, time });
    setOpen(false);
    triggerRef.current?.focus();
  }, [onChange, value.date]);

  const clear = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    onChange({ date: null, time: null });
  }, [onChange]);

  const summary = value.date
    ? `${formatDateLong(value.date, locale)}${value.time ? ` · ${value.time}` : ""}`
    : "";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && toggle()}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        disabled={disabled}
        className={`group w-full flex items-center gap-2 px-4 py-3 rounded-[var(--radius-button)] bg-champagne-dark border border-line text-left text-ink text-[15px] outline-none transition-colors duration-150 ease-out ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-stone-light focus-visible:border-main focus-visible:ring-2 focus-visible:ring-main/15"
        } ${open ? "border-main ring-2 ring-main/15" : ""}`}
      >
        <CalendarDays size={16} className="text-stone shrink-0" />
        <span className={`flex-1 min-w-0 truncate first-letter:uppercase ${summary ? "text-ink" : "text-stone"}`}>
          {summary || placeholder}
        </span>
        {value.date && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={clear}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); clear(ev); }
            }}
            className="text-stone hover:text-ink transition-colors p-0.5 -mr-1 cursor-pointer"
            title={clearLabel}
            aria-label={clearLabel}
          >
            <X size={14} />
          </span>
        )}
        <ChevronDown
          size={16}
          className={`text-stone transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && anchor && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: anchor.top,
              left: anchor.left,
              width: anchor.width,
              maxHeight: anchor.maxHeight,
              // Inline z-index for the same reason as SearchSelect — an
              // arbitrary Tailwind value can lose to the modal's compiled
              // styles under Turbopack.
              zIndex: 9999,
            }}
            className="flex flex-col rounded-[var(--radius-card)] bg-champagne-dark border border-line shadow-lg overflow-hidden"
            role="dialog"
            aria-modal={false}
            aria-labelledby={labelId}
          >
            <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
              {/* ── Month header ─────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-line">
                <ArrowButton
                  onClick={() => setMonth(addMonthsToKey(month, -1))}
                  disabled={!canPrev}
                  label={prevMonthLabel}
                >
                  <ChevronLeft size={15} />
                </ArrowButton>
                <p className="flex-1 text-center text-[13px] font-medium text-ink first-letter:uppercase">
                  {formatMonthYear(month, locale)}
                </p>
                <ArrowButton
                  onClick={() => setMonth(addMonthsToKey(month, 1))}
                  disabled={!canNext}
                  label={nextMonthLabel}
                >
                  <ChevronRight size={15} />
                </ArrowButton>
              </div>

              {/* ── Day grid ─────────────────────────────────────────── */}
              <div className="px-3 pt-2.5 pb-3">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {heads.map((h, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-stone py-1"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((key, i) => {
                    if (!key) return <span key={`pad-${i}`} aria-hidden />;
                    const isPast = key < today;
                    const isBeyond = key > maxDate;
                    const isDisabled = isPast || isBeyond;
                    const isSelected = key === value.date;
                    const isToday = key === today;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => pickDate(key)}
                        disabled={isDisabled}
                        aria-pressed={isSelected}
                        aria-label={formatDateLong(key, locale)}
                        className={`aspect-square flex items-center justify-center rounded-[var(--radius-button)] text-[13px] tabular-nums transition-colors duration-150 ease-out ${
                          isDisabled
                            ? "text-stone/40 cursor-not-allowed"
                            : isSelected
                              ? "bg-main text-champagne cursor-pointer"
                              : "text-ink cursor-pointer hover:bg-champagne-darker"
                        } ${isToday && !isSelected ? "ring-1 ring-main/30" : ""}`}
                      >
                        {Number(key.slice(8, 10))}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Time grid ────────────────────────────────────────── */}
              <div className="px-3 pt-2.5 pb-3 border-t border-line">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone mb-2">
                  {timeHeading}
                </p>
                {!value.date ? (
                  <p className="text-[12px] text-stone leading-snug py-1">{timeHint}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => pickTime(null)}
                      aria-pressed={value.time === null}
                      className={`col-span-4 px-3 py-1.5 rounded-[var(--radius-button)] border text-[12px] transition-colors duration-150 ease-out cursor-pointer ${
                        value.time === null
                          ? "bg-main text-champagne border-main"
                          : "bg-champagne-darker border-line text-ink hover:border-stone-light"
                      }`}
                    >
                      {anyTimeLabel}
                    </button>
                    {slots.map((min) => {
                      const label = minutesToLabel(min);
                      const isDisabled = min <= minMinutes;
                      const isSelected = value.time === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => pickTime(label)}
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                          className={`px-2 py-1.5 rounded-[var(--radius-button)] border text-[12px] tabular-nums transition-colors duration-150 ease-out ${
                            isDisabled
                              ? "bg-transparent border-line/60 text-stone/40 cursor-not-allowed"
                              : isSelected
                                ? "bg-main text-champagne border-main cursor-pointer"
                                : "bg-champagne-darker border-line text-ink cursor-pointer hover:border-stone-light"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function ArrowButton({
  onClick, disabled, label, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex w-7 h-7 items-center justify-center rounded-[var(--radius-button)] border border-line transition-colors duration-150 ease-out ${
        disabled
          ? "text-stone/40 cursor-not-allowed"
          : "text-stone cursor-pointer hover:text-ink hover:bg-champagne-darker hover:border-stone-light"
      }`}
    >
      {children}
    </button>
  );
}
