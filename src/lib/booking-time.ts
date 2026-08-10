/**
 * Time helpers for the online booking wizard.
 *
 * RoApp hands us UTC instants and the clinic runs on Europe/Kyiv, so every
 * value a visitor sees has to be converted — including the *calendar date*,
 * which is not the same question as the time. A 21:00 Kyiv slot is "tomorrow"
 * in UTC during summer, and grouping by the UTC date would file it under the
 * wrong day in the calendar.
 *
 * Everything here is pure and locale-aware; no state, no fetching.
 */

const KYIV = "Europe/Kyiv";

/** "YYYY-MM-DD" for an instant, as seen in Kyiv. en-CA gives ISO ordering. */
export function kyivDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(iso));
}

/** "HH:MM" for an instant, as seen in Kyiv. */
export function kyivTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}

function tag(locale: string) {
  return locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
}

/** "понеділок, 12 серпня" — for the confirmation summary. */
export function formatKyivDateLong(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: KYIV, weekday: "long", day: "numeric", month: "long",
  }).format(new Date(iso));
}

/** "серпень 2026" — calendar month heading. */
export function formatMonth(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: "UTC", month: "long", year: "numeric",
  }).format(new Date(Date.UTC(year, month, 1)));
}

/** Monday-first short weekday initials, matching the clinic's RoApp setting. */
export function weekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(tag(locale), { timeZone: "UTC", weekday: "short" });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
  );
}

export type SlotPeriod = "morning" | "afternoon" | "evening";

/** Bucket by Kyiv wall-clock hour, so a 12-slot day reads as three short rows. */
export function periodOf(iso: string): SlotPeriod {
  const hour = Number(kyivTime(iso).slice(0, 2));
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/** "YYYY-MM-DD" → {year, month (0-based), day}, without timezone drift. */
export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

/** Today's date key in Kyiv. */
export function kyivToday(): string {
  return kyivDateKey(new Date().toISOString());
}
