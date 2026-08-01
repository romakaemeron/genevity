"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, CalendarRange } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAdminLocale } from "../../_i18n/context";

/**
 * Date fields default to a text caret, which reads as "type here" on a control
 * that is really a picker. Cursor covers the field and the calendar glyph.
 */
const DATE_INPUT_CLASS =
  "h-7 w-full px-1.5 rounded-md border border-border bg-background text-[11px] tabular-nums " +
  "outline-none focus:border-ring cursor-pointer " +
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer";

/** Kyiv-local `YYYY-MM-DD` — the clinic's day, not the viewer's. */
function kyivToday(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Kyiv" }).format(new Date());
}

function shiftDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}

function startOfMonth(isoDate: string, monthsBack = 0): string {
  const [y, m] = isoDate.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 - monthsBack, 1));
  return d.toISOString().slice(0, 10);
}

function endOfMonth(isoDate: string, monthsBack = 0): string {
  const [y, m] = isoDate.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - monthsBack, 0));
  return d.toISOString().slice(0, 10);
}

interface ExportBody {
  ids?: string[];
  from?: string;
  to?: string;
}

export default function ExportMenu({ selectedIds }: { selectedIds: string[] }) {
  const { t } = useAdminLocale();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const today = kyivToday();
  const [from, setFrom] = useState(shiftDays(today, -30));
  const [to, setTo] = useState(today);

  const download = async (body: ExportBody) => {
    if (busy) return;
    setBusy(true);
    const toastId = toast.loading(t.submissionsTable.exportPreparing);

    try {
      const res = await fetch("/api/admin/forms/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);

      const count = Number(res.headers.get("X-Row-Count") ?? 0);

      // An empty workbook reads as "the export broke". Say so instead.
      if (!count) {
        toast.info(t.submissionsTable.exportEmpty, { id: toastId });
        return;
      }

      const blob = await res.blob();

      // Filename is chosen server-side; pull it out of Content-Disposition so
      // the two never drift apart.
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "genevity-export.xlsx";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(t.submissionsTable.exportDone(count), { id: toastId });
      setOpen(false);
    } catch (err) {
      console.error("[forms/export]", err);
      toast.error(t.submissionsTable.exportFailed, { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const presets: { label: string; body: ExportBody }[] = [
    { label: t.submissionsTable.exportToday, body: { from: today, to: today } },
    { label: t.submissionsTable.exportYesterday, body: { from: shiftDays(today, -1), to: shiftDays(today, -1) } },
    { label: t.submissionsTable.exportLast7, body: { from: shiftDays(today, -6), to: today } },
    { label: t.submissionsTable.exportLast30, body: { from: shiftDays(today, -29), to: today } },
    { label: t.submissionsTable.exportThisMonth, body: { from: startOfMonth(today), to: today } },
    { label: t.submissionsTable.exportPrevMonth, body: { from: startOfMonth(today, 1), to: endOfMonth(today, 1) } },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        title={t.submissionsTable.exportTitle}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-[min(var(--radius-md),12px)] border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        disabled={busy}
      >
        {busy ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
        {t.submissionsTable.exportLabel}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        {/* Base UI requires GroupLabel to sit inside a Group. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            {t.submissionsTable.exportTitle}
            <span className="block font-normal text-[11px] text-muted-foreground/70 mt-0.5">
              {t.submissionsTable.exportHint}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {selectedIds.length > 0 && (
          <>
            <DropdownMenuItem onClick={() => download({ ids: selectedIds })} className="cursor-pointer">
              <Download size={13} className="mr-2 opacity-60" />
              {t.submissionsTable.exportSelected(selectedIds.length)}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {presets.map((p) => (
          <DropdownMenuItem key={p.label} onClick={() => download(p.body)} className="cursor-pointer">
            {p.label}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => download({})} className="font-medium cursor-pointer">
          {t.submissionsTable.exportAll}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        {/* Custom range — kept inside the menu, so clicks must not close it. */}
        <div
          className="px-2 py-2 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarRange size={11} />
            {t.submissionsTable.exportCustom}
          </p>
          <div className="flex items-center gap-1.5">
            <label className="flex-1 flex flex-col gap-0.5 cursor-pointer">
              <span className="text-[10px] text-muted-foreground">{t.submissionsTable.exportFrom}</span>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className={DATE_INPUT_CLASS}
              />
            </label>
            <label className="flex-1 flex flex-col gap-0.5 cursor-pointer">
              <span className="text-[10px] text-muted-foreground">{t.submissionsTable.exportTo}</span>
              <input
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(e) => setTo(e.target.value)}
                className={DATE_INPUT_CLASS}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={busy || !from || !to || from > to}
            onClick={() => download({ from, to })}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 h-7 w-full rounded-md text-xs font-medium",
              "bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            <Download size={12} />
            {t.submissionsTable.exportDownload}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
