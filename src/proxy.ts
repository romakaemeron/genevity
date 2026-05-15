import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function proxy(request: NextRequest) {
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

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|studio|.*\\..*).*)"],
};
