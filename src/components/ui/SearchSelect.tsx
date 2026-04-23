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
import { createPortal } from "react-dom";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Viewport-space anchor for the portaled dropdown. `flip` is true when the
  // trigger sits too close to the bottom of the window — we render the
  // dropdown above instead so it doesn't clip off-screen.
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number; flip: boolean } | null>(null);

  const selected = options.find((o) => o.value === value);

  // Defensive dedup by value — downstream lists use `key={o.value}`, so
  // duplicate values crash React. The server action should already return
  // unique values; this is insurance against stale bundles or future
  // callers that forget.
  const deduped = useMemo(() => {
    const seen = new Set<string>();
    return options.filter((o) => {
      if (seen.has(o.value)) return false;
      seen.add(o.value);
      return true;
    });
  }, [options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deduped;
    return deduped.filter((o) => {
      return (
        o.label.toLowerCase().includes(q) ||
        (o.sub?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [deduped, query]);

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

  // Close on outside click — the dropdown portals to <body>, so accept
  // clicks inside either the root (trigger area) or the portaled panel.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Position the dropdown in viewport coordinates whenever the trigger
  // moves — on open, on resize, on scroll (inside overflow ancestors or
  // the window). Opens upward instead of down when the trigger is too
  // close to the bottom edge (common inside centered modals).
  useEffect(() => {
    if (!open) { setAnchor(null); return; }
    const DROPDOWN_EST_HEIGHT = 320; // matches max-h-64 + search + padding
    const GAP = 6;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const flip = spaceBelow < DROPDOWN_EST_HEIGHT && r.top > spaceBelow;
      const top = flip
        ? Math.max(8, r.top - GAP - DROPDOWN_EST_HEIGHT)
        : r.bottom + GAP;
      setAnchor({ top, left: r.left, width: r.width, flip });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
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
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        disabled={disabled}
        className={`group w-full flex items-center gap-2 px-4 py-3 rounded-[var(--radius-button)] bg-champagne-dark border border-line text-left text-ink text-[15px] outline-none transition-colors duration-150 ease-out ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-stone-light focus-visible:border-main focus-visible:ring-2 focus-visible:ring-main/15"
        } ${open ? "border-main ring-2 ring-main/15" : ""}`}
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

      {open && anchor && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: anchor.top,
              left: anchor.left,
              width: anchor.width,
              // z-index via inline style — Tailwind's arbitrary z-index value
              // can lose to the modal's compiled styles under Turbopack, so
              // we force a number that sits above any real overlay.
              zIndex: 9999,
            }}
            className="rounded-[var(--radius-card)] bg-white border border-line shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line">
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
          </div>,
          document.body,
        )}
    </div>
  );
}
