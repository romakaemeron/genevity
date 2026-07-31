import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import {
  getComposedEpoch,
  getGlobalEpoch,
  getLastModifiedMap,
  isComposedPath,
  normalizeContentPath,
} from "@/lib/last-modified";

const intlMiddleware = createMiddleware(routing);

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Draft-preview pass-through on the admin subdomain.
 *
 * Both cookies the preview depends on — Next's `__prerender_bypass` and our
 * `cms_session` JWT — are host-scoped to `admin.*`, so the preview cannot be
 * redirected to the apex host: the cookies would not travel. The article has to
 * render on the admin host, which means `/blog/<slug>` must reach the intl
 * middleware instead of being rewritten to `/admin/blog/<slug>` (the editor
 * route, which would then look up a slug in a `uuid` column and 500).
 *
 * Deliberately narrow — article paths only, and only when BOTH cookies are
 * present — so the public site is not otherwise reachable on the admin host.
 * Presence is only a routing signal; Next still verifies the bypass token, so a
 * forged cookie pair gets the published page, never draft content.
 */
function isAdminDraftPreview(request: NextRequest, pathname: string) {
  if (!pathname.startsWith("/blog/")) return false;
  return request.cookies.has("__prerender_bypass") && request.cookies.has("cms_session");
}

/**
 * Map an admin-host preview URL onto the internal locale-prefixed article route,
 * or `null` if it is not an article URL. Done here rather than by delegating to
 * `intlMiddleware` because the preview response has to carry a nonce injected
 * into the *request* headers (see `adminPreviewResponse`), which requires
 * building the rewrite ourselves.
 */
function adminPreviewRewritePath(pathname: string): string | null {
  const m = /^\/(?:([a-z]{2})\/)?blog\/([^/]+)\/?$/.exec(pathname);
  if (!m) return null;
  const [, maybeLocale, slug] = m;
  if (maybeLocale) {
    return (routing.locales as readonly string[]).includes(maybeLocale)
      ? `/${maybeLocale}/blog/${slug}`
      : null;
  }
  return `/${routing.defaultLocale}/blog/${slug}`;
}

/**
 * Render a draft preview on the admin origin under a restrictive CSP.
 *
 * This is the only branch where the public article template — which injects the
 * post body via `dangerouslySetInnerHTML` with no sanitizer — renders on the
 * authenticated CMS origin. A CMS user without super-admin rights can store
 * arbitrary HTML in a post body, so without this header an `<img onerror=…>`
 * payload would execute same-origin when a reviewer opens the preview and could
 * drive admin server actions as them (`cms_session` is httpOnly but SameSite=lax
 * and rides along on same-origin requests).
 *
 * `script-src` grants no `'unsafe-inline'`, which is what blocks inline event
 * handlers and `javascript:` URLs; Next's own inline bootstrap is allowed via a
 * per-request nonce, which Next picks up by parsing the CSP off the *request*
 * headers. `'self'` covers Next's chunk files so hydration still works.
 *
 * Scoped to this branch only — the public site's headers are untouched.
 */
function adminPreviewResponse(request: NextRequest, rewritePath: string): NextResponse {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "media-src 'self' https:",
    "connect-src 'self'",
    "frame-src https:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("content-security-policy", csp);

  const url = request.nextUrl.clone();
  url.pathname = rewritePath;

  // No conditional caching here: a draft preview must never be answered with a
  // 304 derived from the published page's Last-Modified.
  const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

/**
 * Emit `Last-Modified` from the page's real content `updated_at`, and answer
 * conditional `If-Modified-Since` with `304` when unchanged. Applied only to
 * canonical page pass-throughs (200) for GET/HEAD — never to redirects, so a
 * wrong-locale/hub URL that would 3xx is left untouched.
 */
async function withConditionalCaching(
  request: NextRequest,
  pathname: string,
  res: NextResponse,
): Promise<NextResponse> {
  const method = request.method;
  if (method !== "GET" && method !== "HEAD") return res;
  if (res.status < 200 || res.status >= 300) return res; // skip redirects/errors

  const contentPath = normalizeContentPath(pathname);

  let lastMod: number;
  if (isComposedPath(contentPath)) {
    // Home/static/index pages aggregate many entities — hand them the
    // site-wide latest-change epoch (safe over-invalidation, never stale).
    lastMod = await getComposedEpoch();
  } else {
    const pageUpdatedAt = (await getLastModifiedMap()).get(contentPath);
    if (!pageUpdatedAt) return res; // unmapped page — leave untouched, no invented date
    const globalEpoch = await getGlobalEpoch();
    lastMod = Math.max(pageUpdatedAt, globalEpoch);
  }
  if (!lastMod) return res; // no usable date (cold fail-safe) — don't invent one
  const lastModSec = Math.floor(lastMod / 1000) * 1000; // HTTP dates are second-precision
  const httpDate = new Date(lastModSec).toUTCString();

  const ims = request.headers.get("if-modified-since");
  const imsMs = ims ? Date.parse(ims) : NaN;
  if (!Number.isNaN(imsMs) && lastModSec <= imsMs) {
    const notModified = new NextResponse(null, { status: 304, headers: { "Last-Modified": httpDate } });
    // Preserve shared-cache-relevant headers from the pass-through response so
    // CDNs/proxies key and cache the 304 the same way they would the 200.
    for (const name of ["cache-control", "vary", "etag"]) {
      const value = res.headers.get(name);
      if (value) notModified.headers.set(name, value);
    }
    return notModified;
  }

  res.headers.set("Last-Modified", httpDate);
  return res;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // Redirect www → non-www with true 301
  // (next.config redirects() only produce 308; Vercel domain redirects default to 307)
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // Admin subdomain → always treat as /admin/* (no i18n)
  if (host.startsWith("admin.")) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (isAdminDraftPreview(request, pathname)) {
      const rewritePath = adminPreviewRewritePath(pathname);
      if (rewritePath) return adminPreviewResponse(request, rewritePath);
    }
    if (!isAdminPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Main domain: /admin/* bypasses i18n
  if (isAdminPath(pathname)) {
    return NextResponse.next();
  }

  return withConditionalCaching(request, pathname, intlMiddleware(request) as NextResponse);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|studio|.*\\..*).*)"],
};
