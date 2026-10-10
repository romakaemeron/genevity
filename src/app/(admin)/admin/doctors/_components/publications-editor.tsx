"use client";

/**
 * ТЗ #15 §1 — editor for the doctor's "Наукова діяльність" list.
 *
 * Kept as a React-controlled list that mirrors itself into a hidden
 * `publications_json` input, so it submits with the main doctor form (same
 * trick as the education / certifications JSON fields) without a second
 * server action. The `kind` taxonomy is a dropdown rather than free text —
 * the public site renders its own localized chip, so the editor only picks a
 * category once instead of translating it three times.
 */

import { useState } from "react";
import { Plus, Trash2, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { MiniTabs } from "../../_components/locale-inputs";
import type { LocaleKey } from "../../_components/translation-tabs";

export type PublicationKind = "article" | "coauthor" | "journal" | "research" | "method" | "profile";

export interface PublicationRow {
  kind: PublicationKind;
  title_uk: string; title_ru: string; title_en: string;
  source_uk: string; source_ru: string; source_en: string;
  year: string;
  url: string;
}

const KIND_OPTIONS: { value: PublicationKind; label: string }[] = [
  { value: "article",  label: "Наукова стаття" },
  { value: "coauthor", label: "Співавторство" },
  { value: "journal",  label: "Публікація в журналі" },
  { value: "research", label: "Наукове дослідження" },
  { value: "method",   label: "Авторська методика" },
  { value: "profile",  label: "Науковий профіль (Scopus / ORCID / PubMed)" },
];

const emptyRow = (): PublicationRow => ({
  kind: "article",
  title_uk: "", title_ru: "", title_en: "",
  source_uk: "", source_ru: "", source_en: "",
  year: "",
  url: "",
});

/** Tolerates rows written by a seed script (missing optional keys, numeric year). */
function normalize(raw: unknown): PublicationRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const e = (item ?? {}) as Record<string, unknown>;
    const str = (k: string) => (typeof e[k] === "string" ? (e[k] as string) : "");
    const kind = KIND_OPTIONS.some((o) => o.value === e.kind)
      ? (e.kind as PublicationKind)
      : "article";
    return {
      kind,
      title_uk: str("title_uk"), title_ru: str("title_ru"), title_en: str("title_en"),
      source_uk: str("source_uk"), source_ru: str("source_ru"), source_en: str("source_en"),
      year: e.year === null || e.year === undefined ? "" : String(e.year),
      url: str("url"),
    };
  });
}

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all placeholder:text-stone-light";

export default function PublicationsEditor({
  initial,
  onDirtyChange,
}: {
  initial: unknown;
  /** Lets the parent form's unsaved-changes guard notice edits here. */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [rows, setRows] = useState<PublicationRow[]>(() => normalize(initial));
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [baseline] = useState(() => JSON.stringify(normalize(initial)));

  const commit = (next: PublicationRow[]) => {
    setRows(next);
    onDirtyChange?.(JSON.stringify(next) !== baseline);
  };

  const update = (i: number, patch: Partial<PublicationRow>) =>
    commit(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => {
    if (!confirm("Remove this publication?")) return;
    commit(rows.filter((_, idx) => idx !== i));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  // Entries with no Ukrainian title are dropped on save — the public query
  // skips them anyway, so persisting them would only grow the JSONB blob.
  const payload = rows.filter((r) => r.title_uk.trim() || r.title_ru.trim() || r.title_en.trim());

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="publications_json" value={JSON.stringify(payload)} />

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Language</span>
        <MiniTabs active={locale} onChange={setLocale} />
        <span className="ml-auto text-xs text-muted">{rows.length} entries</span>
      </div>

      {rows.map((row, i) => (
        <div key={i} className="rounded-xl border border-line bg-champagne-dark p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted shrink-0">#{i + 1}</span>
            <select
              value={row.kind}
              onChange={(e) => update(i, { kind: e.target.value as PublicationKind })}
              className={`${inputClass} max-w-xs`}
            >
              {KIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="p-1.5 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-default cursor-pointer" title="Move up">
                <ChevronUp size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1}
                className="p-1.5 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-default cursor-pointer" title="Move down">
                <ChevronDown size={14} />
              </button>
              <button type="button" onClick={() => remove(i)}
                className="p-1.5 text-muted hover:text-error cursor-pointer" title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Title ({locale})
            </label>
            <textarea
              rows={2}
              value={row[`title_${locale}` as const]}
              onChange={(e) => update(i, { [`title_${locale}`]: e.target.value } as Partial<PublicationRow>)}
              placeholder="Назва статті / дослідження / методики"
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                Source ({locale}) — journal, conference or database
              </label>
              <input
                value={row[`source_${locale}` as const]}
                onChange={(e) => update(i, { [`source_${locale}`]: e.target.value } as Partial<PublicationRow>)}
                placeholder="Український журнал дерматології, косметології"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Year</label>
              <input
                value={row.year}
                onChange={(e) => update(i, { year: e.target.value })}
                placeholder="2024"
                inputMode="numeric"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Primary-source URL (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                value={row.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="https://pubmed.ncbi.nlm.nih.gov/…"
                className={inputClass}
              />
              {/^https?:\/\//i.test(row.url.trim()) && (
                <a href={row.url.trim()} target="_blank" rel="nofollow noopener noreferrer"
                  className="p-2 text-muted hover:text-main transition-colors" title="Open link">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            <p className="text-[11px] text-muted">
              Rendered as a <code className="font-mono">rel=&quot;nofollow&quot;</code> link. Only
              http/https links are shown — anything else is ignored on the public page.
            </p>
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No publications yet. The block is hidden on the public profile until you add one.
        </div>
      )}

      <button
        type="button"
        onClick={() => commit([...rows, emptyRow()])}
        className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer"
      >
        <Plus size={14} /> Add publication
      </button>
    </div>
  );
}
