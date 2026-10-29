import { NextResponse } from "next/server";

// Plain route handler so restricted roles (frontdesk) can log out without server actions.
export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  res.cookies.delete("cms_session");
  return res;
}
