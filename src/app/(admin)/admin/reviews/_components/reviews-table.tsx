"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type ColumnDef, type SortingState, type RowSelectionState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Search, Eye, EyeOff, Pencil, Plus, Trash2,
  MoreHorizontal, ChevronDown, Check, ArrowUp, ArrowDown, ArrowUpDown, Loader2,
} from "lucide-react";
import {
  setReviewPublished, deleteReview, saveReviewEdit, createReview,
  type ReviewRow, type DoctorOption,
} from "../../_actions/reviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NativeButton from "@/components/ui/Button";
import { Button } from "@/components/ui/shadcn-button";
import { cn } from "@/lib/utils";
import { useAdminLocale } from "../../_i18n/context";

/* ─── Stars ──────────────────────────────────────────────────────────────── */
function Stars({ n, onChange }: { n: number; onChange?: (v: number) => void }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type={onChange ? "button" : undefined}
          onClick={onChange ? () => onChange(i) : undefined}
          className={onChange ? "cursor-pointer focus:outline-none" : "cursor-default"}
          tabIndex={onChange ? 0 : -1}>
          <svg width={onChange ? 20 : 13} height={onChange ? 20 : 13} viewBox="0 0 24 24"
            fill={i <= n ? "#8B7B6B" : "none"} stroke={i <= n ? "#8B7B6B" : "#d1c7bb"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── LangField ──────────────────────────────────────────────────────────── */
function LangField({ label, name, value, onChange, multiline = false }: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {multiline
        ? <textarea name={name} rows={3} value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none" />
        : <Input type="text" name={name} value={value} onChange={(e) => onChange(e.target.value)} className="bg-background border-border" />
      }
    </div>
  );
}

/* ─── Form state ─────────────────────────────────────────────────────────── */
interface FormState {
  reviewerName: string; rating: number; reviewedAt: string;
  procedureTag: string; procedureTagRu: string; procedureTagEn: string;
  reviewText: string; reviewTextRu: string; reviewTextEn: string;
  isPublished: boolean;
}

function emptyForm(today: string): FormState {
  return { reviewerName: "", rating: 5, reviewedAt: today,
    procedureTag: "", procedureTagRu: "", procedureTagEn: "",
    reviewText: "", reviewTextRu: "", reviewTextEn: "", isPublished: true };
}

function rowToForm(r: ReviewRow): FormState {
  return { reviewerName: r.reviewerName, rating: r.rating, reviewedAt: r.reviewedAt.slice(0, 10),
    procedureTag: r.procedureTag ?? "", procedureTagRu: r.procedureTagRu ?? "", procedureTagEn: r.procedureTagEn ?? "",
    reviewText: r.reviewText, reviewTextRu: r.reviewTextRu ?? "", reviewTextEn: r.reviewTextEn ?? "",
    isPublished: r.isPublished };
}

function ReviewFormFields({ form, set, showPublish = true }: {
  form: FormState; set: (k: keyof FormState, v: string | number | boolean) => void; showPublish?: boolean;
}) {
  const { t } = useAdminLocale();
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <LangField label={t.reviewsTable.patientName} name="reviewer_name" value={form.reviewerName} onChange={(v) => set("reviewerName", v)} />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.common.date}</label>
          <input type="date" value={form.reviewedAt} onChange={(e) => set("reviewedAt", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.reviewsTable.rating}</label>
        <Stars n={form.rating} onChange={(v) => set("rating", v)} />
      </div>
      <div className="rounded-xl bg-champagne-dark p-3 flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.reviewsTable.procedure}</p>
        <div className="grid grid-cols-3 gap-3">
          <LangField label="UK" name="procedure_tag" value={form.procedureTag} onChange={(v) => set("procedureTag", v)} />
          <LangField label="RU" name="procedure_tag_ru" value={form.procedureTagRu} onChange={(v) => set("procedureTagRu", v)} />
          <LangField label="EN" name="procedure_tag_en" value={form.procedureTagEn} onChange={(v) => set("procedureTagEn", v)} />
        </div>
      </div>
      <div className="rounded-xl bg-champagne-dark p-3 flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.reviewsTable.review}</p>
        <LangField label="Українська" name="review_text" value={form.reviewText} onChange={(v) => set("reviewText", v)} multiline />
        <LangField label="Російська" name="review_text_ru" value={form.reviewTextRu} onChange={(v) => set("reviewTextRu", v)} multiline />
        <LangField label="English" name="review_text_en" value={form.reviewTextEn} onChange={(v) => set("reviewTextEn", v)} multiline />
      </div>
      {showPublish && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 rounded accent-primary" />
          <span className="text-sm text-foreground">{t.reviewsTable.publish}</span>
        </label>
      )}
    </div>
  );
}

