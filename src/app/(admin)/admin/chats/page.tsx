import Link from "next/link";
import { sql } from "@/lib/db/client";
import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";
import { cn } from "@/lib/utils";

const URGENCY = {
  browsing:      { label: "Переглядає",  cls: "bg-gray-100 text-gray-600" },
  interested:    { label: "Цікавиться",  cls: "bg-blue-100 text-blue-700" },
  ready_to_book: { label: "До запису",   cls: "bg-green-100 text-green-700" },
} as const;

type Range = "today" | "week" | "month";
const RANGE_LABELS: Record<Range, string> = { today: "Сьогодні", week: "7 днів", month: "30 днів" };
const RANGE_DAYS: Record<Range, number> = { today: 1, week: 7, month: 30 };

function pct(a: number, b: number) {
  if (!b) return "0%";
  return `${Math.round((a / b) * 100)}%`;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4", accent ? "border-primary/30 bg-primary/5" : "border-border bg-card")}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", accent ? "text-primary" : "text-foreground")}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, count, total, cls }: { label: string; count: number; total: number; cls: string }) {
  const w = total ? Math.max(4, Math.round((count / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0 text-right text-sm text-muted-foreground">{label}</div>
      <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
        <div className={cn("h-full rounded-lg transition-all", cls)} style={{ width: `${w}%` }} />
      </div>
      <div className="w-20 text-sm tabular-nums font-medium">{count} <span className="text-muted-foreground font-normal">({pct(count, total)})</span></div>
    </div>
  );
}

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireSession();

  const { range: rawRange = "month" } = await searchParams;
  const range = (["today", "week", "month"].includes(rawRange) ? rawRange : "month") as Range;
  const since = new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000).toISOString();

  const [statsRow, topicsRows, localeRows, rows] = await Promise.all([
    // Main stats
    sql`
      SELECT
        count(*)::int                                                         AS total,
        count(*) FILTER (WHERE msg_count > 0)::int                           AS engaged,
        count(*) FILTER (WHERE escalated_at IS NOT NULL)::int                AS escalated,
        count(*) FILTER (WHERE escalation_target = 'genevity'
                           AND escalated_at IS NOT NULL)::int                AS esc_genevity,
        count(*) FILTER (WHERE escalation_target = 'helyos'
                           AND escalated_at IS NOT NULL)::int                AS esc_helyos,
        count(*) FILTER (WHERE urgency = 'browsing')::int                    AS browsing,
        count(*) FILTER (WHERE urgency = 'interested')::int                  AS interested,
        count(*) FILTER (WHERE urgency = 'ready_to_book')::int               AS ready_to_book,
        round(avg(msg_count) FILTER (WHERE msg_count > 0))::int              AS avg_messages
      FROM (
        SELECT cs.*, count(cm.id)::int AS msg_count
        FROM   chat_sessions  cs
        LEFT JOIN chat_messages cm ON cm.session_id = cs.id
        WHERE  cs.started_at >= ${since}
        GROUP BY cs.id
      ) t
    `.then((r) => r[0] as {
      total: number; engaged: number; escalated: number;
      esc_genevity: number; esc_helyos: number;
      browsing: number; interested: number; ready_to_book: number;
      avg_messages: number | null;
    } | undefined),

    // Top topics
    sql`
      SELECT unnest(topics) AS topic, count(*)::int AS cnt
      FROM   chat_sessions
      WHERE  started_at >= ${since}
        AND  topics IS NOT NULL
        AND  array_length(topics, 1) > 0
      GROUP BY topic
      ORDER BY cnt DESC
      LIMIT 12
    ` as unknown as Promise<{ topic: string; cnt: number }[]>,

    // Locale breakdown
    sql`
      SELECT locale, count(*)::int AS cnt
      FROM   chat_sessions
      WHERE  started_at >= ${since}
      GROUP BY locale
      ORDER BY cnt DESC
    ` as unknown as Promise<{ locale: string; cnt: number }[]>,

    // Recent sessions table
    sql`
      SELECT
        id, session_token, locale, started_at, escalated_at,
        escalation_target, patient_name, patient_phone,
        urgency, topics, page_title, page_url,
        (SELECT count(*)::int FROM chat_messages WHERE session_id = chat_sessions.id) AS message_count
      FROM chat_sessions
      WHERE started_at >= ${since}
      ORDER BY started_at DESC
      LIMIT 200
    `,
  ]);

  const s = statsRow ?? {
    total: 0, engaged: 0, escalated: 0, esc_genevity: 0, esc_helyos: 0,
    browsing: 0, interested: 0, ready_to_book: 0, avg_messages: null,
  };
  const engagementRate = pct(s.engaged, s.total);
  const escalationRate = pct(s.escalated, s.engaged);
  const topTopicMax = topicsRows[0]?.cnt ?? 1;

  return (
    <div className="p-8 space-y-6">
      {/* Header + range selector */}
      <div className="flex items-start justify-between gap-4">
        <AdminPageHeader
          title="AI Чат — Аналітика"
          subtitle={`${s.total} сесій за ${RANGE_LABELS[range].toLowerCase()}`}
        />
        <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card shrink-0">
          {(["today", "week", "month"] as Range[]).map((r) => (
            <Link
              key={r}
              href={`/admin/chats?range=${r}`}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {RANGE_LABELS[r]}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Всього сесій" value={s.total} />
        <StatCard label="Почали чат" value={s.engaged} sub={engagementRate + " від сесій"} />
        <StatCard label="Ескаловано" value={s.escalated} sub={escalationRate + " від чатів"} accent />
        <StatCard label="→ Genevity" value={s.esc_genevity} />
        <StatCard label="→ Helyos" value={s.esc_helyos} />
        <StatCard label="Повід. / чат" value={s.avg_messages ?? "—"} sub="середнє" />
      </div>

      {/* Funnel + Topics row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion funnel */}
        <div className="border border-border rounded-xl bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Воронка конверсії</h3>
          <div className="space-y-2.5">
            <FunnelBar label="Почали чат"    count={s.engaged}       total={s.engaged}       cls="bg-gray-400" />
            <FunnelBar label="Цікавляться"   count={s.interested}    total={s.engaged}       cls="bg-blue-400" />
            <FunnelBar label="До запису"     count={s.ready_to_book} total={s.engaged}       cls="bg-emerald-400" />
            <FunnelBar label="Ескалація"     count={s.escalated}     total={s.engaged}       cls="bg-primary" />
          </div>
          {/* Locale mini row */}
          {localeRows.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex gap-3 flex-wrap">
              {localeRows.map((l) => (
                <span key={l.locale} className="text-xs bg-muted px-2 py-1 rounded-md">
                  <span className="uppercase font-medium">{l.locale}</span>
                  <span className="text-muted-foreground ml-1">{l.cnt}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Top topics */}
        <div className="border border-border rounded-xl bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Топ тем розмов</h3>
          {topicsRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Немає даних</p>
          ) : (
            <div className="space-y-2">
              {topicsRows.map(({ topic, cnt }) => {
                const w = Math.max(6, Math.round((cnt / topTopicMax) * 100));
                return (
                  <div key={topic} className="flex items-center gap-2.5">
                    <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-primary/20 rounded" style={{ width: `${w}%` }} />
                    </div>
                    <span className="text-xs text-foreground min-w-0 flex-[2] truncate">{topic}</span>
                    <span className="text-xs tabular-nums font-medium text-muted-foreground w-6 text-right">{cnt}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sessions table */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Сесії</h3>
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-left">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Пацієнт</th>
                <th className="px-4 py-3 font-medium">Теми</th>
                <th className="px-4 py-3 font-medium text-center">Повід.</th>
                <th className="px-4 py-3 font-medium">Ескалація</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const urgency = (r.urgency as string | null) ?? "browsing";
                const u = URGENCY[urgency as keyof typeof URGENCY] ?? URGENCY.browsing;
                const topics = (r.topics as string[] | null) ?? [];
                return (
                  <tr
                    key={r.id as string}
                    className={cn(
                      "border-t border-border hover:bg-muted/40 transition-colors",
                      r.escalated_at && "bg-amber-50/30"
                    )}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/admin/chats/${r.id}`} className="hover:underline text-foreground">
                        {new Date(r.started_at as string).toLocaleString("uk-UA", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </Link>
                      <div className="text-xs text-muted-foreground uppercase">{r.locale as string}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium", u.cls)}>
                        {u.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {(r.patient_name as string | null) ?? <span className="text-muted-foreground font-normal">—</span>}
                      </div>
                      {r.patient_phone && (
                        <div className="text-xs text-muted-foreground font-mono">{r.patient_phone as string}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {topics.slice(0, 3).map((t) => (
                            <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded-md">{t}</span>
                          ))}
                          {topics.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{topics.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{r.message_count as number}</td>
                    <td className="px-4 py-3">
                      {r.escalated_at ? (
                        <span className={cn(
                          "inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium",
                          r.escalation_target === "helyos" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {r.escalation_target === "helyos" ? "Helyos" : "Genevity"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Немає сесій за цей період</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
