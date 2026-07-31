import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { getSession } from "@/app/(admin)/admin/_actions/auth";
import { buildXlsx, type XlsxValue } from "@/lib/xlsx";
import { getAdminLocale } from "@/app/(admin)/admin/_i18n/server";
import { EXPORT_STRINGS } from "./strings";

export const runtime = "nodejs";
// The export must reflect submissions received seconds ago, never a cached page.
export const dynamic = "force-dynamic";

const TZ = "Europe/Kyiv";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Guardrail so a runaway request can't try to serialize the whole table at once. */
const MAX_ROWS = 20_000;

interface ExportRequest {
  /** Explicit ids win over the date range — used by "export selected". */
  ids?: string[];
  /** ISO date (YYYY-MM-DD), inclusive, interpreted in Kyiv time. */
  from?: string;
  /** ISO date (YYYY-MM-DD), inclusive, interpreted in Kyiv time. */
  to?: string;
  status?: "new" | "processed";
}

interface Row {
  id: string;
  status: string;
  form_type: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  direction: string | null;
  preferred_time: string | null;
  form_label: string | null;
  page_url: string | null;
  page_title: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  created_at: Date;
  processed_at: Date | null;
}

/* ── Kyiv-local date helpers ─────────────────────────────────────────────
 * The admin picks calendar days as they experience them in Kyiv, but
 * created_at is stored as an absolute instant. Converting the boundary in
 * the app (rather than with AT TIME ZONE in SQL) keeps the query index-
 * friendly on created_at. */

/** Offset of `timeZone` from UTC, in minutes, at the given instant. */
function tzOffsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60_000;
}

/** `YYYY-MM-DD` + wall-clock time in Kyiv → the corresponding UTC instant. */
function kyivDayBoundary(isoDate: string, endOfDay: boolean): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  const [, y, mo, d] = m;
  const naive = Date.UTC(
    Number(y), Number(mo) - 1, Number(d),
    endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0,
  );
  // Resolve the offset at the naive instant, then correct — accurate except
  // for the two ambiguous hours a year at a DST switch, which is immaterial
  // for a day-granularity filter.
  const offset = tzOffsetMinutes(new Date(naive), TZ);
  return new Date(naive - offset * 60_000);
}

function fmt(date: Date | null, opts: Intl.DateTimeFormatOptions): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("uk-UA", { timeZone: TZ, ...opts }).format(date);
}

