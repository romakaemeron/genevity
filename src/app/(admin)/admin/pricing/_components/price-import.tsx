"use client";

import { useState, useTransition } from "react";
import { Upload, AlertTriangle, ShieldAlert } from "lucide-react";
import { previewPriceImport, commitPriceImport } from "../../_actions/price-import";
import type { DiffResult } from "@/lib/prices/diff";

export default function PriceImport() {
  const [file, setFile] = useState<File | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: "preview" | "commit") => {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      try {
        if (fn === "preview") {
          setDiff(await previewPriceImport(fd));
          setApplied(null);
        } else {
          const r = await commitPriceImport(fd);
          setApplied(`${r.items} items across ${r.categories} categories (${r.hidden} hidden)`);
          setDiff(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const notable = diff?.changes.filter((c) => c.kind !== "unchanged") ?? [];
  const conflicts = notable.filter((c) => c.isManualConflict);
  const hasWarnings = (diff?.warnings.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setDiff(null);
            setApplied(null);
            setError(null);
          }}
          className="text-sm"
        />
        <button
          type="button"
          onClick={() => run("preview")}
          disabled={!file || pending}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-line bg-champagne-dark hover:border-main/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={14} /> Preview changes
        </button>
      </div>

      <p className="body-s text-muted">
        Reads only the &ldquo;прайс GENEVITY (Гончара)&rdquo; sheet. Consultations are never
        touched. Rows missing from the file are hidden, not deleted.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {applied && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          Imported {applied}
        </p>
      )}

      {diff && (
        <div className="flex flex-col gap-3">
          {/* Warnings render ABOVE the diff and are visually the loudest thing on
              the page: a duplicate service id means the diff below is untrustworthy,
              because two rows can resolve to the same existing row. */}
          {hasWarnings && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-sm text-red-800 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert size={16} className="text-red-600" />
                {diff!.warnings.length} data problem(s) found — do not apply until resolved
              </div>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                {diff!.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(diff.counts).map(([kind, n]) => (
              <span key={kind} className="px-3 py-1.5 rounded-xl border border-line bg-champagne-dark">
                {kind}: <strong>{n}</strong>
              </span>
            ))}
          </div>

          {conflicts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              <AlertTriangle size={14} className="inline mr-1 text-amber-600" />
              {conflicts.length} row(s) were edited by hand in admin and will be
              overwritten by this import.
            </div>
          )}

          <div className="max-h-80 overflow-y-auto border border-line rounded-xl divide-y divide-line text-sm">
            {notable.length === 0 && (
              <div className="px-3 py-3 text-muted">No changes — nothing to apply.</div>
            )}
            {notable.map((c, i) => (
              <div key={i} className="px-3 py-1.5 flex justify-between gap-3">
                <span>
                  <span className="text-muted mr-2">{c.kind}</span>
                  {c.previousName ? `${c.previousName} → ${c.nameUk}` : c.nameUk}
                </span>
                <span className="shrink-0 tabular-nums">
                  {c.previousPrice ?? "—"} → {c.nextPrice ?? "—"}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => run("commit")}
            disabled={pending || notable.length === 0}
            className="self-start px-4 py-2.5 text-sm font-medium bg-main text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply {notable.length} changes
          </button>
        </div>
      )}
    </div>
  );
}
