import { sql } from "../client";

/**
 * ТЗ #16 §1.1 / §2.1 — "До / Після" proof cases.
 *
 * One table backs both surfaces, keyed by `owner_key`:
 *   • `'homepage'`             — the homepage comparison slider
 *   • `'service:<uuid>'`       — a service page's own cases
 * so the editor, this loader and the public component are shared instead of
 * duplicated per surface.
 */

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: Record<string, unknown>, field: string, l: string): string {
  const v = row[`${field}_${l}`] ?? row[`${field}_uk`];
  return typeof v === "string" ? v : "";
}

export const HOMEPAGE_BEFORE_AFTER_KEY = "homepage";
export function serviceBeforeAfterKey(serviceId: string) {
  return `service:${serviceId}`;
}

export interface BeforeAfterCase {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  /** What the case is, e.g. "Корекція живота, 34 роки". */
  title: string;
  /** Treated zone — "зона корекції" in the spec. */
  zone: string;
  /** Number of sessions performed, as free text ("4 сеанси"). */
  sessions: string;
  /** Any extra caveat shown under the caption. */
  note: string;
  alt: string;
}

/** Published cases for one owner, ordered as the admin arranged them. */
export async function getBeforeAfterCases(ownerKey: string, locale: string): Promise<BeforeAfterCase[]> {
  const l = lang(locale);
  const rows = await sql`
    SELECT * FROM before_after_cases
    WHERE owner_key = ${ownerKey}
      AND is_published = true
      AND before_url <> '' AND after_url <> ''
    ORDER BY sort_order, created_at
  `;
  return rows.map((r) => ({
    id: r.id as string,
    beforeUrl: r.before_url as string,
    afterUrl: r.after_url as string,
    title: pick(r, "title", l),
    zone: pick(r, "zone", l),
    sessions: pick(r, "sessions", l),
    note: pick(r, "note", l),
    alt: pick(r, "alt", l),
  }));
}

/* ── Admin ─────────────────────────────────────────────────────────────── */

export interface BeforeAfterCaseInput {
  id?: string;
  before_url: string;
  after_url: string;
  title_uk: string; title_ru: string; title_en: string;
  zone_uk: string; zone_ru: string; zone_en: string;
  sessions_uk: string; sessions_ru: string; sessions_en: string;
  note_uk: string; note_ru: string; note_en: string;
  alt_uk: string; alt_ru: string; alt_en: string;
  is_published: boolean;
}

const TEXT_FIELDS = [
  "title_uk", "title_ru", "title_en",
  "zone_uk", "zone_ru", "zone_en",
  "sessions_uk", "sessions_ru", "sessions_en",
  "note_uk", "note_ru", "note_en",
  "alt_uk", "alt_ru", "alt_en",
] as const;

/** Every case for one owner, including unpublished ones — admin editor only. */
export async function adminGetBeforeAfterCases(ownerKey: string): Promise<BeforeAfterCaseInput[]> {
  const rows = await sql`
    SELECT * FROM before_after_cases WHERE owner_key = ${ownerKey} ORDER BY sort_order, created_at
  `;
  return rows.map((r) => {
    const out: Record<string, unknown> = {
      id: r.id as string,
      before_url: (r.before_url as string) || "",
      after_url: (r.after_url as string) || "",
      is_published: r.is_published !== false,
    };
    for (const f of TEXT_FIELDS) out[f] = (r[f] as string) || "";
    return out as unknown as BeforeAfterCaseInput;
  });
}

/**
 * Replace the whole set for one owner in a single round-trip.
 *
 * A full replace (rather than per-row diffing) keeps `sort_order` honest and
 * mirrors how `saveGallery` already works for gallery_items. Rows whose images
 * are both blank are dropped — an empty pair can't render anything.
 */
export async function adminSaveBeforeAfterCases(
  ownerKey: string,
  items: BeforeAfterCaseInput[],
): Promise<void> {
  const clean = items.filter((it) => (it.before_url || "").trim() && (it.after_url || "").trim());
  const keptIds = clean.map((it) => it.id).filter((id): id is string => Boolean(id));

  if (keptIds.length > 0) {
    await sql`DELETE FROM before_after_cases WHERE owner_key = ${ownerKey} AND id <> ALL(${keptIds}::uuid[])`;
  } else {
    await sql`DELETE FROM before_after_cases WHERE owner_key = ${ownerKey}`;
  }

  for (let i = 0; i < clean.length; i++) {
    const it = clean[i];
    const v = (f: (typeof TEXT_FIELDS)[number]) => (it[f] || "").trim();
    if (it.id) {
      await sql`
        UPDATE before_after_cases SET
          before_url = ${it.before_url.trim()}, after_url = ${it.after_url.trim()},
          title_uk = ${v("title_uk")}, title_ru = ${v("title_ru")}, title_en = ${v("title_en")},
          zone_uk = ${v("zone_uk")}, zone_ru = ${v("zone_ru")}, zone_en = ${v("zone_en")},
          sessions_uk = ${v("sessions_uk")}, sessions_ru = ${v("sessions_ru")}, sessions_en = ${v("sessions_en")},
          note_uk = ${v("note_uk")}, note_ru = ${v("note_ru")}, note_en = ${v("note_en")},
          alt_uk = ${v("alt_uk")}, alt_ru = ${v("alt_ru")}, alt_en = ${v("alt_en")},
          is_published = ${it.is_published !== false},
          sort_order = ${i}, updated_at = now()
        WHERE id = ${it.id} AND owner_key = ${ownerKey}
      `;
    } else {
      await sql`
        INSERT INTO before_after_cases (
          owner_key, before_url, after_url,
          title_uk, title_ru, title_en,
          zone_uk, zone_ru, zone_en,
          sessions_uk, sessions_ru, sessions_en,
          note_uk, note_ru, note_en,
          alt_uk, alt_ru, alt_en,
          is_published, sort_order
        ) VALUES (
          ${ownerKey}, ${it.before_url.trim()}, ${it.after_url.trim()},
          ${v("title_uk")}, ${v("title_ru")}, ${v("title_en")},
          ${v("zone_uk")}, ${v("zone_ru")}, ${v("zone_en")},
          ${v("sessions_uk")}, ${v("sessions_ru")}, ${v("sessions_en")},
          ${v("note_uk")}, ${v("note_ru")}, ${v("note_en")},
          ${v("alt_uk")}, ${v("alt_ru")}, ${v("alt_en")},
          ${it.is_published !== false}, ${i}
        )
      `;
    }
  }
}

/** Owner keys that currently hold at least one case — used by the admin index. */
export async function adminCountBeforeAfterCases(ownerKey: string): Promise<number> {
  const rows = await sql`SELECT count(*)::int AS n FROM before_after_cases WHERE owner_key = ${ownerKey}`;
  return (rows[0]?.n as number) ?? 0;
}
