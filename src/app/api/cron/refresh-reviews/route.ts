import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { refreshGoogleReviews } from "@/lib/reviews/google";

export const dynamic = "force-dynamic";

/** Locale path prefixes — "" is the default (ua) locale, which has no prefix. */
const LOCALE_PREFIXES = ["", "/ru", "/en"] as const;

// Vercel Cron calls this daily (vercel.json schedule: "0 4 * * *")
// It refreshes the cached Google reviews (GBP or Places, whichever is configured).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshGoogleReviews();

    // The homepage renders the reviews block and the AggregateRating in its
    // Organization schema, and it's cached for 24h (`revalidate = 86400`).
    // Without this, freshly-pulled reviews would sit invisible until that
    // window happened to elapse. Note the Neon driver queries over fetch(), so
    // the page's cached *data* is dropped here too, not just its HTML.
    const revalidated: string[] = [];
    if (result.upserted > 0) {
      for (const prefix of LOCALE_PREFIXES) {
        const path = prefix || "/";
        revalidatePath(path, "page");
        revalidated.push(path);
      }
    }

    return NextResponse.json({ ...result, revalidated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
