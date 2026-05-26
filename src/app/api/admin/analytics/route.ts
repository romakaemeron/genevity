import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { getSession } from "@/app/(admin)/admin/_actions/auth";

const PROPERTY = `properties/${process.env.GA4_PROPERTY_ID}`;

function getClient() {
  const raw = process.env.GA4_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("GA4_SERVICE_ACCOUNT_KEY not set");
  const key = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  return new BetaAnalyticsDataClient({
    credentials: { client_email: key.client_email, private_key: key.private_key },
  });
}

type Range = "today" | "week" | "month";

function dateRange(range: Range): { startDate: string; endDate: string } {
  switch (range) {
    case "week":  return { startDate: "7daysAgo",  endDate: "today" };
    case "month": return { startDate: "30daysAgo", endDate: "today" };
    default:      return { startDate: "today",     endDate: "today" };
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const range = (req.nextUrl.searchParams.get("range") ?? "today") as Range;
  const dr = dateRange(range);

  try {
    const client = getClient();

    const [realtime, mainReport, sourcesReport, pagesReport] = await Promise.all([
      // 1. Realtime: active users right now
      client.runRealtimeReport({
        property: PROPERTY,
        metrics: [{ name: "activeUsers" }],
      }),

      // 2. Today's sessions + booking_submitted count
      client.runReport({
        property: PROPERTY,
        dateRanges: [dr],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "eventCount" },
        ],
        dimensionFilter: range === "today" ? undefined : undefined,
        metricFilter: undefined,
      }),

      // 3. Top 5 traffic sources
      client.runReport({
        property: PROPERTY,
        dateRanges: [dr],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 5,
      }),

      // 4. Top 5 service pages by views
      client.runReport({
        property: PROPERTY,
        dateRanges: [dr],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "CONTAINS", value: "/services/" },
          },
        },
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 5,
      }),
    ]);

    // Separate booking_submitted count — needs its own report filtered by event name
    const [bookingsReport] = await client.runReport({
      property: PROPERTY,
      dateRanges: [dr],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "booking_submitted" },
        },
      },
    });

    const realtimeUsers = Number(realtime[0]?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    const mainRow = mainReport[0]?.rows?.[0];
    const sessions = Number(mainRow?.metricValues?.[0]?.value ?? 0);
    const activeUsers = Number(mainRow?.metricValues?.[1]?.value ?? 0);
    const bookings = Number(bookingsReport?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    const conversionRate = sessions > 0 ? Math.round((bookings / sessions) * 1000) / 10 : 0;

    const sources = (sourcesReport[0]?.rows ?? []).map((row) => ({
      source: row.dimensionValues?.[0]?.value ?? "(direct)",
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    const servicePages = (pagesReport[0]?.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "",
      views: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    return NextResponse.json({
      realtimeUsers,
      sessions,
      activeUsers,
      bookings,
      conversionRate,
      sources,
      servicePages,
      range,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[analytics API]", err);
    return NextResponse.json({ error: "Failed to fetch GA4 data" }, { status: 500 });
  }
}