/* ─── Review Dialog ──────────────────────────────────────────────────────── */
function ReviewDialog({ open, title, onClose, busy, error, onSave, saveLabel, children }: {
  open: boolean; title: string; onClose: () => void; busy: boolean; error: string | null;
  onSave: () => void; saveLabel: string; children: React.ReactNode;
}) {
  const { t } = useAdminLocale();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-foreground">{title}</DialogTitle>
        </DialogHeader>
        {error && <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex flex-col gap-4">{children}</div>
        <DialogFooter className="gap-2 pt-4 mt-2 border-t border-border">
          <NativeButton variant="neutral" size="sm" onClick={onClose}>{t.reviewsTable.cancelEdit}</NativeButton>
          <NativeButton variant="primary" size="sm" onClick={onSave} disabled={busy}>
            {busy && <Loader2 size={14} className="animate-spin" />}
            {saveLabel}
          </NativeButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Edit modal ─────────────────────────────────────────────────────────── */
function EditModal({ row, onClose, onSaved }: { row: ReviewRow; onClose: () => void; onSaved: (u: ReviewRow) => void }) {
  const [form, setFormState] = useState<FormState>(() => rowToForm(row));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: keyof FormState, v: string | number | boolean) { setFormState((f) => ({ ...f, [k]: v })); }

  const { t } = useAdminLocale();

  async function handleSave() {
    if (!form.reviewText.trim()) { setError("Review text (UK) is required"); return; }
    setBusy(true); setError(null);
    const res = await saveReviewEdit({ id: row.id, ...form });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Save error"); return; }
    onSaved({ ...row, ...form, procedureTag: form.procedureTag || null, procedureTagRu: form.procedureTagRu || null,
      procedureTagEn: form.procedureTagEn || null, reviewTextRu: form.reviewTextRu || null, reviewTextEn: form.reviewTextEn || null });
    onClose();
  }

  return (
    <ReviewDialog open title={`${t.reviewsTable.editTitle} — ${row.doctorName}`} onClose={onClose} busy={busy} error={error} onSave={handleSave} saveLabel={t.reviewsTable.saveReview}>
      <ReviewFormFields form={form} set={set} />
    </ReviewDialog>
  );
}

/* ─── Add modal ──────────────────────────────────────────────────────────── */
function AddModal({ doctors, today, onClose, onCreated }: {
  doctors: DoctorOption[]; today: string; onClose: () => void; onCreated: (r: ReviewRow) => void;
}) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [form, setFormState] = useState<FormState>(() => emptyForm(today));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useAdminLocale();

  function set(k: keyof FormState, v: string | number | boolean) { setFormState((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!doctorId) { setError("Select a doctor"); return; }
    if (!form.reviewerName.trim()) { setError("Patient name is required"); return; }
    if (!form.reviewText.trim()) { setError("Review text (UK) is required"); return; }
    setBusy(true); setError(null);
    const res = await createReview({ doctorId, ...form });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Save error"); return; }
    const doctor = doctors.find((d) => d.id === doctorId)!;
    onCreated({ id: Math.random().toString(), doctorId, doctorName: doctor.name, doctorSlug: doctor.slug,
      ...form, procedureTag: form.procedureTag || null, procedureTagRu: form.procedureTagRu || null,
      procedureTagEn: form.procedureTagEn || null, reviewTextRu: form.reviewTextRu || null, reviewTextEn: form.reviewTextEn || null,
      reviewedAt: form.reviewedAt, submittedAt: new Date().toISOString(), sortOrder: 0, reviewLocale: "uk" });
    onClose();
  }

  return (
    <ReviewDialog open title={t.reviewsTable.addTitle} onClose={onClose} busy={busy} error={error} onSave={handleSave} saveLabel={t.reviewsTable.saveReview}>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.reviewsTable.doctor}</label>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40">
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <ReviewFormFields form={form} set={set} />
    </ReviewDialog>
  );
}

