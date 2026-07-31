import { revalidatePath } from "next/cache";

/**
 * Drop the ISR cache for every blog surface.
 *
 * The public blog lives at `src/app/[locale]/(pages)/blog/...`, so its route has
 * a dynamic `[locale]` segment. `revalidatePath('/blog')` — a concrete URL — does
 * not match a dynamic route; the route-pattern form with type 'page' does, and it
 * covers all three locales in one call.
 *
 * Two details make or break this, both verified against next@16.1.6 by reading
 * `.next/server/app/**\/*.meta` and confirmed empirically (see below):
 *
 * 1. The route group `(pages)` MUST be part of the pattern. `revalidatePath(p, t)`
 *    expires the exact tag `_N_T_<p>/<t>`, and matching is exact string equality
 *    (`areTagsExpired` in Next's tags manifest). A cached blog post stores
 *    `x-next-cache-tags: …,_N_T_/[locale]/(pages)/blog/[slug]/page,_N_T_/ua/blog/<slug>`
 *    — so `/[locale]/blog/[slug]` (route group omitted) matches nothing at all.
 * 2. The concrete-URL alternative would have to be the *rewritten* path. next-intl's
 *    proxy rewrites the unprefixed Ukrainian URL to `/ua/blog/<slug>` (visible as
 *    `x-middleware-rewrite`), and that tag carries no `/page` suffix. The pattern
 *    form avoids needing either the locale prefix or the slug.
 *
 * Empirically verified 2026-07-31 with `npm run build && npx next start`
 * (next 16.1.6, Turbopack, cacheComponents disabled), using a throwaway post:
 *   - `/blog/<slug>` served `x-nextjs-cache: HIT` and kept serving the OLD title
 *     after the row changed in the database — so the harness can see the cache.
 *   - `revalidatePath("/[locale]/blog/[slug]", "page")` (no route group) left it
 *     `HIT` with the old title; so did the concrete `/ua/blog/<slug>` + "page".
 *   - `revalidatePath("/[locale]/(pages)/blog/[slug]", "page")` flipped the very
 *     next request to `MISS` with the NEW title on `/blog/…`, `/ru/blog/…` and
 *     `/en/blog/…`, then back to `HIT`.
 * On-demand revalidation therefore works here; no time-based fallback is needed.
 *
 * The blog index `/[locale]/(pages)/blog` reads `searchParams` (the ?category
 * filter) so it renders dynamically and is never cached; `/admin/blog` is dynamic
 * too. Both calls are harmless insurance in case that ever changes.
 */
export function revalidateBlog() {
  revalidatePath("/[locale]/(pages)/blog", "page");
  revalidatePath("/[locale]/(pages)/blog/[slug]", "page");
  // Sitemaps are route handlers; their tag is the route path with no type. The
  // image sitemap's real route is /sitemap-images — /sitemap-images.xml is only a
  // next.config rewrite, so revalidating the .xml alias would hit nothing.
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemap-images");
  revalidatePath("/(admin)/admin/blog", "page");
}
