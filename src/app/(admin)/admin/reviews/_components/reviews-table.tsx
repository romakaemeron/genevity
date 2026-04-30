"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Trash2, Eye, EyeOff } from "lucide-react";
import { setReviewPublished, deleteReview, listAllReviews } from "../../_actions/reviews";
import type { ReviewRow } from "../../_actions/reviews";
import { useEffect } from "react";

type Filter = "all" | "pending" | "published";

interface Props {
  rows: ReviewRow[];
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-main text-[13px]">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReviewsTable({ rows: initial }: Props) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Resync when server re-renders
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
      r.reviewText.toLowerCase().includes(q)
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
    <div className="flex flex-col gap-4">
      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-champagne-dark rounded-xl p-1">
          {(["all", "pending", "published"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === f ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {f === "all" ? `Всі (${rows.length})` : f === "pending" ? `Очікують (${pendingCount})` : `Опубліковані (${rows.length - pendingCount})`}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 bg-champagne-dark rounded-xl px-3 py-2">
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за ім'ям, лікарем або текстом…"
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-muted"
          />
        </div>
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
                <col style={{ width: 110 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 150 }} />
                <col />
                <col style={{ width: 100 }} />
                <col style={{ width: 80 }} />
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
                  <tr key={r.id} className="hover:bg-champagne-dark/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${
                        r.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {r.isPublished ? "Опубл." : "Очікує"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink text-[13px] truncate" title={r.doctorName}>
                      {r.doctorName}
                    </td>
                    <td className="px-4 py-3 text-ink text-[13px] truncate">{r.reviewerName}</td>
                    <td className="px-4 py-3"><Stars n={r.rating} /></td>
                    <td className="px-4 py-3 text-muted text-[12px] truncate" title={r.procedureTag ?? ""}>{r.procedureTag || "—"}</td>
                    <td className="px-4 py-3 text-black-60 text-[13px] truncate" title={r.reviewText}>
                      {r.reviewText.slice(0, 90)}{r.reviewText.length > 90 ? "…" : ""}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted whitespace-nowrap">{formatDate(r.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => togglePublish(r.id, r.isPublished)}
                          disabled={isPending}
                          title={r.isPublished ? "Приховати" : "Опублікувати"}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            r.isPublished
                              ? "text-muted hover:text-amber-600 hover:bg-amber-50"
                              : "text-muted hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {r.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          disabled={isPending}
                          title="Видалити"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
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
  );
}
