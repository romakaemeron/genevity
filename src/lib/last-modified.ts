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

let cache: { map: Map<string, number>; at: number } | null = null;
let inflight: Promise<Map<string, number>> | null = null;

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

export async function getLastModifiedMap(): Promise<Map<string, number>> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.map;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const map = await fetchMap();
      cache = { map, at: Date.now() };
      return map;
    } catch {
      // Never break page delivery on a lookup failure.
      return cache?.map ?? new Map<string, number>();
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Strip the locale prefix (ru/en; ua is the unprefixed default) and slashes. */
export function normalizeContentPath(pathname: string): string {
  const seg = pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");
  if (seg[0] === "ru" || seg[0] === "en") seg.shift();
  return seg.join("/");
}
