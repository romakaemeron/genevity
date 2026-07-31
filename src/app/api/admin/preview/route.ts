import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getSession } from "@/app/(admin)/admin/_actions/auth";
import { adminGetPostById } from "@/lib/db/queries/blog";

/**
 * Enable Next.js Draft Mode for an admin editor and send them to the article.
 *
 * Gated on the admin JWT session — without it, anyone holding a post id could
 * mint a draft-mode cookie and read unpublished content.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const post = await adminGetPostById(id);
  if (!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`/blog/${post.slug}`, req.url));
}
