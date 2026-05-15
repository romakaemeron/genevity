/**
 * First-touch UTM attribution.
 *
 *   captureFromLocation()   — reads utm_* from window.location.search and
 *                             writes them to sessionStorage so they're
 *                             available after the visitor navigates to a
 *                             UTM-free page before submitting a form.
 *
 *   readCapturedUtms()      — returns the current snapshot. Prefers the
 *                             URL (in case the visitor pastes a link with
 *                             UTMs deeper into the funnel) and falls back
 *                             to sessionStorage.
 *
 * Intentionally sessionStorage (not localStorage) — UTMs identify *this*
 * visit's source, not the visitor forever. A new tab / window starts a
 * fresh attribution, matching the semantics of GA's session tracking.
 */

const STORAGE_KEY = "genevity:utm";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmBag = Partial<Record<UtmKey, string>>;

/** Called once on mount — cheap if there's nothing to capture. */
export function captureFromLocation(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const captured: UtmBag = {};
    let hasAny = false;
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) {
        captured[k] = v.slice(0, 200);
        hasAny = true;
      }
    }
    if (!hasAny) return;
    // Merge on top of whatever's already stored so we don't clobber a
    // previously-captured attribution with a later page's missing UTMs.
    const prev = readStored();
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...captured }));
  } catch {
    // sessionStorage blocked (privacy mode, SSR, etc.) — silently skip.
  }
}

/** Read whatever we've got — URL first, then sessionStorage snapshot. */
export function readCapturedUtms(): UtmBag {
  if (typeof window === "undefined") return {};
  const out: UtmBag = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) out[k] = v.slice(0, 200);
    }
  } catch {
    // ignore
  }
  const stored = readStored();
  for (const k of UTM_KEYS) {
    if (!out[k] && stored[k]) out[k] = stored[k];
  }
  return out;
}

function readStored(): UtmBag {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: UtmBag = {};
    for (const k of UTM_KEYS) {
      const v = parsed[k];
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}
