import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip password check for the password page itself
  if (pathname === "/password") {
    return NextResponse.next();
  }

  // Check for access cookie
  const hasAccess = request.cookies.get("site_access")?.value === "granted";
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/password", request.url));
  }

  // Proceed with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
