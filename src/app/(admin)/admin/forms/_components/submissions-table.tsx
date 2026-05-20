"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState, type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, Pause,
  MoreHorizontal, ExternalLink, Copy, CheckCircle2, Circle,
  ChevronDown, Check, Trash2,
} from "lucide-react";
import { listRecentSubmissions, setFormStatus, deleteSubmissions, type FormStatus } from "../../_actions/forms";
import { Button } from "@/components/ui/shadcn-button";
import NativeButton from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAdminLocale } from "../../_i18n/context";

/* ── Reusable CopyButton ── */
function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center w-5 h-5 rounded text-muted-foreground",
        "hover:text-foreground hover:bg-muted transition-colors shrink-0",
        className
      )}
      title="Копіювати"
    >
      <span
        key={String(copied)}
        className="animate-in fade-in zoom-in-75 duration-150"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      </span>
    </button>
  );
}

const POLL_MS = 20_000;
const FLASH_MS = 5_000;

export interface SubmissionRow {
  id: string;
  status: FormStatus;
  name: string | null;
  phone: string | null;
  direction: string | null;
  form_label: string | null;
  page_url: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string | Date;
}

interface Props {
  submissions: SubmissionRow[];
  compact?: boolean;
  noPoll?: boolean;
}

function formatDate(raw: string | Date) {
  const d = raw instanceof Date ? raw : new Date(raw);
  return d.toLocaleString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function hostOf(url: string | null) {
  if (!url) return null;
  try { const u = new URL(url); return u.hostname; } catch { return url; }
}

// STATUS_CONFIG is now built dynamically per locale inside components

function StatusBadge({ id, status, onChanged }: { id: string; status: FormStatus; onChanged: (id: string, s: FormStatus) => void }) {
  const [open, setOpen] = useState(false);
  const { t } = useAdminLocale();
  const STATUS_CONFIG = {
    new:       { label: t.submissionsTable.statusNew,       desc: t.submissionsTable.statusNewDesc,       dot: "bg-red-500",   badge: "text-foreground hover:bg-muted/60" },
    processed: { label: t.submissionsTable.statusProcessed, desc: t.submissionsTable.statusProcessedDesc, dot: "bg-green-500", badge: "text-foreground hover:bg-muted/60" },
  } as const;
  const cfg = STATUS_CONFIG[status];

  const select = (next: FormStatus) => {
    if (next === status) return;
    onChanged(id, next);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-sm font-medium",
          "transition-all duration-150 cursor-pointer select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "active:scale-95",
          cfg.badge
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
        {cfg.label}
        <ChevronDown size={9} className={cn("transition-transform duration-150", open && "rotate-180")} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-52 p-2 flex flex-col gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-2 pt-0.5 pb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.submissionsTable.statusLabel}</p>
        </div>
        {(Object.entries(STATUS_CONFIG) as [FormStatus, (typeof STATUS_CONFIG)[FormStatus]][]).map(([key, s]) => (
          <DropdownMenuItem
            key={key}
            onClick={(e) => { e.stopPropagation(); select(key); }}
            className={cn(
              "flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors",
              status === key
                ? "!bg-[#E5E0D8] !text-[#2A2520]"
                : "hover:!bg-[#F0EDE7]"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{s.label}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.desc}</p>
            </div>
            {status === key && <Check size={13} className="text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RowActions({ row, onStatusChange }: { row: SubmissionRow; onStatusChange: (id: string, s: FormStatus) => void }) {
  const router = useRouter();
  const { t } = useAdminLocale();
  const isNew = row.status === "new";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        aria-label="Дії"
        className="flex items-center justify-center size-7 rounded-[min(var(--radius-md),12px)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreHorizontal size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1.5 flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">{t.common.actions}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/forms/${row.id}`); }}>
          <ExternalLink size={13} className="mr-2 opacity-60" />
          {t.submissionsTable.openSubmission}
        </DropdownMenuItem>
        {row.phone && (
          <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(row.phone!)}>
            <Copy size={13} className="mr-2 opacity-60" />
            {t.submissionsTable.copyPhone}
          </DropdownMenuItem>
        )}
        {row.name && (
          <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(row.name!)}>
            <Copy size={13} className="mr-2 opacity-60" />
            {t.submissionsTable.copyName}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            const next: FormStatus = isNew ? "processed" : "new";
            onStatusChange(row.id, next);
          }}
          className={isNew ? "text-green-700 focus:text-green-700 focus:bg-green-50" : "text-orange-600 focus:text-orange-600 focus:bg-orange-50"}
        >
          {isNew ? <CheckCircle2 size={13} className="mr-2" /> : <Circle size={13} className="mr-2" />}
          {isNew ? t.submissionsTable.markProcessed : t.submissionsTable.returnToNew}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SubmissionsTable({ submissions: initial, compact, noPoll }: Props) {
  const router = useRouter();
  const { t } = useAdminLocale();
  const [rows, setRows] = useState<SubmissionRow[]>(initial);
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    utm_source: !compact,
    form_label: !compact,
    page_url: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [paused, setPaused] = useState(!!(compact || noPoll));
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [lastPoll, setLastPoll] = useState<number | null>(null);
  const knownIds = useRef(new Set(initial.map((s) => s.id)));
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  type PendingEntry = { prevStatus: FormStatus; timer: ReturnType<typeof setTimeout>; toastId: string | number };
  const pendingRef = useRef<Map<string, PendingEntry>>(new Map());

  type PendingDelete = { rows: SubmissionRow[]; timer: ReturnType<typeof setTimeout>; toastId: string | number };
  const pendingDeleteRef = useRef<PendingDelete | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => { setRows(initial); knownIds.current = new Set(initial.map((s) => s.id)); }, [initial]);

  const handleStatusChange = useCallback((id: string, newStatus: FormStatus) => {
    const prev = pendingRef.current.get(id);
    const prevStatus = prev?.prevStatus ?? rowsRef.current.find((r) => r.id === id)?.status;
    const rowName = rowsRef.current.find((r) => r.id === id)?.name;

    if (prev) {
      clearTimeout(prev.timer);
      toast.dismiss(prev.toastId);
    }

    setRows((p) => p.map((r) => r.id === id ? { ...r, status: newStatus } : r));

    const statusLabel = newStatus === "new" ? t.submissionsTable.statusNew : t.submissionsTable.statusProcessed;
    const entry: PendingEntry = { prevStatus: prevStatus!, timer: 0 as unknown as ReturnType<typeof setTimeout>, toastId: 0 };

    entry.toastId = toast(statusLabel, {
      description: rowName ?? t.common.status,
      action: {
        label: t.common.cancel,
        onClick: () => {
          clearTimeout(entry.timer);
          pendingRef.current.delete(id);
          if (prevStatus) setRows((p) => p.map((r) => r.id === id ? { ...r, status: prevStatus } : r));
        },
      },
      duration: 4500,
    });

    entry.timer = setTimeout(() => {
      setFormStatus(id, newStatus);
      pendingRef.current.delete(id);
    }, 4500);

    pendingRef.current.set(id, entry);
  }, []);

  useEffect(() => {
    if (paused) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const latest = await listRecentSubmissions(200);
        if (cancelled) return;
        const newlySeen = latest.filter((r) => !knownIds.current.has(r.id)).map((r) => r.id);
        if (newlySeen.length) {
          setFreshIds((p) => { const n = new Set(p); newlySeen.forEach((id) => n.add(id)); return n; });
          setTimeout(() => setFreshIds((p) => { const n = new Set(p); newlySeen.forEach((id) => n.delete(id)); return n; }), FLASH_MS);
        }
        knownIds.current = new Set(latest.map((r) => r.id));
        setRows(latest as SubmissionRow[]);
        setLastPoll(Date.now());
      } catch { /* retry next tick */ }
    };
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [paused]);

  const columns: ColumnDef<SubmissionRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Вибрати всі"
          className="translate-y-px"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Вибрати рядок"
            className="translate-y-px"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "status",
      accessorKey: "status",
      sortingFn: (a, b) => {
        // "new" sorts before "processed"
        if (a.original.status === b.original.status) return 0;
        return a.original.status === "new" ? -1 : 1;
      },
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
        >
          {t.common.status}
          {column.getIsSorted() === "asc" ? <ArrowUp size={11} className="text-primary" />
            : column.getIsSorted() === "desc" ? <ArrowDown size={11} className="text-primary" />
            : <ArrowUpDown size={11} className="opacity-40" />}
        </button>
      ),
      cell: ({ row }) => (
        <StatusBadge id={row.original.id} status={row.original.status} onChanged={handleStatusChange} />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: () => t.common.name,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name || <span className="text-muted-foreground italic">—</span>}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: () => t.common.phone,
      cell: ({ row }) => row.original.phone ? (
        <span className="inline-flex items-center gap-1.5 group/phone">
          <span className="font-mono text-[13px] text-foreground">{row.original.phone}</span>
          <CopyButton text={row.original.phone} className="opacity-0 group-hover/phone:opacity-100 transition-opacity" />
        </span>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "form_label",
      header: () => t.submissionsTable.form,
      cell: ({ row }) => <span className="text-[13px] text-muted-foreground truncate block max-w-[140px]">{row.original.form_label || "—"}</span>,
    },
    {
      accessorKey: "direction",
      header: () => t.submissionsTable.interest,
      cell: ({ row }) => <span className="text-[13px] text-foreground truncate block max-w-[180px]">{row.original.direction || <span className="text-muted-foreground">—</span>}</span>,
    },
    {
      accessorKey: "utm_source",
      header: () => t.submissionsTable.source,
      cell: ({ row }) => {
        const src = row.original.utm_source;
        if (!src) return <span className="text-muted-foreground">—</span>;
        const colors: Record<string, string> = {
          google: "bg-blue-50 text-blue-700",
          instagram: "bg-pink-50 text-pink-700",
          facebook: "bg-indigo-50 text-indigo-700",
        };
        const cls = colors[src.toLowerCase()] ?? "bg-muted text-muted-foreground";
        return <Badge variant="secondary" className={cn("text-xs font-medium px-2 py-0.5", cls)}>{src}</Badge>;
      },
    },
    {
      accessorKey: "page_url",
      header: () => t.submissionsTable.page,
      cell: ({ row }) => <span className="text-[12px] text-muted-foreground">{hostOf(row.original.page_url) || "—"}</span>,
    },
    {
      id: "created_at",
      accessorFn: (row) => new Date(row.created_at).getTime(),
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer ml-auto"
        >
          {t.common.date}
          {column.getIsSorted() === "asc" ? <ArrowUp size={11} className="text-primary" />
            : column.getIsSorted() === "desc" ? <ArrowDown size={11} className="text-primary" />
            : <ArrowUpDown size={11} className="opacity-40" />}
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-[12px] text-muted-foreground whitespace-nowrap tabular-nums">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <RowActions row={row.original} onStatusChange={handleStatusChange} />,
    },
  ];

  const filteredRows = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    if (!q) return rows;
    const digits = q.replace(/\D/g, "");
    return rows.filter((r) =>
      r.name?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      (digits && r.phone?.replace(/\D/g, "").includes(digits)) ||
      r.direction?.toLowerCase().includes(q) ||
      r.form_label?.toLowerCase().includes(q)
    );
  }, [rows, globalFilter]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedIds = Object.keys(rowSelection);
  const selectedRows = rows.filter((r) => selectedIds.includes(r.id));

  const markSelectedAs = (status: FormStatus) => {
    const ids = [...selectedIds];

    const prevStatuses = new Map(ids.map((id) => {
      const pending = pendingRef.current.get(id);
      return [id, (pending?.prevStatus ?? rowsRef.current.find((r) => r.id === id)?.status)!];
    }));

    ids.forEach((id) => {
      const pending = pendingRef.current.get(id);
      if (pending) { clearTimeout(pending.timer); toast.dismiss(pending.toastId); }
      pendingRef.current.delete(id);
    });

    setRows((p) => p.map((r) => ids.includes(r.id) ? { ...r, status } : r));
    setRowSelection({});

    const statusLabel = status === "new" ? t.submissionsTable.statusNew : t.submissionsTable.statusProcessed;
    const entry = { prevStatuses, timer: 0 as unknown as ReturnType<typeof setTimeout>, toastId: 0 as string | number };

    entry.toastId = toast(`${t.submissionsTable.statusChanged(ids.length)}${statusLabel}`, {
      description: t.submissionsTable.statusChangedFor(ids.length),
      action: {
        label: t.common.cancel,
        onClick: () => {
          clearTimeout(entry.timer);
          ids.forEach((id) => pendingRef.current.delete(id));
          setRows((p) => p.map((r) => ids.includes(r.id) ? { ...r, status: prevStatuses.get(r.id) ?? r.status } : r));
        },
      },
      duration: 4500,
    });

    entry.timer = setTimeout(() => {
      ids.forEach((id) => setFormStatus(id, status));
      ids.forEach((id) => pendingRef.current.delete(id));
    }, 4500);

    ids.forEach((id) => pendingRef.current.set(id, { prevStatus: prevStatuses.get(id)!, timer: entry.timer, toastId: entry.toastId }));
  };

  const doDelete = () => {
    const ids = [...selectedIds];
    const deletedRows = rowsRef.current.filter((r) => ids.includes(r.id));

    if (pendingDeleteRef.current) {
      clearTimeout(pendingDeleteRef.current.timer);
      toast.dismiss(pendingDeleteRef.current.toastId);
    }

    setRows((p) => p.filter((r) => !ids.includes(r.id)));
    setRowSelection({});

    const entry: PendingDelete = { rows: deletedRows, timer: 0 as unknown as ReturnType<typeof setTimeout>, toastId: 0 };

    entry.toastId = toast(
      ids.length === 1 ? t.submissionsTable.deletedOne(deletedRows[0]?.name ?? "") : t.submissionsTable.deletedMany(ids.length),
      {
        action: {
          label: t.common.cancel,
          onClick: () => {
            clearTimeout(entry.timer);
            pendingDeleteRef.current = null;
            setRows((p) => {
              const existing = new Set(p.map((r) => r.id));
              return [...deletedRows.filter((r) => !existing.has(r.id)), ...p]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            });
          },
        },
        duration: 5000,
      }
    );

    entry.timer = setTimeout(() => {
      deleteSubmissions(ids);
      pendingDeleteRef.current = null;
    }, 5000);

    pendingDeleteRef.current = entry;
  };

  const COL_LABELS: Record<string, string> = {
    name: t.common.name, phone: t.common.phone, form_label: t.submissionsTable.form,
    direction: t.submissionsTable.interest, utm_source: t.submissionsTable.source, page_url: t.submissionsTable.page, created_at: t.common.date,
  };

  return (
    <Card className="w-full overflow-hidden border border-border rounded-md shadow-sm p-0 gap-0">
      {/* Toolbar */}
      {!compact && (
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/20">
          {/* Left side — morphs between search and batch actions */}
          <div className="relative h-8 flex items-center" style={{ minWidth: 260 }}>
            {/* Search input */}
            <div className={cn(
              "absolute inset-0 flex items-center transition-[opacity,transform,filter] duration-150 ease-out",
              selectedIds.length > 0 ? "opacity-0 blur-[2px] pointer-events-none -translate-x-1 scale-[0.97]" : "opacity-100 blur-0 translate-x-0 scale-100"
            )}>
              <div className="relative w-full group/search">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within/search:text-foreground" />
                <Input
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={t.submissionsTable.searchPlaceholder}
                  className="pl-9 pr-8 h-8 bg-background text-sm placeholder:text-muted-foreground hover:border-ring/50 focus:border-ring transition-colors"
                />
                {globalFilter && (
                  <button
                    type="button"
                    onClick={() => setGlobalFilter("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs leading-none"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Batch actions */}
            <div className={cn(
              "absolute inset-0 flex items-center gap-2 transition-[opacity,transform,filter] duration-150 ease-out",
              selectedIds.length > 0 ? "opacity-100 blur-0 translate-x-0 scale-100" : "opacity-0 blur-[2px] pointer-events-none translate-x-1 scale-[0.97]"
            )}>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                {selectedIds.length} вибрано
              </span>
              {/* "Processed" button — styled like the status badge */}
              <button
                type="button"
                onClick={() => markSelectedAs("processed")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors"
              >
                <CheckCircle2 size={13} className="text-green-600" />
                Оброблено
              </button>
              {/* "New" button — plain text */}
              <button
                type="button"
                onClick={() => markSelectedAs("new")}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                Нові
              </button>
              {/* Divider */}
              <span className="w-px h-4 bg-border shrink-0" />
              {/* Delete */}
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title={`Видалити ${selectedIds.length} заявок`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {filteredRows.length} / {rows.length}
            </span>

            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium rounded-[min(var(--radius-md),12px)] border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Колонки <ChevronDown size={11} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Показувати</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(v)}
                  >
                    {COL_LABELS[col.id] ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Live indicator — hidden when polling is disabled */}
            {!noPoll && <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              title={paused ? t.submissionsTable.live : t.submissionsTable.pause}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-[min(var(--radius-md),12px)] border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {paused ? <Pause size={11} /> : (
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              )}
              <span className="tabular-nums">
                {paused ? t.submissionsTable.pause : lastPoll ? new Date(lastPoll).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : t.submissionsTable.live}
              </span>
            </button>}
          </div>
        </div>
      )}

      {/* Table */}
      {table.getRowModel().rows.length === 0 ? (
        <div className="p-16 text-center text-sm text-muted-foreground">
          {globalFilter ? t.common.noResults : t.submissionsTable.noData}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-medium text-muted-foreground h-9"
                      style={header.id === "select" ? { width: 40 } : header.id === "actions" ? { width: 48 } : undefined}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => router.push(`/admin/forms/${row.original.id}`)}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    "cursor-pointer transition-colors group",
                    freshIds.has(row.id) && "animate-pulse bg-primary/5",
                    row.getIsSelected() && "bg-primary/5"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer */}
      {!compact && table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10 text-xs text-muted-foreground">
          <span>
            {selectedIds.length > 0
              ? t.submissionsTable.footerSelected(selectedIds.length, filteredRows.length)
              : t.submissionsTable.footerTotal(filteredRows.length)}
          </span>
          <span className="text-muted-foreground/60">
            {t.submissionsTable.footerNew(rows.filter((r) => r.status === "new").length)} · {t.submissionsTable.footerProcessed(rows.filter((r) => r.status === "processed").length)}
          </span>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.submissionsTable.deleteTitle(selectedIds.length)}</AlertDialogTitle>
            <AlertDialogDescription>{t.submissionsTable.deleteDesc(selectedIds.length)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <NativeButton variant="neutral" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              {t.common.cancel}
            </NativeButton>
            <NativeButton
              variant="destructive"
              size="sm"
              onClick={() => { setDeleteDialogOpen(false); doDelete(); }}
            >
              <Trash2 size={14} />
              {t.common.delete}
            </NativeButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
