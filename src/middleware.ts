import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // admin.genevity.com.ua → redirect to /studio
  if (hostname.startsWith("admin.")) {
    const { pathname } = request.nextUrl;

    // Already on studio route — let it through
    if (pathname.startsWith("/studio")) {
      return NextResponse.next();
    }

    // Redirect root and any other path to /studio
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  // Main site — run i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|studio|.*\\..*).*)"],
};
