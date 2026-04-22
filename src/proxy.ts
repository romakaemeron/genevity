import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Admin subdomain → always treat as /admin/* (no i18n)
  if (hostname.startsWith("admin.")) {
    // Root on admin subdomain → /admin/dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    // If request doesn't already start with /admin, rewrite so route resolves
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

  // Everything else → i18n (client site)
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|studio|.*\\..*).*)"],
};
