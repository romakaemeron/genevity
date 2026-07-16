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
 */
const TTL_MS = 300_000; // 5 minutes

/**
 * Build-time stamp (ms), injected via `next.config.ts`'s `env.APP_BUILD_TIME`.
 * Folded into every mapped page's effective Last-Modified so a code/layout/nav
 * deploy invalidates all cached pages, not just ones with a bumped `updated_at`.
 */
const BUILD_TIME = Number(process.env.APP_BUILD_TIME) || 0;

type Snapshot = { map: Map<string, number>; globalEpoch: number };

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
 * Max `updated_at` across global surfaces (header/footer/nav content +
 * Organization JSON-LD source tables) that affect every page's HTML but
 * aren't per-page rows. `ui_strings` and `site_settings` both carry a
 * trigger-maintained `updated_at`, so a single `GREATEST` over both covers
 * a phone-number edit, address change, or UI-string tweak.
 */
async function fetchDbGlobalMax(): Promise<number> {
  const rows = (await sql`
    SELECT GREATEST(
      COALESCE((SELECT MAX(updated_at) FROM site_settings), 'epoch'::timestamptz),
      COALESCE((SELECT MAX(updated_at) FROM ui_strings), 'epoch'::timestamptz)
    ) AS g
  `) as { g: string | Date | null }[];
  const g = rows[0]?.g;
  if (!g) return 0;
  const ms = new Date(g).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

async function fetchSnapshot(): Promise<Snapshot> {
  const [map, dbGlobalMax] = await Promise.all([fetchMap(), fetchDbGlobalMax()]);
  return { map, globalEpoch: Math.max(BUILD_TIME, dbGlobalMax) };
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
      return cache?.snapshot ?? { map: new Map<string, number>(), globalEpoch: 0 };
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

/** Strip the locale prefix (ru/en; ua is the unprefixed default) and slashes. */
export function normalizeContentPath(pathname: string): string {
  const seg = pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");
  if (seg[0] === "ru" || seg[0] === "en") seg.shift();
  return seg.join("/");
}
