import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

/**
 * On-demand ISR invalidation for the custom Neon CMS.
 *
 * Most pages are cached with `export const revalidate = 86400`, so content
 * edited straight in the database (or by a seed script) only shows up after the
 * ISR window elapses. This endpoint drops the cache for the affected paths
 * immediately.
 *
 * Auth: `x-revalidate-secret` must match REVALIDATE_SECRET. The endpoint fails
 * closed — if the env var is not configured it refuses every request rather
 * than accepting anonymous ones.
 *
 * Body — either form, or both at once:
 *   { "entity": "service", "slug": "couperose-treatment" }
 *   { "paths": ["/services/apparatus-cosmetology", "/sitemap.xml"] }
 *
 * Driven from the CLI by scripts/revalidate.ts.
 */

/** Locale path prefixes. "" is the default (ua) locale, which has no prefix. */
const LOCALE_PREFIXES = ["", "/ru", "/en"] as const;

/** Legacy header/env names from the Sanity era, still accepted. */
const LEGACY_HEADER = "x-sanity-secret";

type Entity =
  | "service"
  | "serviceCategory"
  | "staticPage"
  | "doctor"
  | "priceItem"
  | "priceCategory"
  | "navigation"
  | "siteSettings";

interface Body {
  entity?: Entity;
  /** Legacy alias for `entity`. */
  _type?: Entity;
  slug?: string;
  paths?: string[];
}

/** Prefix a path with every locale: "/services" → ["/services", "/ru/services", "/en/services"] */
function forEachLocale(path: string): string[] {
  const clean = path === "/" ? "" : path;
  return LOCALE_PREFIXES.map((p) => `${p}${clean}` || "/");
}

async function pathsForEntity(entity: Entity, slug?: string): Promise<string[]> {
  switch (entity) {
    case "service": {
      if (!slug) return [];
      // Look up the category so the detail path can be built exactly.
      const rows = await sql`
        SELECT sc.slug AS cat
        FROM services s
        JOIN service_categories sc ON sc.id = s.category_id
        WHERE s.slug = ${slug}
        LIMIT 1
      `;
      const cat = rows[0]?.cat;
      if (!cat) return [];
      return [
        ...forEachLocale(`/services/${cat}/${slug}`),
        // The detail page appears in the hub listing, so that has to go too.
        ...forEachLocale(`/services/${cat}`),
        ...forEachLocale("/services"),
      ];
    }
    case "serviceCategory":
      if (!slug) return [];
      return [...forEachLocale(`/services/${slug}`), ...forEachLocale("/services")];
    case "staticPage":
      if (!slug || slug === "home") return forEachLocale("/");
      return forEachLocale(`/${slug}`);
    case "doctor":
      return [
        ...forEachLocale("/doctors"),
        ...(slug ? forEachLocale(`/doctors/${slug}`) : []),
      ];
    case "priceItem":
    case "priceCategory":
      return forEachLocale("/prices");
    case "navigation":
    case "siteSettings":
      return forEachLocale("/");
    default:
      return [];
  }
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET || process.env.SANITY_REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { message: "REVALIDATE_SECRET is not configured — endpoint disabled" },
      { status: 503 },
    );
  }
  const provided =
    request.headers.get("x-revalidate-secret") || request.headers.get(LEGACY_HEADER);
  if (provided !== expected) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Body;
    const entity = body.entity ?? body._type;

    const paths = new Set<string>();
    // The homepage embeds service/doctor/price teasers, so it is always stale.
    forEachLocale("/").forEach((p) => paths.add(p));
    // Listings and the sitemap are derived from the same rows.
    paths.add("/sitemap.xml");

    if (entity) (await pathsForEntity(entity, body.slug)).forEach((p) => paths.add(p));
    for (const p of body.paths ?? []) {
      if (typeof p === "string" && p.startsWith("/")) paths.add(p);
    }

    for (const path of paths) revalidatePath(path, "page");

    return NextResponse.json({ revalidated: true, paths: [...paths], now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 },
    );
  }
}
