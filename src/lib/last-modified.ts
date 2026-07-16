import { sql } from "@/lib/db/client";

/**
 * Cached map of `locale-agnostic page path → content updated_at (epoch ms)`,
 * used by the proxy (middleware) to emit accurate `Last-Modified` headers and
 * answer conditional `If-Modified-Since` requests with `304`.
 *
 * The date comes from each row's real `updated_at`, so a `304` is only returned
 * when the content genuinely hasn't changed — never a stale-content 304.
 *
 * In-memory, per-instance TTL cache. On any DB error it returns the last-good
 * cache (or an empty map) and NEVER throws, so a lookup failure can never break
 * page delivery — it just means no `Last-Modified` for that window.
 *
 * Keys are locale-stripped, no leading/trailing slash, e.g.:
 *   doctors/poleshko-kateryna
 *   services/injectable-cosmetology/botulinum-therapy
 *   services/injectable-cosmetology          (category hub)
 *   blog/<slug> · legal/<slug>
 *
 * Accuracy: the emitted Last-Modified is max(this page's updated_at, globalEpoch).
 * Every write path that changes a mapped page's content bumps the relevant
 * parent updated_at (see the review/sections/relations/services/doctors admin
 * actions), and globalEpoch folds in build time + site_settings/ui_strings — so
 * a 304 is only returned for genuinely-unchanged content.
 *
 * Known low-stakes residuals (accepted): a page that embeds a *copy* of another
 * entity edited in isolation can briefly lag — e.g. a related-service card's
 * price/title on a sibling service, an equipment card, or a category-gallery
 * image. These are rare, low-visibility, and self-heal on the referencing row's
 * next edit or on any deploy (build time advances globalEpoch → all pages fresh).
 */
const TTL_MS = 300_000; // 5 minutes

/**
 * Build-time stamp (ms), injected via `next.config.ts`'s `env.APP_BUILD_TIME`.
 * Folded into every mapped page's effective Last-Modified so a code/layout/nav
 * deploy invalidates all cached pages, not just ones with a bumped `updated_at`.
 */
const BUILD_TIME = Number(process.env.APP_BUILD_TIME) || 0;

/**
 * Composed pages: home (`""`) + static/index pages that aggregate many
 * entities (services grid, doctors list, FAQ items, trust blocks) rather
 * than mapping to one content row. They have no single `updated_at`, so the
 * TZ №7 "Last-Modified per page" requirement is satisfied by handing them the
 * site-wide {@link getComposedEpoch} — the latest change ANYWHERE. That
 * over-invalidates (a 304 is served only if nothing changed site-wide), which
 * is strictly safe: these pages emit no stale content, they just 304 less
 * often. Keys are locale-stripped (see {@link normalizeContentPath}).
 */
const COMPOSED_PATHS = new Set<string>([
  "", // home
  "about",
  "contacts",
  "prices",
  "stationary",
  "laboratory",
  "faq",
  "doctors", // /doctors index (per-doctor pages are precisely mapped instead)
  "services", // /services index (categories/services are precisely mapped)
]);

/** True when `path` (locale-stripped, no slashes) is a composed page. */
export function isComposedPath(path: string): boolean {
  return COMPOSED_PATHS.has(path);
}

type Snapshot = { map: Map<string, number>; globalEpoch: number; composedEpoch: number };

let cache: { snapshot: Snapshot; at: number } | null = null;
let inflight: Promise<Snapshot> | null = null;

