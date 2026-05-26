"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, TrendingUp, Calendar, ArrowUpRight, RefreshCw,
  Globe, BarChart2, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAdminLocale } from "../_i18n/context";

const POLL_INTERVAL = 30_000;

type Range = "today" | "week" | "month";

interface AnalyticsData {
  realtimeUsers: number;
  sessions: number;
  activeUsers: number;
  bookings: number;
  conversionRate: number;
  sources: { source: string; sessions: number }[];
  servicePages: { path: string; views: number }[];
  range: Range;
  updatedAt: string;
}

function formatSource(s: string) {
  if (!s || s === "(direct)" || s === "(none)") return "Прямий";
  const map: Record<string, string> = {
    google: "Google",
    instagram: "Instagram",
    ig: "Instagram",
    facebook: "Facebook",
    fb: "Facebook",
    youtube: "YouTube",
    yt: "YouTube",
    tiktok: "TikTok",
    telegram: "Telegram",
    "vercel.com": "Vercel",
  };
  return map[s.toLowerCase()] ?? s.charAt(0).toUpperCase() + s.slice(1);
}

function formatPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  const slug = parts[parts.length - 1] ?? path;
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatCard({
  icon: Icon, label, value, sub, loading, accent,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; loading?: boolean; accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-primary/30 bg-primary/5" : ""}>
      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon size={13} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-3">
        {loading ? (
          <Skeleton className="h-7 w-20 mb-1" />
        ) : (
          <p className={`text-2xl font-semibold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
            {value}
          </p>
        )}
        {sub && !loading && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        )}
        {loading && <Skeleton className="h-3 w-14 mt-1" />}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { t } = useAdminLocale();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("today");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (r: Range, showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${r}`);
      if (!res.ok) throw new Error(await res.text());
      const json: AnalyticsData = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.analyticsPage.errorLoad);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + range change
  useEffect(() => {
    setLoading(true);
    fetchData(range);
  }, [range, fetchData]);

  // 30s realtime polling (only for "today" range)
  useEffect(() => {
    if (range !== "today") return;
    const interval = setInterval(() => fetchData("today"), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [range, fetchData]);

  const rangeLabel: Record<Range, string> = {
    today: t.analyticsPage.rangeToday,
    week: t.analyticsPage.rangeWeek,
    month: t.analyticsPage.rangeMonth,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.analyticsPage.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.analyticsPage.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList className="h-8">
              <TabsTrigger value="today" className="text-xs px-3 h-6">{t.analyticsPage.today}</TabsTrigger>
              <TabsTrigger value="week"  className="text-xs px-3 h-6">{t.analyticsPage.week}</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-6">{t.analyticsPage.month}</TabsTrigger>
            </TabsList>
          </Tabs>

          <button
            onClick={() => fetchData(range, true)}
            disabled={refreshing}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title={t.analyticsPage.refresh}
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="px-5 py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Realtime banner — only for "today" */}
      {range === "today" && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative inline-flex" aria-hidden>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500/50 animate-ping" />
              </span>
              <span className="text-sm font-medium text-green-800">
                {loading ? (
                  <Skeleton className="inline-block h-4 w-24 align-middle" />
                ) : (
                  t.analyticsPage.realtimeUsers(data?.realtimeUsers ?? 0)
                )}
              </span>
            </div>
            {data && (
              <span className="text-xs text-green-600">
                {t.analyticsPage.updatedAt(new Date(data.updatedAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label={t.analyticsPage.visitorsLabel(rangeLabel[range])}
          value={data?.sessions ?? 0}
          sub={data ? t.analyticsPage.activeUsers(data.activeUsers) : undefined}
          loading={loading}
        />
        <StatCard
          icon={Calendar}
          label={t.analyticsPage.bookingsLabel(rangeLabel[range])}
          value={data?.bookings ?? 0}
          sub={t.analyticsPage.bookingEvent}
          loading={loading}
          accent={false}
        />
        <StatCard
          icon={TrendingUp}
          label={t.analyticsPage.conversionLabel}
          value={data ? `${data.conversionRate}%` : "0%"}
          sub={t.analyticsPage.conversionSub}
          loading={loading}
        />
      </div>

      {/* Sources + Pages tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic sources */}
        <Card>
          <CardHeader className="px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe size={14} className="text-muted-foreground" />
              {t.analyticsPage.sources}
              <Badge variant="secondary" className="ml-auto text-xs">{t.analyticsPage.topN}</Badge>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {loading ? (
              <div className="px-5 py-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : !data?.sources.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">{t.common.noData}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs px-5">{t.analyticsPage.sourceCol}</TableHead>
                    <TableHead className="text-xs text-right px-5">{t.analyticsPage.sessionsCol}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sources.map((s, i) => {
                    const max = data.sources[0]?.sessions ?? 1;
                    const pct = Math.round((s.sessions / max) * 100);
                    return (
                      <TableRow key={i}>
                        <TableCell className="px-5 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-1.5 rounded-full bg-primary/20 flex-1 max-w-[80px]">
                              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm text-foreground">{formatSource(s.source)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-2.5 text-right tabular-nums text-sm font-medium">{s.sessions}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Popular service pages */}
        <Card>
          <CardHeader className="px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity size={14} className="text-muted-foreground" />
              {t.analyticsPage.topServices}
              <Badge variant="secondary" className="ml-auto text-xs">{t.analyticsPage.topN}</Badge>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {loading ? (
              <div className="px-5 py-4 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : !data?.servicePages.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">{t.common.noData}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs px-5">{t.analyticsPage.serviceCol}</TableHead>
                    <TableHead className="text-xs text-right px-5">{t.analyticsPage.viewsCol}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.servicePages.map((p, i) => {
                    const max = data.servicePages[0]?.views ?? 1;
                    const pct = Math.round((p.views / max) * 100);
                    return (
                      <TableRow key={i}>
                        <TableCell className="px-5 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-1.5 rounded-full bg-primary/20 flex-1 max-w-[80px]">
                              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm text-foreground">{formatPath(p.path)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-2.5 text-right tabular-nums text-sm font-medium">{p.views}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer note */}
      {data && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpRight size={11} />
          <span>{t.analyticsPage.ga4note}</span>
        </div>
      )}
    </div>
  );
}
