"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Search, Trash2, Eye, EyeOff, Pencil, Plus, X, Loader2 } from "lucide-react";
import {
  setReviewPublished, deleteReview, saveReviewEdit, createReview,
  type ReviewRow, type DoctorOption,
} from "../../_actions/reviews";

/* ─── helpers ──────────────────────────────────────────────────────────── */
type Filter = "all" | "pending" | "published";

function Stars({ n, onChange }: { n: number; onChange?: (v: number) => void }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={onChange ? "button" : undefined}
          onClick={onChange ? () => onChange(i) : undefined}
          className={onChange ? "cursor-pointer focus:outline-none" : "cursor-default"}
          tabIndex={onChange ? 0 : -1}
          aria-label={onChange ? `${i} star` : undefined}
        >
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

function LangField({ label, name, value, onChange, multiline = false }: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; multiline?: boolean;
}) {
  const base = "w-full rounded-lg border border-line bg-champagne-dark px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-main/40 resize-none";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</label>
      {multiline
        ? <textarea name={name} rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={base} />
        : <input type="text" name={name} value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      }
    </div>
  );
}

/* ─── Review form (shared by Edit + Add modals) ─────────────────────────── */
interface FormState {
  reviewerName: string;
  rating: number;
  reviewedAt: string;
  procedureTag: string; procedureTagRu: string; procedureTagEn: string;
  reviewText: string; reviewTextRu: string; reviewTextEn: string;
  isPublished: boolean;
}

function emptyForm(today: string): FormState {
  return {
    reviewerName: "", rating: 5, reviewedAt: today,
    procedureTag: "", procedureTagRu: "", procedureTagEn: "",
    reviewText: "", reviewTextRu: "", reviewTextEn: "",
    isPublished: true,
  };
}

function rowToForm(r: ReviewRow): FormState {
  return {
    reviewerName: r.reviewerName,
    rating: r.rating,
    reviewedAt: r.reviewedAt.slice(0, 10),
    procedureTag: r.procedureTag ?? "",
    procedureTagRu: r.procedureTagRu ?? "",
    procedureTagEn: r.procedureTagEn ?? "",
    reviewText: r.reviewText,
    reviewTextRu: r.reviewTextRu ?? "",
    reviewTextEn: r.reviewTextEn ?? "",
    isPublished: r.isPublished,
  };
}

function ReviewFormFields({ form, set, showPublish = true }: {
  form: FormState;
  set: (k: keyof FormState, v: string | number | boolean) => void;
  showPublish?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Name + Rating + Date row */}
      <div className="grid grid-cols-2 gap-4">
        <LangField label="Reviewer name" name="reviewer_name" value={form.reviewerName} onChange={(v) => set("reviewerName", v)} />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Date</label>
          <input type="date" value={form.reviewedAt} onChange={(e) => set("reviewedAt", e.target.value)}
            className="w-full rounded-lg border border-line bg-champagne-dark px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-main/40" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Rating</label>
        <Stars n={form.rating} onChange={(v) => set("rating", v)} />
      </div>

      {/* Procedure tags */}
      <div className="rounded-xl bg-champagne-dark/60 p-3 flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Procedure tag</p>
        <div className="grid grid-cols-3 gap-3">
          <LangField label="🇺🇦 UK" name="procedure_tag" value={form.procedureTag} onChange={(v) => set("procedureTag", v)} />
          <LangField label="🇷🇺 RU" name="procedure_tag_ru" value={form.procedureTagRu} onChange={(v) => set("procedureTagRu", v)} />
          <LangField label="🇬🇧 EN" name="procedure_tag_en" value={form.procedureTagEn} onChange={(v) => set("procedureTagEn", v)} />
        </div>
      </div>

      {/* Review texts */}
      <div className="rounded-xl bg-champagne-dark/60 p-3 flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Review text</p>
        <LangField label="🇺🇦 Ukrainian" name="review_text" value={form.reviewText} onChange={(v) => set("reviewText", v)} multiline />
        <LangField label="🇷🇺 Russian" name="review_text_ru" value={form.reviewTextRu} onChange={(v) => set("reviewTextRu", v)} multiline />
        <LangField label="🇬🇧 English" name="review_text_en" value={form.reviewTextEn} onChange={(v) => set("reviewTextEn", v)} multiline />
      </div>

      {showPublish && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)}
            className="w-4 h-4 rounded accent-main" />
          <span className="text-sm text-ink">Published</span>
        </label>
      )}
    </div>
  );
}