async function fetchMap(): Promise<Map<string, number>> {
  const rows = (await sql`
    SELECT 'doctors/' || slug AS path, updated_at FROM doctors WHERE is_published = true
    UNION ALL
    SELECT 'services/' || slug AS path, updated_at FROM service_categories
    UNION ALL
    SELECT 'services/' || c.slug || '/' || s.slug AS path, s.updated_at
      FROM services s JOIN service_categories c ON c.id = s.category_id
      WHERE s.slug <> c.slug
    UNION ALL
    SELECT 'blog/' || slug AS path, updated_at FROM blog_posts WHERE published_at IS NOT NULL
    UNION ALL
    SELECT 'legal/' || slug AS path, updated_at FROM legal_docs
  `) as { path: string; updated_at: string | Date | null }[];

  const map = new Map<string, number>();
  for (const r of rows) {
    if (!r.path || !r.updated_at) continue;
    const ms = new Date(r.updated_at).getTime();
    if (!Number.isNaN(ms)) map.set(r.path, ms);
  }
  return map;
}

/**
 * Two site-wide max-`updated_at` values in one round-trip:
 *
 * - `globalMax` — global surfaces (header/footer/nav + Organization JSON-LD
 *   source tables) that affect every page's HTML but aren't per-page rows.
 *   `site_settings` + `ui_strings` both carry a trigger-maintained
 *   `updated_at`, covering a phone-number edit, address change, or UI-string
 *   tweak. Folded into every precisely-mapped page's Last-Modified.
 *
 * - `contentMax` — the latest change across ALL content tables, used as the
 *   Last-Modified for composed pages (home/static/index). `doctor_reviews`
 *   has no `updated_at` column, but a review write bumps its parent
 *   `doctors.updated_at`, so `doctors` covers it here.
 */
async function fetchDbMaxes(): Promise<{ globalMax: number; contentMax: number }> {
  const rows = (await sql`
    SELECT
      GREATEST(
        COALESCE((SELECT MAX(updated_at) FROM site_settings), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM ui_strings), 'epoch'::timestamptz)
      ) AS global_max,
      GREATEST(
        COALESCE((SELECT MAX(updated_at) FROM site_settings), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM ui_strings), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM static_pages), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM content_sections), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM services), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM service_categories), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM doctors), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM faq_items), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM blog_posts), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM legal_docs), 'epoch'::timestamptz)
      ) AS content_max
  `) as { global_max: string | Date | null; content_max: string | Date | null }[];
  const toMs = (v: string | Date | null | undefined) => {
    if (!v) return 0;
    const ms = new Date(v).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };
  return { globalMax: toMs(rows[0]?.global_max), contentMax: toMs(rows[0]?.content_max) };
}

async function fetchSnapshot(): Promise<Snapshot> {
  const [map, maxes] = await Promise.all([fetchMap(), fetchDbMaxes()]);
  return {
    map,
    globalEpoch: Math.max(BUILD_TIME, maxes.globalMax),
    composedEpoch: Math.max(BUILD_TIME, maxes.contentMax),
  };
}

async function getSnapshot(): Promise<Snapshot> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.snapshot;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const snapshot = await fetchSnapshot();
      cache = { snapshot, at: Date.now() };
      return snapshot;
    } catch {
      // Never break page delivery on a lookup failure.
      return cache?.snapshot ?? { map: new Map<string, number>(), globalEpoch: 0, composedEpoch: 0 };
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function getLastModifiedMap(): Promise<Map<string, number>> {
  return (await getSnapshot()).map;
}

/**
 * Epoch ms = `max(build time, latest site_settings/ui_strings update)`.
 * Shares the same cache/TTL/in-flight dedup as {@link getLastModifiedMap}.
 */
export async function getGlobalEpoch(): Promise<number> {
  return (await getSnapshot()).globalEpoch;
}

/**
 * Epoch ms = latest content change ANYWHERE on the site (all content tables +
 * global surfaces + build time). Used as the Last-Modified for composed pages
 * ({@link isComposedPath}). Shares the same cache/TTL/in-flight dedup.
 */
export async function getComposedEpoch(): Promise<number> {
  return (await getSnapshot()).composedEpoch;
}

/** Strip the locale prefix (ru/en; ua is the unprefixed default) and slashes. */
export function normalizeContentPath(pathname: string): string {
  const seg = pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");
  if (seg[0] === "ru" || seg[0] === "en") seg.shift();
  return seg.join("/");
}
