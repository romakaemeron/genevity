import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getLastModifiedMap, normalizeContentPath } from "@/lib/last-modified";

const intlMiddleware = createMiddleware(routing);

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
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

  const lastMod = (await getLastModifiedMap()).get(normalizeContentPath(pathname));
  if (!lastMod) return res;

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