function hostOf(url: string | null): string {
  if (!url) return "";
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function pathOf(url: string | null): string {
  if (!url) return "";
  try { return new URL(url).pathname; } catch { return ""; }
}

/** Language a submission came from, read off the URL's locale prefix. */
function localeOf(url: string | null): string {
  const path = pathOf(url);
  if (path.startsWith("/ru/") || path === "/ru") return "ru";
  if (path.startsWith("/en/") || path === "/en") return "en";
  return path ? "uk" : "";
}

/** Counts grouped by a field, biggest first — the shape every summary block uses. */
function tally(rows: Row[], pick: (r: Row) => string | null, emptyLabel: string) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = (pick(r) || "").trim() || emptyLabel;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: ExportRequest;
  try {
    body = (await req.json()) as ExportRequest;
  } catch {
    body = {};
  }

  const t = EXPORT_STRINGS[await getAdminLocale()];

  // Drop anything that isn't a uuid before it reaches the query — the `id`
  // column is typed `uuid`, so a malformed value would throw rather than
  // return nothing.
  const ids = (body.ids ?? []).filter((id) => typeof id === "string" && UUID_RE.test(id));
  const from = body.from ? kyivDayBoundary(body.from, false) : null;
  const to = body.to ? kyivDayBoundary(body.to, true) : null;
  const status = body.status === "new" || body.status === "processed" ? body.status : null;

  if (body.ids?.length && !ids.length) {
    return NextResponse.json({ error: "No valid ids" }, { status: 400 });
  }
  if (from && to && from > to) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  // Each branch is its own tagged template so every user-supplied value stays
  // a bound parameter — the column list is static SQL, never interpolated.
  const raw = ids.length
    ? await sql`
        SELECT id, status, form_type, name, phone, email, message, direction,
               preferred_time, form_label, page_url, page_title, referrer,
               utm_source, utm_medium, utm_campaign, utm_term, utm_content,
               created_at, processed_at
        FROM form_submissions
        WHERE id = ANY(${ids}::uuid[])
        ORDER BY created_at DESC
        LIMIT ${MAX_ROWS}
      `
    : await sql`
        SELECT id, status, form_type, name, phone, email, message, direction,
               preferred_time, form_label, page_url, page_title, referrer,
               utm_source, utm_medium, utm_campaign, utm_term, utm_content,
               created_at, processed_at
        FROM form_submissions
        WHERE (${from}::timestamptz IS NULL OR created_at >= ${from}::timestamptz)
          AND (${to}::timestamptz   IS NULL OR created_at <= ${to}::timestamptz)
          AND (${status}::text      IS NULL OR status::text = ${status}::text)
        ORDER BY created_at DESC
        LIMIT ${MAX_ROWS}
      `;

  const rows = raw as unknown as Row[];

  /* ── Sheet 1: one row per submission, every stored field ── */

  const detailColumns = [
    { header: "#", width: 6 },
    { header: t.col.date, width: 18 },
    { header: t.col.day, width: 12 },
    { header: t.col.hour, width: 8 },
    { header: t.col.status, width: 13 },
    { header: t.col.name, width: 22 },
    { header: t.col.phone, width: 18 },
    { header: t.col.email, width: 24 },
    { header: t.col.interest, width: 30 },
    { header: t.col.formLabel, width: 24 },
    { header: t.col.formType, width: 16 },
    { header: t.col.preferredTime, width: 18 },
    { header: t.col.message, width: 40 },
    { header: t.col.source, width: 14 },
    { header: t.col.medium, width: 14 },
    { header: t.col.campaign, width: 20 },
    { header: t.col.term, width: 16 },
    { header: t.col.content, width: 16 },
    { header: t.col.referrer, width: 26 },
    { header: t.col.pageHost, width: 18 },
    { header: t.col.pagePath, width: 34 },
    { header: t.col.pageTitle, width: 34 },
    { header: t.col.lang, width: 8 },
    { header: t.col.processedAt, width: 18 },
    { header: t.col.responseHours, width: 14 },
    { header: t.col.id, width: 38 },
  ];

  const detailRows: XlsxValue[][] = rows.map((r, i) => {
    const created = new Date(r.created_at);
    const processed = r.processed_at ? new Date(r.processed_at) : null;
    const responseHours = processed
      ? Math.round(((processed.getTime() - created.getTime()) / 3_600_000) * 10) / 10
      : null;

    return [
      i + 1,
      created,
      fmt(created, { weekday: "long" }),
      Number(fmt(created, { hour: "2-digit", hourCycle: "h23" })),
      r.status === "processed" ? t.status.processed : t.status.new,
      r.name ?? "",
      r.phone ?? "",
      r.email ?? "",
      r.direction ?? "",
      r.form_label ?? "",
      r.form_type ?? "",
      r.preferred_time ?? "",
      r.message ?? "",
      r.utm_source ?? "",
      r.utm_medium ?? "",
      r.utm_campaign ?? "",
      r.utm_term ?? "",
      r.utm_content ?? "",
      r.referrer ?? "",
      hostOf(r.page_url),
      pathOf(r.page_url),
      r.page_title ?? "",
      localeOf(r.page_url),
      processed,
      responseHours,
      r.id,
    ];
  });

  /* ── Sheet 2: the breakdowns ops actually asks for ── */

  const processedCount = rows.filter((r) => r.status === "processed").length;
  const withResponse = rows.filter((r) => r.processed_at);
  const avgResponseHours = withResponse.length
    ? Math.round(
        (withResponse.reduce(
          (sum, r) => sum + (new Date(r.processed_at!).getTime() - new Date(r.created_at).getTime()),
          0,
        ) / withResponse.length / 3_600_000) * 10,
      ) / 10
    : null;

  const dates = rows.map((r) => new Date(r.created_at).getTime());
  const rangeLabel = ids.length
    ? t.summary.rangeSelected(rows.length)
    : from || to
      ? `${from ? fmt(from, { dateStyle: "short" }) : "…"} — ${to ? fmt(to, { dateStyle: "short" }) : "…"}`
      : t.summary.rangeAll;

  const summaryRows: XlsxValue[][] = [
    [t.summary.generated, fmt(new Date(), { dateStyle: "short", timeStyle: "short" })],
    [t.summary.generatedBy, session.name || session.email],
    [t.summary.period, rangeLabel],
    [t.summary.total, rows.length],
    [t.summary.newCount, rows.length - processedCount],
    [t.summary.processedCount, processedCount],
    [t.summary.avgResponse, avgResponseHours],
    [
      t.summary.firstLast,
      dates.length
        ? `${fmt(new Date(Math.min(...dates)), { dateStyle: "short" })} — ${fmt(new Date(Math.max(...dates)), { dateStyle: "short" })}`
        : "",
    ],
  ];

  const block = (title: string, entries: [string, number][]) => {
    summaryRows.push([], [title, t.summary.countHeader]);
    if (!entries.length) summaryRows.push([t.summary.noData, 0]);
    for (const [label, count] of entries) summaryRows.push([label, count]);
  };

  block(t.summary.byDirection, tally(rows, (r) => r.direction, t.summary.notSet));
  block(t.summary.byForm, tally(rows, (r) => r.form_label, t.summary.notSet));
  block(t.summary.bySource, tally(rows, (r) => r.utm_source, t.summary.direct));
  block(t.summary.byCampaign, tally(rows, (r) => r.utm_campaign, t.summary.notSet));
  block(t.summary.byPage, tally(rows, (r) => pathOf(r.page_url), t.summary.notSet));
  block(t.summary.byLang, tally(rows, (r) => localeOf(r.page_url), t.summary.notSet));
  block(
    t.summary.byDay,
    tally(rows, (r) => fmt(new Date(r.created_at), { dateStyle: "short" }), t.summary.notSet)
      .sort((a, b) => a[0].localeCompare(b[0])),
  );
  block(
    t.summary.byHour,
    tally(rows, (r) => `${fmt(new Date(r.created_at), { hour: "2-digit", hourCycle: "h23" })}:00`, t.summary.notSet)
      .sort((a, b) => a[0].localeCompare(b[0])),
  );

  const file = buildXlsx({
    timeZone: TZ,
    sheets: [
      { name: t.sheet.detail, columns: detailColumns, rows: detailRows },
      {
        name: t.sheet.summary,
        columns: [{ header: t.summary.metric, width: 46 }, { header: t.summary.value, width: 22 }],
        rows: summaryRows,
      },
    ],
  });

  const stamp = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date());
  const filename = `genevity-zayavky-${stamp}.xlsx`;

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(file.length),
      "Cache-Control": "no-store",
      "X-Row-Count": String(rows.length),
    },
  });
}