/* ─── Edit modal ─────────────────────────────────────────────────────────── */
function EditModal({ row, onClose, onSaved }: { row: ReviewRow; onClose: () => void; onSaved: (updated: ReviewRow) => void }) {
  const [form, setFormState] = useState<FormState>(() => rowToForm(row));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: keyof FormState, v: string | number | boolean) {
    setFormState((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.reviewText.trim()) { setError("Review text (UK) is required"); return; }
    setBusy(true); setError(null);
    const res = await saveReviewEdit({ id: row.id, ...form });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Error saving"); return; }
    onSaved({ ...row, ...form, procedureTag: form.procedureTag || null, procedureTagRu: form.procedureTagRu || null, procedureTagEn: form.procedureTagEn || null, reviewTextRu: form.reviewTextRu || null, reviewTextEn: form.reviewTextEn || null });
    onClose();
  }

  return (
    <Backdrop onClose={onClose}>
      <ModalPanel title={`Edit review — ${row.doctorName}`} onClose={onClose} busy={busy} error={error} onSave={handleSave} saveLabel="Save changes">
        <ReviewFormFields form={form} set={set} />
      </ModalPanel>
    </Backdrop>
  );
}

/* ─── Add modal ──────────────────────────────────────────────────────────── */
function AddModal({ doctors, today, onClose, onCreated }: {
  doctors: DoctorOption[]; today: string;
  onClose: () => void; onCreated: (row: ReviewRow) => void;
}) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [form, setFormState] = useState<FormState>(() => emptyForm(today));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: keyof FormState, v: string | number | boolean) {
    setFormState((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!doctorId) { setError("Select a doctor"); return; }
    if (!form.reviewerName.trim()) { setError("Reviewer name is required"); return; }
    if (!form.reviewText.trim()) { setError("Review text (UK) is required"); return; }
    setBusy(true); setError(null);
    const res = await createReview({ doctorId, ...form });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Error saving"); return; }
    const doctor = doctors.find((d) => d.id === doctorId)!;
    const fakeRow: ReviewRow = {
      id: Math.random().toString(), doctorId, doctorName: doctor.name, doctorSlug: doctor.slug,
      ...form,
      procedureTag: form.procedureTag || null, procedureTagRu: form.procedureTagRu || null, procedureTagEn: form.procedureTagEn || null,
      reviewTextRu: form.reviewTextRu || null, reviewTextEn: form.reviewTextEn || null,
      reviewedAt: form.reviewedAt, submittedAt: new Date().toISOString(), sortOrder: 0, reviewLocale: "uk",
    };
    onCreated(fakeRow);
    onClose();
  }

  return (
    <Backdrop onClose={onClose}>
      <ModalPanel title="Add review" onClose={onClose} busy={busy} error={error} onSave={handleSave} saveLabel="Create review">
        <div className="flex flex-col gap-1 mb-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
            className="w-full rounded-lg border border-line bg-champagne-dark px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-main/40">
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <ReviewFormFields form={form} set={set} />
      </ModalPanel>
    </Backdrop>
  );
}

/* ─── Modal primitives ───────────────────────────────────────────────────── */
function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      {children}
    </div>
  );
}

