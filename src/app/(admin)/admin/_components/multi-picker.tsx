"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface PickerOption {
  id: string;
  label: string;
  sub?: string;
}

interface Props {
  label: string;
  options: PickerOption[];
  value: string[];
  onChange: (v: string[]) => void;
}

export function MultiPicker({ label, options, value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const selected = value.map((id) => options.find((o) => o.id === id)).filter(Boolean) as PickerOption[];
  const available = options.filter(
    (o) => !value.includes(o.id) && (query === "" || o.label.toLowerCase().includes(query.toLowerCase()) || o.sub?.toLowerCase().includes(query.toLowerCase())),
  );

  const remove = (id: string) => onChange(value.filter((v) => v !== id));
  const add = (id: string) => { onChange([...value, id]); setQuery(""); };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
        {label} {selected.length > 0 && <span className="font-normal">({selected.length})</span>}
      </label>

      {selected.length > 0 && (
        <div className="flex flex-col gap-1 mb-1">
          {selected.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-champagne/60 border border-line">
              <span className="text-xs text-muted w-5 shrink-0">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink truncate">{opt.label}</div>
                {opt.sub && <div className="text-[11px] text-muted truncate">{opt.sub}</div>}
              </div>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-muted hover:text-ink disabled:opacity-20 text-xs px-1 cursor-pointer">↑</button>
              <button type="button" disabled={i === selected.length - 1} onClick={() => move(i, 1)} className="text-muted hover:text-ink disabled:opacity-20 text-xs px-1 cursor-pointer">↓</button>
              <button type="button" onClick={() => remove(opt.id)} className="text-muted hover:text-error transition-colors cursor-pointer ml-1">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}…`}
        className="px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
      />
      {query && (
        <div className="rounded-lg border border-line bg-white shadow-sm max-h-52 overflow-y-auto">
          {available.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">No results</p>
          ) : available.slice(0, 20).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => add(opt.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-champagne-dark transition-colors cursor-pointer border-b border-line last:border-b-0"
            >
              <div className="text-ink">{opt.label}</div>
              {opt.sub && <div className="text-[11px] text-muted">{opt.sub}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
