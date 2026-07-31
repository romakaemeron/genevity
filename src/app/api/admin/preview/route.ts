import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getSession } from "@/app/(admin)/admin/_actions/auth";
import { adminGetPostById } from "@/lib/db/queries/blog";
import { BLOG_HIDDEN_ON_PRODUCTION } from "@/lib/blog-visibility";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  // The blog is hidden on production, so the article page an editor would land
  // on just redirects away. Refuse before enabling Draft Mode — otherwise the
  // bypass cookie would be left set with no banner and no way to clear it.
  if (BLOG_HIDDEN_ON_PRODUCTION) {
    return NextResponse.json({ error: "preview unavailable" }, { status: 404 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  // blog_posts.id is a `uuid` column — a malformed id would otherwise throw
  // Postgres' "invalid input syntax for type uuid" and surface as a 500.
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "post not found" }, { status: 404 });

  const post = await adminGetPostById(id);
  if (!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`/blog/${post.slug}`, req.url));
}
