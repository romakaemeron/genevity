/* ─────────────────────────────────────────────────────────────────────────
 * DORMANT — NOT ROUTED. Built for Inweb TZ #10 §2 (online appointment form),
 * then parked at the client's request pending a decision on how automated
 * booking should work. Nothing imports this: the /booking route was removed
 * and the nav link with it, so the site behaves exactly as before (the short
 * name/phone CTA form in BookingCTA/BookingForm is the live path).
 *
 * To re-enable: recreate src/app/[locale]/(pages)/booking/page.tsx rendering
 * BookingPage, re-add the `booking` entry to navConfig, and re-insert the
 * `booking` row in static_pages (see git history for all three).
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Date and time-slot generation for the online appointment wizard (TZ #10 §2).
 *
 * The clinic has no synced practitioner calendar, so these are the clinic's
 * *opening* slots, not confirmed availability — the wizard says so, and the
 * administrator confirms the exact time when they call back. Everything is
 * computed in Europe/Kyiv so a visitor in another timezone still sees the
 * clinic's day, not their own.
 */

/** Clinic opening hours — matches site_settings.hours and the
 *  openingHoursSpecification in OrganizationSchema. */
export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 20;
/** Minutes between offered slots. */
export const SLOT_MINUTES = 30;
/** How far ahead visitors can book. */
export const DAYS_AHEAD = 14;
/** Same-day slots closer than this are dropped — nobody can be called back,
 *  prepped and seen in less time. */
const MIN_LEAD_MINUTES = 120;

const KYIV = "Europe/Kyiv";

/** "YYYY-MM-DD" / "HH:MM" for `now` in Kyiv. */
function kyivParts(now: Date): { date: string; minutes: number } {
  // en-CA gives ISO-ordered date parts, which is what we want to key on.
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(now);
  const [h, m] = time.split(":").map(Number);
  return { date, minutes: h * 60 + m };
}

/** Today's date in Kyiv as "YYYY-MM-DD". */
export function kyivToday(now: Date = new Date()): string {
  return kyivParts(now).date;
}

/** The next `DAYS_AHEAD` bookable dates as "YYYY-MM-DD", starting today. */
export function bookableDates(now: Date = new Date(), days = DAYS_AHEAD): string[] {
  const today = kyivToday(now);
  const [y, m, d] = today.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    // Build in UTC from the Kyiv calendar date so DST never shifts the day.
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}

/** Offered start times for a date, as "HH:MM". Empty once the day is over. */
export function slotsForDate(date: string, now: Date = new Date()): string[] {
  const { date: today, minutes: nowMinutes } = kyivParts(now);
  const earliest = date === today ? nowMinutes + MIN_LEAD_MINUTES : 0;

  const out: string[] = [];
  for (let mins = OPEN_HOUR * 60; mins < CLOSE_HOUR * 60; mins += SLOT_MINUTES) {
    if (mins < earliest) continue;
    out.push(`${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`);
  }
  return out;
}

export type SlotPeriod = "morning" | "afternoon" | "evening";

/** Group slots into morning / afternoon / evening so a 24-slot day reads as
 *  three short rows instead of one long grid. */
export function groupSlots(slots: string[]): Record<SlotPeriod, string[]> {
  const groups: Record<SlotPeriod, string[]> = { morning: [], afternoon: [], evening: [] };
  for (const s of slots) {
    const hour = Number(s.slice(0, 2));
    if (hour < 12) groups.morning.push(s);
    else if (hour < 17) groups.afternoon.push(s);
    else groups.evening.push(s);
  }
  return groups;
}

/** Localized "Пн, 12 серпня" for a date button. */
export function formatSlotDate(date: string, locale: string): { weekday: string; day: string } {
  const tag = locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  // Parse as UTC midnight and format in UTC — the string is a calendar date,
  // not an instant, so no timezone conversion should be applied to it.
  const dt = new Date(`${date}T00:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat(tag, { timeZone: "UTC", weekday: "short" }).format(dt),
    day: new Intl.DateTimeFormat(tag, { timeZone: "UTC", day: "numeric", month: "short" }).format(dt),
  };
}

/** Full human date for the confirmation summary. */
export function formatFullDate(date: string, locale: string): string {
  const tag = locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return new Intl.DateTimeFormat(tag, {
    timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}
