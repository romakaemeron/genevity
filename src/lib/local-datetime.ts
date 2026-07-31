/**
 * Conversions between a browser `<input type="datetime-local">` value and an
 * absolute instant.
 *
 * `datetime-local` speaks the *editor's wall clock* and carries no offset:
 * "2026-07-31T15:00" means 15:00 wherever the editor is sitting (Kyiv, UTC+3).
 * `Date#toISOString()` speaks UTC. Mixing the two silently shifts the date by
 * the offset in both directions:
 *
 *   - prefilling with `new Date().toISOString().slice(0,16)` shows a Kyiv editor
 *     09:57 while their clock says 12:57;
 *   - posting the naive string straight to the server makes Node (UTC on Vercel)
 *     read it back as UTC, landing 3 h in the future — which the publish schema
 *     rejects outright ("Заплановану публікацію не підтримано").
 *
 * So the conversion is done explicitly at the input boundary: the visible field
 * always shows local wall-clock time, and what is submitted is a full ISO
 * instant with an offset that the server can parse unambiguously.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Absolute instant → "YYYY-MM-DDTHH:mm" in the *local* zone (input display value). */
export function toDatetimeLocalValue(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * "YYYY-MM-DDTHH:mm" (local wall clock) → absolute UTC ISO string.
 *
 * `new Date(v)` parses a date-time form without an offset as local time per the
 * ECMAScript spec, so this runs correctly in the editor's browser regardless of
 * the server's zone. Empty/invalid input yields "" — the server treats a blank
 * date as "no date given".
 */
export function fromDatetimeLocalValue(value: string): string {
  if (!value) return "";
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? "" : new Date(t).toISOString();
}
