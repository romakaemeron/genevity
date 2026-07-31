import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

/** Turn Draft Mode off and return to the editor (or the blog index). */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const id = req.nextUrl.searchParams.get("id");
  return NextResponse.redirect(new URL(id ? `/admin/blog/${id}` : "/blog", req.url));
}
