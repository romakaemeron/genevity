import { NextRequest, NextResponse } from "next/server";

const BASE = "https://genevity.com.ua";

// Vercel Cron calls this every Monday at 03:00 UTC (vercel.json schedule: "0 3 * * 1")
// It fetches both sitemaps to warm the ISR cache, ensuring Google always gets fresh data.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  for (const url of [`${BASE}/sitemap.xml`, `${BASE}/sitemap-images.xml`]) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      results[url] = res.ok ? `ok (${res.status})` : `error (${res.status})`;
    } catch (e) {
      results[url] = `failed: ${e instanceof Error ? e.message : "unknown"}`;
    }
  }

  return NextResponse.json({ refreshed: results, at: new Date().toISOString() });
}
