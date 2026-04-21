import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Admin CMS routes — no locale prefix, no i18n
const ADMIN_PATHS = ["/login", "/dashboard", "/services", "/doctors", "/equipment", "/pages", "/blog", "/forms", "/media", "/settings"];

function isAdminPath(pathname: string) {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // admin.genevity.com.ua → serve CMS routes directly (no i18n)
  if (hostname.startsWith("admin.")) {
    // Root → dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Admin routes — pass through without i18n
    if (isAdminPath(pathname)) {
      return NextResponse.next();
    }
    // Anything else on admin subdomain → dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Main site: if someone hits an admin path on main domain (dev mode), let it through
  if (isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // Main site — run i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|studio|.*\\..*).*)"],
};