/* ─── PublishBadge ───────────────────────────────────────────────────────── */
function PublishBadge({ id, isPublished, onChanged }: {
  id: string; isPublished: boolean; onChanged: (id: string, val: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useAdminLocale();
  const options = [
    { val: true,  label: t.common.published, desc: t.reviewsTable.publish, dot: "bg-green-500" },
    { val: false, label: t.common.pending,   desc: t.reviewsTable.unpublish, dot: "bg-amber-500" },
  ];
  const current = options.find((o) => o.val === isPublished)!;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-sm font-medium",
          "transition-all duration-150 cursor-pointer select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring active:scale-95 text-foreground hover:bg-muted/60"
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", current.dot)} />
        {current.label}
        <ChevronDown size={9} className={cn("transition-transform duration-150", open && "rotate-180")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="w-52 p-2 flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
        <div className="px-2 pt-0.5 pb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.common.status}</p>
        </div>
        {options.map((opt) => (
          <DropdownMenuItem key={String(opt.val)}
            onClick={(e) => { e.stopPropagation(); if (opt.val !== isPublished) onChanged(id, opt.val); setOpen(false); }}
            className={cn("flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors",
              isPublished === opt.val ? "!bg-[#E5E0D8] !text-[#2A2520]" : "hover:!bg-[#F0EDE7]"
            )}>
            <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dot)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{opt.label}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{opt.desc}</p>
            </div>
            {isPublished === opt.val && <Check size={13} className="text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Row actions ────────────────────────────────────────────────────────── */
function RowActions({ row, onEdit, onPublishChange, onDeleteOne }: {
  row: ReviewRow;
  onEdit: (r: ReviewRow) => void;
  onPublishChange: (id: string, val: boolean) => void;
  onDeleteOne: (id: string) => void;
}) {
  const { t } = useAdminLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        aria-label={t.common.actions}
        className="flex items-center justify-center size-7 rounded-[min(var(--radius-md),12px)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreHorizontal size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1.5 flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">{t.common.actions}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
          <Pencil size={13} className="mr-2 opacity-60" /> {t.reviewsTable.editReview}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPublishChange(row.id, !row.isPublished); }}>
          {row.isPublished
            ? <EyeOff size={13} className="mr-2 opacity-60" />
            : <Eye size={13} className="mr-2 opacity-60" />}
          {row.isPublished ? t.reviewsTable.unpublish : t.reviewsTable.publish}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onDeleteOne(row.id); }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 size={13} className="mr-2" /> {t.reviewsTable.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Main table ─────────────────────────────────────────────────────────── */
type TabFilter = "all" | "pending" | "published";

interface Props { rows: ReviewRow[]; doctors: DoctorOption[]; }

export default function ReviewsTable({ rows: initial, doctors }: Props) {
  const { t } = useAdminLocale();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<TabFilter>("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "reviewedAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editingRow, setEditingRow] = useState<ReviewRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => { setRows(initial); }, [initial]);

  /* ── Deferred publish toggle with undo ─────────────────────────────────── */
  type PendingPublish = { prevVal: boolean; timer: ReturnType<typeof setTimeout>; toastId: string | number };
  const pendingPublishRef = useRef<Map<string, PendingPublish>>(new Map());

  const handlePublishChange = useCallback((id: string, newVal: boolean) => {
    const prev = pendingPublishRef.current.get(id);
    const prevVal = prev?.prevVal ?? rowsRef.current.find((r) => r.id === id)?.isPublished;
    const rowName = rowsRef.current.find((r) => r.id === id)?.reviewerName;

    if (prev) { clearTimeout(prev.timer); toast.dismiss(prev.toastId); }

    setRows((p) => p.map((r) => r.id === id ? { ...r, isPublished: newVal } : r));

    const entry: PendingPublish = { prevVal: prevVal!, timer: 0 as unknown as ReturnType<typeof setTimeout>, toastId: 0 };

    entry.toastId = toast(newVal ? t.common.published : t.common.pending, {
      description: rowName ?? t.common.status,
      action: {
        label: t.common.cancel,
        onClick: () => {
          clearTimeout(entry.timer);
          pendingPublishRef.current.delete(id);
          if (prevVal !== undefined) setRows((p) => p.map((r) => r.id === id ? { ...r, isPublished: prevVal } : r));
        },
      },
      duration: 4500,
    });

    entry.timer = setTimeout(() => {
      setReviewPublished(id, newVal);
      pendingPublishRef.current.delete(id);
    }, 4500);

    pendingPublishRef.current.set(id, entry);
  }, []);

  /* ── Batch publish ─────────────────────────────────────────────────────── */
  const markSelectedPublish = (val: boolean) => {
    const ids = [...Object.keys(rowSelection)];
    const prevMap = new Map(ids.map((id) => {
      const p = pendingPublishRef.current.get(id);
      return [id, p?.prevVal ?? rowsRef.current.find((r) => r.id === id)?.isPublished ?? false];
    }));

    ids.forEach((id) => {
      const p = pendingPublishRef.current.get(id);
      if (p) { clearTimeout(p.timer); toast.dismiss(p.toastId); }
      pendingPublishRef.current.delete(id);
    });

    setRows((p) => p.map((r) => ids.includes(r.id) ? { ...r, isPublished: val } : r));
    setRowSelection({});

    const entry = { timer: 0 as unknown as ReturnType<typeof setTimeout>, toastId: 0 as string | number };
    entry.toastId = toast(`${ids.length} → ${val ? t.common.published : t.common.pending}`, {
      action: {
        label: t.common.cancel,
        onClick: () => {
          clearTimeout(entry.timer);
          ids.forEach((id) => pendingPublishRef.current.delete(id));
          setRows((p) => p.map((r) => ids.includes(r.id) ? { ...r, isPublished: prevMap.get(r.id) ?? r.isPublished } : r));
        },
      },
      duration: 4500,
    });
    entry.timer = setTimeout(() => {
      ids.forEach((id) => setReviewPublished(id, val));
      ids.forEach((id) => pendingPublishRef.current.delete(id));
    }, 4500);
    ids.forEach((id) => pendingPublishRef.current.set(id, { prevVal: prevMap.get(id)!, timer: entry.timer, toastId: entry.toastId }));
  };

  /* ── Deferred delete with undo ─────────────────────────────────────────── */
  type PendingDelete = { rows: ReviewRow[]; timer: ReturnType<typeof setTimeout>; toastId: string | number };
  const pendingDeleteRef = useRef<PendingDelete | null>(null);

  const doDelete = (idsToDelete: string[]) => {
    const deletedRows = rowsRef.current.filter((r) => idsToDelete.includes(r.id));
    if (pendingDeleteRef.current) { clearTimeout(pendingDeleteRef.current.timer); toast.dismiss(pendingDeleteRef.current.toastId); }

    setRows((p) => p.filter((r) => !idsToDelete.includes(r.id)));
    setRowSelection({});

    const entry: PendingDelete = { rows: deletedRows, timer: 0 as unknown as ReturnType<typeof setTimeout>, toastId: 0 };
    entry.toastId = toast(
      idsToDelete.length === 1 ? `"${deletedRows[0]?.reviewerName ?? t.reviewsPage.title}" deleted` : `${idsToDelete.length} deleted`,
      {
        action: {
          label: t.common.cancel,
          onClick: () => {
            clearTimeout(entry.timer);
            pendingDeleteRef.current = null;
            setRows((p) => {
              const existing = new Set(p.map((r) => r.id));
              return [...deletedRows.filter((r) => !existing.has(r.id)), ...p]
                .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
            });
          },
        },
        duration: 5000,
      }
    );
    entry.timer = setTimeout(() => {
      idsToDelete.forEach((id) => deleteReview(id));
      pendingDeleteRef.current = null;
    }, 5000);
    pendingDeleteRef.current = entry;
  };

  const handleDeleteOne = (id: string) => { setSingleDeleteId(id); setDeleteDialogOpen(true); };
  const handleDeleteSelected = () => { setSingleDeleteId(null); setDeleteDialogOpen(true); };
  const confirmDelete = () => {
    setDeleteDialogOpen(false);
    const ids = singleDeleteId ? [singleDeleteId] : Object.keys(rowSelection);
    setSingleDeleteId(null);
    doDelete(ids);
  };

  /* ── Filter & search ───────────────────────────────────────────────────── */
  const filteredRows = useMemo(() => {
    let pool = filter === "pending" ? rows.filter((r) => !r.isPublished)
      : filter === "published" ? rows.filter((r) => r.isPublished)
      : rows;
    const q = globalFilter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((r) =>
      r.reviewerName.toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q) ||
      r.reviewText.toLowerCase().includes(q) ||
      (r.procedureTag ?? "").toLowerCase().includes(q)
    );
  }, [rows, filter, globalFilter]);

  /* ── TanStack columns ──────────────────────────────────────────────────── */
  const columns: ColumnDef<ReviewRow>[] = [
    {
      id: "select",
      enableSorting: false, enableHiding: false,
      header: ({ table }) => (
        <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Вибрати всі" className="translate-y-px" />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Вибрати" className="translate-y-px" />
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "isPublished",
      enableHiding: false,
      sortingFn: (a, b) => (a.original.isPublished === b.original.isPublished ? 0 : a.original.isPublished ? 1 : -1),
      header: ({ column }) => (
        <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
          {t.common.status}
          {column.getIsSorted() === "asc" ? <ArrowUp size={11} className="text-primary" />
            : column.getIsSorted() === "desc" ? <ArrowDown size={11} className="text-primary" />
            : <ArrowUpDown size={11} className="opacity-40" />}
        </button>
      ),
      cell: ({ row }) => (
        <PublishBadge id={row.original.id} isPublished={row.original.isPublished} onChanged={handlePublishChange} />
      ),
    },
    {
      accessorKey: "doctorName",
      header: () => t.reviewsTable.doctor,
      cell: ({ row }) => <span className="font-medium text-foreground text-[13px] truncate block max-w-[160px]" title={row.original.doctorName}>{row.original.doctorName}</span>,
    },
    {
      accessorKey: "reviewerName",
      header: () => t.reviewsTable.patient,
      cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.reviewerName}</span>,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
          {t.reviewsTable.rating}
          {column.getIsSorted() === "asc" ? <ArrowUp size={11} className="text-primary" />
            : column.getIsSorted() === "desc" ? <ArrowDown size={11} className="text-primary" />
            : <ArrowUpDown size={11} className="opacity-40" />}
        </button>
      ),
      cell: ({ row }) => <Stars n={row.original.rating} />,
    },
    {
      accessorKey: "procedureTag",
      header: () => t.reviewsTable.procedure,
      cell: ({ row }) => <span className="text-[12px] text-muted-foreground truncate block max-w-[140px]">{row.original.procedureTag || "—"}</span>,
    },
    {
      accessorKey: "reviewText",
      header: () => t.reviewsTable.review,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-[12px] text-muted-foreground truncate block max-w-[220px]" title={row.original.reviewText}>
          {row.original.reviewText.slice(0, 70)}{row.original.reviewText.length > 70 ? "…" : ""}
        </span>
      ),
    },
    {
      id: "reviewedAt",
      accessorFn: (row) => new Date(row.reviewedAt).getTime(),
      header: ({ column }) => (
        <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer ml-auto">
          {t.common.date}
          {column.getIsSorted() === "asc" ? <ArrowUp size={11} className="text-primary" />
            : column.getIsSorted() === "desc" ? <ArrowDown size={11} className="text-primary" />
            : <ArrowUpDown size={11} className="opacity-40" />}
        </button>
      ),
      cell: ({ row }) => <span className="text-[12px] text-muted-foreground whitespace-nowrap tabular-nums">{formatDate(row.original.reviewedAt)}</span>,
    },
    {
      id: "actions", enableHiding: false,
      cell: ({ row }) => (
        <RowActions row={row.original} onEdit={setEditingRow} onPublishChange={handlePublishChange} onDeleteOne={handleDeleteOne} />
      ),
    },
  ];

  const table = useReactTable({
    data: filteredRows, columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedIds = Object.keys(rowSelection);
  const pendingCount = rows.filter((r) => !r.isPublished).length;
  const deleteCount = singleDeleteId ? 1 : selectedIds.length;

  return (
    <>
      {/* Tabs + Add button */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-0.5 bg-muted rounded-xl p-1">
          {(["all", "pending", "published"] as TabFilter[]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {f === "all" ? t.reviewsPage.tabAll(rows.length) : f === "pending" ? t.reviewsPage.tabPending(pendingCount) : t.reviewsPage.tabPublished(rows.length - pendingCount)}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <NativeButton variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} />
            {t.reviewsPage.addNew}
          </NativeButton>
        </div>
      </div>

      <Card className="w-full overflow-hidden border border-border rounded-md shadow-sm p-0 gap-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/20">
          {/* Left: morphs between search and batch */}
          <div className="relative h-8 flex items-center" style={{ minWidth: 280 }}>
            <div className={cn("absolute inset-0 flex items-center transition-[opacity,transform,filter] duration-150 ease-out",
              selectedIds.length > 0 ? "opacity-0 blur-[2px] pointer-events-none -translate-x-1 scale-[0.97]" : "opacity-100 blur-0 translate-x-0 scale-100")}>
              <div className="relative w-full group/search">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within/search:text-foreground" />
                <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder={t.reviewsTable.searchPlaceholder}
                  className="pl-9 pr-8 h-8 bg-background text-sm placeholder:text-muted-foreground hover:border-ring/50 focus:border-ring transition-colors" />
                {globalFilter && (
                  <button type="button" onClick={() => setGlobalFilter("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs leading-none">✕</button>
                )}
              </div>
            </div>
            <div className={cn("absolute inset-0 flex items-center gap-2 transition-[opacity,transform,filter] duration-150 ease-out",
              selectedIds.length > 0 ? "opacity-100 blur-0 translate-x-0 scale-100" : "opacity-0 blur-[2px] pointer-events-none translate-x-1 scale-[0.97]")}>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{selectedIds.length} {t.common.selected}</span>
              <button type="button" onClick={() => markSelectedPublish(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                {t.reviewsTable.publish}
              </button>
              <button type="button" onClick={() => markSelectedPublish(false)}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {t.reviewsTable.unpublish}
              </button>
              <span className="w-px h-4 bg-border shrink-0" />
              <button type="button" onClick={handleDeleteSelected}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title={`${t.reviewsTable.delete} ${selectedIds.length}`}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">{filteredRows.length} / {rows.length}</span>
          </div>
        </div>

        {/* Table */}
        {table.getRowModel().rows.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            {globalFilter ? t.reviewsTable.noResults : filter === "pending" ? t.reviewsTable.noPending : t.reviewsTable.noData}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} className="text-xs font-medium text-muted-foreground h-9"
                        style={header.id === "select" ? { width: 40 } : header.id === "actions" ? { width: 48 } : undefined}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}
                    onClick={() => setEditingRow(row.original)}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn("cursor-pointer transition-colors group", row.getIsSelected() && "bg-primary/5")}>
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
        {table.getRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10 text-xs text-muted-foreground">
            <span>{selectedIds.length > 0 ? `${selectedIds.length} ${t.common.of} ${filteredRows.length} ${t.common.selected}` : `${filteredRows.length} ${t.reviewsPage.title.toLowerCase()}`}</span>
            <span className="text-muted-foreground/60">{rows.filter((r) => !r.isPublished).length} {t.common.pending.toLowerCase()} · {rows.filter((r) => r.isPublished).length} {t.common.published.toLowerCase()}</span>
          </div>
        )}

        {/* Delete dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.reviewsTable.confirmDelete}</AlertDialogTitle>
              <AlertDialogDescription>{t.reviewsTable.confirmDeleteDesc}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <NativeButton variant="neutral" size="sm" onClick={() => setDeleteDialogOpen(false)}>{t.common.cancel}</NativeButton>
              <NativeButton variant="destructive" size="sm" onClick={confirmDelete}>
                <Trash2 size={14} /> {t.reviewsTable.delete}
              </NativeButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>

      {editingRow && (
        <EditModal row={editingRow} onClose={() => setEditingRow(null)}
          onSaved={(updated) => { setRows((p) => p.map((r) => r.id === updated.id ? updated : r)); setEditingRow(null); }} />
      )}
      {showAdd && (
        <AddModal doctors={doctors} today={today} onClose={() => setShowAdd(false)}
          onCreated={(row) => { setRows((p) => [row, ...p]); setShowAdd(false); }} />
      )}
    </>
  );
}
