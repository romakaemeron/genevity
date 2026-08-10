import { revalidatePath } from "next/cache";
import { revalidateBlog } from "./revalidate-blog";

/**
 * Expire every cached page and route handler in one call.
 *
 * `revalidatePath("/", "layout")` expires exactly one tag — `_N_T_/layout` —
 * and every prerendered entry carries it, because they all nest inside the root
 * layout. Verified against next@16.1.6 by reading `x-next-cache-tags` out of
 * `.next/server/app/**\/*.meta`:
 *
 *   ua.meta                       _N_T_/layout,_N_T_/[locale]/layout,…
 *   ua/about.meta                 _N_T_/layout,_N_T_/[locale]/(pages)/about/page,…
 *   ua/services/…/emface.meta     _N_T_/layout,_N_T_/[locale]/services/[category]/[slug]/page,…
 *   robots.txt.meta               _N_T_/layout,_N_T_/robots.txt/route,…
 *   sitemap.xml.meta              _N_T_/layout,_N_T_/sitemap.xml/route,…
 *
 * So this covers pages and route handlers alike. Tag matching is exact string
 * equality (see the long note in `revalidate-blog.ts` for how easily narrower
 * patterns silently match nothing) — `/layout` is the one tag they all share.
 *
 * The blog is still purged explicitly: its pages sit under a `(pages)` route
 * group, and keeping the call means this keeps working even if the blog is ever
 * moved out from under the root layout.
 */
export function revalidateWholeSite(): void {
  revalidatePath("/", "layout");
  revalidateBlog();
}
