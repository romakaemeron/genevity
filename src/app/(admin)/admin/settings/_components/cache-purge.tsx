"use client";

/**
 * "Оновити кеш сайту" control (/admin/settings).
 *
 * Public pages are cached for 24 hours, so anything changed outside the admin
 * editors — a seed script, a direct DB edit, the nightly Google-reviews pull —
 * can stay invisible until that window elapses. This drops the whole cache on
 * demand.
 */

import { useState, useTransition } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { purgeSiteCache } from "../../_actions/cache";
import { useAdminLocale } from "../../_i18n/context";

export default function CachePurge() {
  const { t } = useAdminLocale();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; at: string; error?: string } | null>(null);

  function run() {
    setResult(null);
    startTransition(async () => {
      setResult(await purgeSiteCache());
    });
  }

  const formatted = result
    ? new Date(result.at).toLocaleString("uk-UA", {
        day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
        timeZone: "Europe/Kyiv",
      })
    : null;

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{t.cachePage.title}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">{t.cachePage.description}</p>
        </div>
        <Button variant="neutral" size="sm" onClick={run} disabled={pending}>
          <RefreshCw size={14} className={pending ? "animate-spin" : ""} />
          {pending ? t.cachePage.running : t.cachePage.action}
        </Button>
      </div>

      {result?.ok && (
        <p className="mt-4 flex items-center gap-2 text-xs text-success bg-success-light rounded-lg px-3 py-2">
          <Check size={14} className="shrink-0" />
          {t.cachePage.done} · {formatted}
        </p>
      )}
      {result && !result.ok && (
        <p className="mt-4 flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertCircle size={14} className="shrink-0" />
          {t.cachePage.failed}
          {result.error ? ` — ${result.error}` : ""}
        </p>
      )}
    </div>
  );
}
