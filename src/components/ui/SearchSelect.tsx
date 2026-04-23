"use client";

/**
 * Accessible searchable combobox with optional option grouping. Used by
 * the booking form to pick between services and doctors, but generic
 * enough to reuse elsewhere.
 *
 * Keyboard: ↑/↓ move the highlight, Enter picks, Esc closes, typing
 * filters in place. Mouse/touch works as expected. Dropdown portals
 * itself below the anchor and uses a small scroll container so long
 * service lists don't push layout around.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface SearchOption {
  value: string;
  label: string;
  sub?: string;
  /** Group key — options sharing a group render together under the group's heading. */
  group?: string;
}

interface Props {
  options: SearchOption[];
  /** Ordered list of group keys + their localized headings. Options whose
   *  `group` isn't in here fall into an "other" bucket at the bottom. */
  groupHeadings?: { key: string; label: string }[];
  value: string;
  onChange: (next: string, picked?: SearchOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  clearLabel?: string;
  /** `id` of a <label> — wires aria-labelledby for a11y. */
  labelId?: string;
  disabled?: boolean;
}

export default function SearchSelect({
  options,
  groupHeadings,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyLabel = "No matches",
  clearLabel = "Clear",
  labelId,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      return (
        o.label.toLowerCase().includes(q) ||
        (o.sub?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [options, query]);

  const grouped = useMemo(() => {
    // Preserve group ordering from props; options without a recognised
    // group land in an "other" bucket appended at the end.
    const map = new Map<string, SearchOption[]>();
    const orderedKeys: string[] = [];
    const known = new Set((groupHeadings || []).map((g) => g.key));
    for (const gh of groupHeadings || []) {
      map.set(gh.key, []);
      orderedKeys.push(gh.key);
    }
    for (const o of filtered) {
      const g = o.group && known.has(o.group) ? o.group : "_other";
      if (!map.has(g)) { map.set(g, []); orderedKeys.push(g); }
      map.get(g)!.push(o);
    }
    return orderedKeys
      .map((k) => ({
        key: k,
        heading: (groupHeadings || []).find((g) => g.key === k)?.label ?? "",
        options: map.get(k) || [],
      }))
      .filter((g) => g.options.length > 0);
  }, [filtered, groupHeadings]);

  // Flattened list is the navigation source of truth — the keyboard cursor
  // indexes into it directly so Up/Down cross group headings seamlessly.
  const flat = useMemo(() => grouped.flatMap((g) => g.options), [grouped]);

  // Keep the cursor in range when the filter narrows the list.
  useEffect(() => {
    if (cursor >= flat.length) setCursor(Math.max(0, flat.length - 1));
  }, [flat.length, cursor]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Focus the search input as soon as the dropdown opens.
  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  const pick = useCallback((o: SearchOption) => {
    onChange(o.value, o);
    setOpen(false);
    setQuery("");
  }, [onChange]);

  const clear = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange("", undefined);
  }, [onChange]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const o = flat[cursor];
      if (o) pick(o);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        disabled={disabled}
        className={`group w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-champagne border border-stone-lighter text-left text-ink text-[15px] outline-none transition-colors ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-main focus-visible:border-main focus-visible:ring-2 focus-visible:ring-main/20"
        } ${open ? "border-main ring-2 ring-main/20" : ""}`}
      >
        <span className={`flex-1 min-w-0 truncate ${selected ? "text-ink" : "text-stone"}`}>
          {selected ? selected.label : placeholder}
          {selected?.sub && (
            <span className="text-stone text-[13px] ml-2">· {selected.sub}</span>
          )}
        </span>
        {selected && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={clear}
            onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); clear(); } }}
            className="text-stone hover:text-ink transition-colors p-0.5 -mr-1 cursor-pointer"
            title={clearLabel}
          >
            <X size={14} />
          </span>
        )}
        <ChevronDown
          size={16}
          className={`text-stone transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute z-30 left-0 right-0 top-full mt-1.5 rounded-xl bg-white border border-stone-lighter shadow-lg overflow-hidden"
          role="listbox"
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-lighter">
            <Search size={14} className="text-stone shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-stone"
            />
          </div>

          <div ref={listRef} className="max-h-64 overflow-y-auto py-1">
            {grouped.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-stone">{emptyLabel}</p>
            )}
            {grouped.map((g) => (
              <div key={g.key}>
                {g.heading && (
                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone">
                    {g.heading}
                  </p>
                )}
                {g.options.map((o) => {
                  const flatIdx = flat.indexOf(o);
                  const active = flatIdx === cursor;
                  const isSelected = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setCursor(flatIdx)}
                      onClick={() => pick(o)}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm cursor-pointer transition-colors ${
                        active ? "bg-champagne-dark" : "bg-transparent hover:bg-champagne-dark/50"
                      }`}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="text-ink block truncate">{o.label}</span>
                        {o.sub && <span className="text-[11px] text-stone block truncate">{o.sub}</span>}
                      </span>
                      {isSelected && <Check size={14} className="text-main shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
