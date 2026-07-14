import { NextRequest, NextResponse } from "next/server";
import { refreshGoogleReviews } from "@/lib/reviews/google";

export const dynamic = "force-dynamic";

// Vercel Cron calls this daily (vercel.json schedule: "0 4 * * *")
// It refreshes the cached Google reviews (GBP or Places, whichever is configured).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshGoogleReviews();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
