import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sanity webhook handler for on-demand ISR revalidation.
 *
 * Setup in Sanity:
 * 1. Go to sanity.io/manage → your project → API → Webhooks
 * 2. Create webhook:
 *    - URL: https://genevity.com.ua/api/revalidate
 *    - Trigger: Create, Update, Delete
 *    - Filter: _type in ["equipment", "doctor", "faq", "hero", "about", "siteSettings", "uiStrings"]
 *    - Secret: (set SANITY_REVALIDATE_SECRET in Vercel env vars)
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sanity-secret");

  // Verify webhook secret (optional but recommended)
  if (process.env.SANITY_REVALIDATE_SECRET && secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    // Revalidate all locale variants of the homepage
    revalidatePath("/[locale]", "page");

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 }
    );
  }
}
