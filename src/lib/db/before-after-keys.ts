/**
 * Owner-key helpers and row shapes for "До / Після" cases (ТЗ #16 §1.1 / §2.1).
 *
 * Deliberately split out of `queries/before-after.ts`: the admin editors are
 * client components, and that module imports `sql` — which evaluates
 * `neon(process.env.DATABASE_URL!)` at module scope. A *value* import of
 * anything from it (not just a `import type`) pulls the Neon client into the
 * browser bundle, where DATABASE_URL doesn't exist, and the page dies on
 * hydration with "No database connection string was provided to `neon()`".
 *
 * Nothing in this file may import from `../client` or from any module that
 * does. Keep it pure strings and types.
 */

/** Owner key for the homepage comparison slider. */
export const HOMEPAGE_BEFORE_AFTER_KEY = "homepage";

/** Owner key for one service page's own cases. */
export function serviceBeforeAfterKey(serviceId: string): string {
  return `service:${serviceId}`;
}

/** A published case, locale-resolved, as handed to the public component. */
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

/** One row as the admin editor holds it, before it is saved. */
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
