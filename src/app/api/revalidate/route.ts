import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sanity webhook handler for on-demand ISR revalidation.
 *
 * Uses path-based revalidation for now (compatible with ISR via `revalidate = 60`).
 * Will upgrade to tag-based revalidation when migrating to Cache Components (`use cache`).
 *
 * Setup in Sanity:
 * 1. Go to sanity.io/manage → your project → API → Webhooks
 * 2. Create webhook:
 *    - URL: https://genevity.com.ua/api/revalidate
 *    - Trigger: Create, Update, Delete
 *    - Projection: { _type, "slug": slug.current, _id }
 *    - Secret: (set SANITY_REVALIDATE_SECRET in Vercel env vars)
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sanity-secret");

  if (process.env.SANITY_REVALIDATE_SECRET && secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      _type?: string;
      slug?: string;
      _id?: string;
    };

    const type = body._type || "";
    const slug = body.slug;
    const paths: string[] = [];

    // Always revalidate homepage (most content changes affect it)
    paths.push("/[locale]");

    switch (type) {
      case "service":
        if (slug) paths.push(`/[locale]/services/[category]/${slug}`);
        break;
      case "serviceCategory":
        if (slug) paths.push(`/[locale]/services/${slug}`);
        paths.push("/[locale]/services");
        break;
      case "staticPage":
        if (slug && slug !== "home") paths.push(`/[locale]/${slug}`);
        break;
      case "doctor":
        paths.push("/[locale]/doctors");
        break;
      case "navigation":
      case "siteSettings":
        // Global — revalidate layout-level data
        paths.push("/[locale]");
        break;
    }

    for (const path of paths) {
      revalidatePath(path, "page");
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 },
    );
  }
}