function ModalPanel({ title, onClose, busy, error, onSave, saveLabel, children }: {
  title: string; onClose: () => void; busy: boolean; error: string | null;
  onSave: () => void; saveLabel: string; children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <h2 className="font-heading text-base text-ink">{title}</h2>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-champagne-dark transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {children}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-muted hover:text-ink transition-colors">
          Cancel
        </button>
        <button type="button" onClick={onSave} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-main text-white text-sm font-medium hover:bg-main/90 disabled:opacity-60 transition-colors">
          {busy && <Loader2 size={14} className="animate-spin" />}
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

/* ─── Main table ─────────────────────────────────────────────────────────── */
interface Props {
  rows: ReviewRow[];
  doctors: DoctorOption[];
}

export default function ReviewsTable({ rows: initial, doctors }: Props) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editingRow, setEditingRow] = useState<ReviewRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { setRows(initial); }, [initial]);

  const pendingCount = rows.filter((r) => !r.isPublished).length;

  const displayed = useMemo(() => {
    let pool = filter === "pending" ? rows.filter((r) => !r.isPublished)
      : filter === "published" ? rows.filter((r) => r.isPublished)
      : rows;
    const q = query.trim().toLowerCase();
    if (q) pool = pool.filter((r) =>
      r.reviewerName.toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q) ||
      r.reviewText.toLowerCase().includes(q) ||
      (r.procedureTag ?? "").toLowerCase().includes(q)
    );
    return pool;
  }, [rows, filter, query]);

  const togglePublish = (id: string, current: boolean) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, isPublished: !current } : r));
    startTransition(() => setReviewPublished(id, !current));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Видалити відгук?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    startTransition(() => deleteReview(id));
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Toolbar: filters + search + add button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1 bg-champagne-dark rounded-xl p-1">
            {(["all", "pending", "published"] as Filter[]).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === f ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                {f === "all" ? `Всі (${rows.length})` : f === "pending" ? `Очікують (${pendingCount})` : `Опубліковані (${rows.length - pendingCount})`}
              </button>
            ))}
          </div>

          <div className="flex-1 flex items-center gap-2 bg-champagne-dark rounded-xl px-3 py-2">
            <Search size={14} className="text-muted shrink-0" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук за ім'ям, лікарем або текстом…"
              className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-muted" />
          </div>

          <button type="button" onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-main text-white text-sm font-medium hover:bg-main/90 transition-colors shrink-0">
            <Plus size={15} />
            Add review
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          {displayed.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted">
              {query ? "Нічого не знайдено." : filter === "pending" ? "Немає відгуків на розгляді." : "Немає відгуків."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 100 }} />
                  <col style={{ width: 155 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 75 }} />
                  <col style={{ width: 140 }} />
                  <col />
                  <col style={{ width: 95 }} />
                  <col style={{ width: 90 }} />
                </colgroup>
                <thead>
                  <tr className="bg-champagne-dark/60 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3 text-left">Статус</th>
                    <th className="px-4 py-3 text-left">Лікар</th>
                    <th className="px-4 py-3 text-left">Пацієнт</th>
                    <th className="px-4 py-3 text-left">Оцінка</th>
                    <th className="px-4 py-3 text-left">Процедура</th>
                    <th className="px-4 py-3 text-left">Відгук</th>
                    <th className="px-4 py-3 text-left">Дата</th>
                    <th className="px-4 py-3 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {displayed.map((r) => (
                    <tr key={r.id} className="hover:bg-champagne-dark/30 transition-colors group">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${r.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {r.isPublished ? "Опубл." : "Очікує"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink text-[13px] truncate" title={r.doctorName}>{r.doctorName}</td>
                      <td className="px-4 py-3 text-ink text-[13px] truncate">{r.reviewerName}</td>
                      <td className="px-4 py-3"><Stars n={r.rating} /></td>
                      <td className="px-4 py-3 text-muted text-[12px] truncate" title={r.procedureTag ?? ""}>{r.procedureTag || "—"}</td>
                      <td className="px-4 py-3 text-black-60 text-[13px] truncate" title={r.reviewText}>
                        {r.reviewText.slice(0, 80)}{r.reviewText.length > 80 ? "…" : ""}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted whitespace-nowrap">{formatDate(r.reviewedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setEditingRow(r)} title="Edit"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-main hover:bg-champagne-dark transition-colors cursor-pointer">
                            <Pencil size={13} />
                          </button>
                          <button type="button" onClick={() => togglePublish(r.id, r.isPublished)} disabled={isPending}
                            title={r.isPublished ? "Приховати" : "Опублікувати"}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${r.isPublished ? "text-muted hover:text-amber-600 hover:bg-amber-50" : "text-muted hover:text-emerald-600 hover:bg-emerald-50"}`}>
                            {r.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button type="button" onClick={() => handleDelete(r.id)} disabled={isPending} title="Видалити"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editingRow && (
        <EditModal
          row={editingRow}
          onClose={() => setEditingRow(null)}
          onSaved={(updated) => {
            setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r));
            setEditingRow(null);
          }}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <AddModal
          doctors={doctors}
          today={today}
          onClose={() => setShowAdd(false)}
          onCreated={(row) => {
            setRows((prev) => [row, ...prev]);
            setShowAdd(false);
          }}
        />
      )}
    </>
  );
}
