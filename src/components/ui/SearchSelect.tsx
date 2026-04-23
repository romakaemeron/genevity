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
import Image from "next/image";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface SearchOption {
  value: string;
  label: string;
  sub?: string;
  /** Group key — options sharing a group render together under the group's heading. */
  group?: string;
  /** Optional thumbnail shown on the right side of a row (e.g. doctor photo). */
  rightImage?: string | null;
  /** CSS object-position applied to the rightImage. */
  rightImageFocalPoint?: string;
  /** Transform-scale applied to the rightImage — > 1 zooms in on the focal point. */
  rightImageScale?: number;
  /** Optional short text shown on the right side of a row (e.g. "from 4000 ₴"). */
  rightText?: string;
}

type Props =
  | ({ multiple?: false; value: string; onChange: (next: string, picked?: SearchOption) => void } & CommonProps)
  | ({ multiple: true; value: string[]; onChange: (next: string[], picked?: SearchOption, action?: "add" | "remove") => void } & CommonProps);

interface CommonProps {
  options: SearchOption[];
  /** Ordered list of group keys + their localized headings. Options whose
   *  `group` isn't in here fall into an "other" bucket at the bottom. */
  groupHeadings?: { key: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  clearLabel?: string;
  /** `id` of a <label> — wires aria-labelledby for a11y. */
  labelId?: string;
  disabled?: boolean;
}

export default function SearchSelect(props: Props) {
  const {
    options, groupHeadings, placeholder = "Select…", searchPlaceholder = "Search…",
    emptyLabel = "No matches", clearLabel = "Clear", labelId, disabled,
  } = props;
  const multiple = props.multiple === true;
  // Normalize value to an array internally so downstream logic is uniform.
  const selectedValues = useMemo<string[]>(
    () => (multiple ? (props.value as string[]) : props.value ? [props.value as string] : []),
    [multiple, props.value],
  );
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Viewport-space anchor for the portaled dropdown. `flip` is true when the
  // trigger sits too close to the bottom of the window — we render the
  // dropdown above instead so it doesn't clip off-screen. `maxHeight` is
  // the vertical budget we have in that direction so the list scrolls
  // internally rather than running off the edge of the screen.
  const [anchor, setAnchor] = useState<
    { top: number; left: number; width: number; flip: boolean; maxHeight: number } | null
  >(null);

  const selectedOptions = useMemo(
    () => selectedValues.map((v) => options.find((o) => o.value === v)).filter(Boolean) as SearchOption[],
    [selectedValues, options],
  );
  const selected = selectedOptions[0]; // convenience for single-select rendering

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

  // Count options per registered group — used both to pick a sensible
  // default active tab and to render the per-tab badge.
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of groupHeadings || []) counts[g.key] = 0;
    for (const o of deduped) {
      if (o.group && o.group in counts) counts[o.group] += 1;
    }
    return counts;
  }, [deduped, groupHeadings]);

  // Tab mode is on whenever the caller provides ≥ 2 group headings.
  const tabbed = (groupHeadings?.length || 0) >= 2;

  // Default active tab once options arrive — prefer the first group that
  // has any options so we don't open to an empty list.
  useEffect(() => {
    if (!tabbed || activeGroup) return;
    const first = (groupHeadings || []).find((g) => (groupCounts[g.key] || 0) > 0);
    if (first) setActiveGroup(first.key);
    else if (groupHeadings && groupHeadings.length) setActiveGroup(groupHeadings[0].key);
  }, [tabbed, activeGroup, groupHeadings, groupCounts]);

  // Reset cursor + scroll to top every time the active tab changes.
  useEffect(() => {
    setCursor(0);
    listRef.current?.scrollTo({ top: 0 });
  }, [activeGroup]);

  // Filter: restrict to the active tab (tabbed mode), then apply search.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = deduped;
    if (tabbed && activeGroup) pool = pool.filter((o) => o.group === activeGroup);
    if (!q) return pool;
    return pool.filter((o) => (
      o.label.toLowerCase().includes(q) ||
      (o.sub?.toLowerCase().includes(q) ?? false)
    ));
  }, [deduped, query, tabbed, activeGroup]);

  // In tab mode, no group headings — the tab already gives context. In
  // non-tab mode, we keep the original grouped rendering with headings.
  const grouped = useMemo(() => {
    if (tabbed) return [{ key: activeGroup || "_all", heading: "", options: filtered }];
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
  }, [filtered, groupHeadings, tabbed, activeGroup]);

  // Keyboard cursor indexes into the currently-visible list.
  const flat = useMemo(() => grouped.flatMap((g) => g.options), [grouped]);

  // Keep the cursor in range when the filter narrows the list.
  useEffect(() => {
    if (cursor >= flat.length) setCursor(Math.max(0, flat.length - 1));
  }, [flat.length, cursor]);

  // Close on outside click — the dropdown portals to <body>, so accept
  // clicks inside either the root (trigger area) or the portaled panel.
  //
  // We listen in the *capture* phase so we can swallow the event before
  // it bubbles up to the parent modal's backdrop click handler — otherwise
  // clicking outside the dropdown (but inside the modal panel or its
  // padding) would close BOTH the dropdown and the modal in one gesture.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("click", onDoc, true);
    return () => document.removeEventListener("click", onDoc, true);
  }, [open]);

  // Position the dropdown in viewport coordinates whenever the trigger
  // moves — on open, on resize, and on scroll (capture phase so overflow
  // ancestors also fire). Opens downward when there's space, flips up
  // when the bottom is constrained; either way the panel's max-height is
  // clamped to the remaining viewport so it never runs off-screen.
  useEffect(() => {
    if (!open) { setAnchor(null); return; }
    const GAP = 6;
    const EDGE_PAD = 12;
    const MIN_HEIGHT = 180;
    const PREFERRED_HEIGHT = 400;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom - GAP - EDGE_PAD;
      const spaceAbove = r.top - GAP - EDGE_PAD;
      // Open in whichever direction gives more room, unless there's
      // enough below to comfortably fit the preferred height.
      const openDown = spaceBelow >= PREFERRED_HEIGHT || spaceBelow >= spaceAbove;
      const available = Math.max(MIN_HEIGHT, openDown ? spaceBelow : spaceAbove);
      const maxHeight = Math.min(PREFERRED_HEIGHT, available);
      const top = openDown ? r.bottom + GAP : Math.max(EDGE_PAD, r.top - GAP - maxHeight);
      setAnchor({ top, left: r.left, width: r.width, flip: !openDown, maxHeight });
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

  // Toggle in multi-select mode (stay open, let the user accumulate picks);
  // in single-select mode, set the value and close as before. Split into
  // two branches inside the same callback so the caller contract matches
  // the discriminated `Props` union above.
  const pick = useCallback((o: SearchOption) => {
    if (multiple) {
      const set = new Set(selectedValues);
      let action: "add" | "remove";
      if (set.has(o.value)) { set.delete(o.value); action = "remove"; }
      else { set.add(o.value); action = "add"; }
      (props.onChange as (next: string[], picked?: SearchOption, action?: "add" | "remove") => void)(
        Array.from(set), o, action,
      );
      setQuery("");
      requestAnimationFrame(() => searchRef.current?.focus());
    } else {
      (props.onChange as (next: string, picked?: SearchOption) => void)(o.value, o);
      setOpen(false);
      setQuery("");
    }
  }, [multiple, props, selectedValues]);

  const clear = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (multiple) (props.onChange as (next: string[]) => void)([]);
    else (props.onChange as (next: string) => void)("");
  }, [multiple, props]);

  // Remove a single chip (multi-select only).
  const removeOne = useCallback((val: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!multiple) return;
    const next = selectedValues.filter((v) => v !== val);
    const picked = options.find((o) => o.value === val);
    (props.onChange as (next: string[], picked?: SearchOption, action?: "add" | "remove") => void)(
      next, picked, "remove",
    );
  }, [multiple, props, selectedValues, options]);

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
        {multiple ? (
          selectedOptions.length === 0 ? (
            <span className="flex-1 min-w-0 truncate text-stone">{placeholder}</span>
          ) : (
            <span className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
              {selectedOptions.map((o) => (
                <span
                  key={o.value}
                  className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-[var(--radius-pill)] bg-champagne-darker border border-line text-[12px] text-ink"
                >
                  <span className="truncate max-w-[180px]">{o.label}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(ev) => removeOne(o.value, ev)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); removeOne(o.value); }
                    }}
                    className="inline-flex w-4 h-4 items-center justify-center rounded-full text-stone hover:text-ink hover:bg-main/20 cursor-pointer"
                    title={clearLabel}
                  >
                    <X size={10} />
                  </span>
                </span>
              ))}
            </span>
          )
        ) : (
          <span className={`flex-1 min-w-0 truncate ${selected ? "text-ink" : "text-stone"}`}>
            {selected ? selected.label : placeholder}
            {selected?.sub && (
              <span className="text-stone text-[13px] ml-2">· {selected.sub}</span>
            )}
          </span>
        )}
        {selectedOptions.length > 0 && !disabled && (
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
              maxHeight: anchor.maxHeight,
              // z-index via inline style — Tailwind's arbitrary z-index value
              // can lose to the modal's compiled styles under Turbopack, so
              // we force a number that sits above any real overlay.
              zIndex: 9999,
            }}
            className="flex flex-col rounded-[var(--radius-card)] bg-champagne border border-line shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line shrink-0">
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

            {tabbed && groupHeadings && (
              <div className="flex items-center gap-1 px-2 py-2 border-b border-line shrink-0">
                {groupHeadings.map((g) => {
                  const isActive = activeGroup === g.key;
                  const n = groupCounts[g.key] || 0;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setActiveGroup(g.key)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-main text-champagne"
                          : "text-stone hover:text-ink hover:bg-champagne-dark"
                      }`}
                    >
                      {g.label}
                      <span
                        className={`text-[10px] tabular-nums ${
                          isActive ? "text-champagne/70" : "text-stone/70"
                        }`}
                      >
                        {n}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div ref={listRef} className="flex-1 overflow-y-auto py-1 min-h-0">
              {grouped.length === 0 || flat.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-stone">{emptyLabel}</p>
              ) : grouped.map((g) => (
                <div key={g.key}>
                  {g.heading && !tabbed && (
                    <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone">
                      {g.heading}
                    </p>
                  )}
                  {g.options.map((o) => {
                    const flatIdx = flat.indexOf(o);
                    const active = flatIdx === cursor;
                    const isSelected = selectedSet.has(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setCursor(flatIdx)}
                        onClick={() => pick(o)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm cursor-pointer transition-colors ${
                          active ? "bg-champagne-dark" : "bg-transparent hover:bg-champagne-dark/50"
                        } ${isSelected ? "ring-1 ring-main/10" : ""}`}
                      >
                        {/* Reserved-width slot for the "selected" check —
                             we render the icon only when the row is picked
                             but keep the width at all times so the label
                             column never shifts horizontally. */}
                        {multiple && (
                          <span
                            className={`inline-flex w-4 items-center justify-center shrink-0 transition-opacity text-main ${
                              isSelected ? "opacity-100" : "opacity-0"
                            }`}
                            aria-hidden
                          >
                            <Check size={14} strokeWidth={2.5} />
                          </span>
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="text-ink block truncate">{o.label}</span>
                          {o.sub && <span className="text-[11px] text-stone block truncate">{o.sub}</span>}
                        </span>
                        {/* Price / currency tag */}
                        {o.rightText && (
                          <span className="text-[12px] text-main font-medium tabular-nums shrink-0 whitespace-nowrap">
                            {o.rightText}
                          </span>
                        )}
                        {/* Thumbnail — mostly used for doctors. Focal
                             point + zoom are applied via a transform
                             wrapper with transform-origin at the focal
                             point, so zooming keeps the subject anchored. */}
                        {o.rightImage && (
                          <span className="relative w-12 h-12 rounded-full overflow-hidden bg-champagne-dark shrink-0 border border-line">
                            <span
                              className="absolute inset-0"
                              style={{
                                transform: `scale(${o.rightImageScale || 1})`,
                                transformOrigin: o.rightImageFocalPoint || "50% 50%",
                              }}
                            >
                              {/* `sizes` has to cover both the 48 px box
                                    and the CSS zoom + retina density, or
                                    Next fetches a tiny variant that the
                                    browser upscales into mush. */}
                              <Image
                                src={o.rightImage}
                                alt=""
                                fill
                                sizes="256px"
                                quality={92}
                                className="object-cover"
                                style={{ objectPosition: o.rightImageFocalPoint || "50% 50%" }}
                              />
                            </span>
                          </span>
                        )}
                        {/* Single-select selected indicator */}
                        {!multiple && isSelected && (
                          <Check size={14} className="text-main shrink-0" />
                        )}
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
