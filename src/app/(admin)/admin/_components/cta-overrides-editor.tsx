"use client";

/**
 * Dedicated editor for per-instance CTA copy overrides. Each entry in
 * CTA_REGISTRY gets a collapsible card with four optional localized
 * fields (buttonLabel / modalTitle / modalSubtitle / submitLabel).
 *
 * Overrides are stored under ui_strings.cta.<key>.<field> and a blank
 * string falls back to the global ctaForm default at render time. The
 * global defaults are surfaced as placeholders so the admin can see
 * what they're overriding.
 */

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { saveAtPath } from "../_actions/ui-strings";
import { useUnsavedTracker } from "./unsaved-changes";
import { CTA_REGISTRY } from "@/lib/cta-registry";
import type { CtaOverrideFields } from "@/lib/cta-registry";

type LocaleKey = "uk" | "ru" | "en";
const LOCALES: LocaleKey[] = ["uk", "ru", "en"];
const LOCALE_LABEL: Record<LocaleKey, string> = { uk: "UA", ru: "RU", en: "EN" };

const FIELDS: { key: CtaOverrideFields; label: string; description: string }[] = [
  { key: "buttonLabel",   label: "Button label",   description: "Text shown on the CTA button itself. Blank = use the caller's default." },
  { key: "modalTitle",    label: "Modal title",    description: "Heading at the top of the booking form modal." },
  { key: "modalSubtitle", label: "Modal subtitle", description: "Short line under the title setting context for the form." },
  { key: "submitLabel",   label: "Submit label",   description: "Label on the 'Send' button inside the form." },
];

type Leaf = { uk?: string; ru?: string; en?: string };
type CtaOverrides = Record<string, Record<string, Leaf>>;

interface Props {
  initial: CtaOverrides;
  /** Global ctaForm fallbacks (per-locale) surfaced as placeholders. */
  globalFallbacks: Record<string, Leaf>;
}

const GROUPS = Array.from(new Set(CTA_REGISTRY.map((e) => e.group)));

export default function CtaOverridesEditor({ initial, globalFallbacks }: Props) {
  const [active, setActive] = useState<LocaleKey>("uk");
  const [overrides, setOverrides] = useState<CtaOverrides>(() => hydrate(initial));
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const baseline = useMemo(() => JSON.stringify(hydrate(initial)), [initial]);
  const current = JSON.stringify(overrides);
  const dirty = current !== baseline;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CTA_REGISTRY;
    return CTA_REGISTRY.filter((e) => {
      if (e.key.toLowerCase().includes(q)) return true;
      if (e.label.toLowerCase().includes(q)) return true;
      if (e.description.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [query]);

  const update = (key: string, field: CtaOverrideFields, locale: LocaleKey, value: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      next[key] = { ...(next[key] || {}) };
      next[key][field] = { ...((next[key][field] as Leaf) || {}), [locale]: value };
      return next;
    });
  };

  const doSave = async () => {
    await saveAtPath("cta", overrides);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const save = () => { startTransition(() => { void doSave(); }); };
  const cancel = () => setOverrides(hydrate(initial));

  useUnsavedTracker({
    id: "cta-overrides",
    label: "CTA overrides",
    dirty,
    save: doSave,
    discard: cancel,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Locale + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex p-1 rounded-xl bg-champagne-dark gap-1">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActive(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                active === l ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {LOCALE_LABEL[l]}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CTAs by location name…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main"
          />
        </div>

        <span className="text-xs text-muted ml-auto">
          {filtered.length} of {CTA_REGISTRY.length} CTAs
        </span>
      </div>

      {/* Grouped list */}
      <div className="flex flex-col gap-6">
        {GROUPS.map((group) => {
          const inGroup = filtered.filter((e) => e.group === group);
          if (inGroup.length === 0) return null;
          return (
            <div key={group} className="flex flex-col gap-2">
              <h3 className="text-[11px] font-semibold text-muted uppercase tracking-[0.1em]">{group}</h3>
              <div className="flex flex-col gap-2">
                {inGroup.map((entry) => {
                  const isOpen = !!expanded[entry.key];
                  const entryOverrides = overrides[entry.key] || {};
                  const filled = FIELDS.reduce((n, f) => {
                    const leaf = entryOverrides[f.key] as Leaf | undefined;
                    return n + (leaf?.[active]?.trim() ? 1 : 0);
                  }, 0);
                  return (
                    <div key={entry.key} className="rounded-xl border border-line bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpanded((prev) => ({ ...prev, [entry.key]: !isOpen }))}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-champagne-dark/40 transition-colors cursor-pointer text-left"
                      >
                        <ChevronDown
                          size={14}
                          className={`text-muted transition-transform shrink-0 ${isOpen ? "rotate-180" : "-rotate-90"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{entry.label}</p>
                          <p className="text-[11px] text-muted truncate">{entry.description}</p>
                        </div>
                        <span className="text-[10px] font-mono text-muted shrink-0">cta.{entry.key}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                            filled > 0 ? "bg-main/15 text-main" : "bg-champagne-dark text-muted"
                          }`}
                        >
                          {filled}/{FIELDS.length} {LOCALE_LABEL[active]}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-line bg-champagne-dark/20 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {FIELDS.map((f) => {
                            const leaf = (entryOverrides[f.key] as Leaf | undefined) || {};
                            const value = leaf[active] || "";
                            const fallback = globalFallbacks[mapToGlobalField(f.key)]?.[active] || "";
                            return (
                              <div key={f.key} className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                                  {f.label}
                                </label>
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => update(entry.key, f.key, active, e.target.value)}
                                  placeholder={fallback || "Use default"}
                                  className="px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main"
                                />
                                <p className="text-[10px] text-muted">{f.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-muted">No CTAs match that search.</div>
        )}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-champagne-dark/90 backdrop-blur-lg border-t border-line -mx-8 px-8 py-3 flex items-center gap-3">
        {dirty && !savedAt && <span className="text-xs text-warning">Unsaved changes</span>}
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <div className="flex-1" />
        <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty} title="Revert to last-saved">
          Cancel changes
        </Button>
        <Button variant="primary" size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? "Saving..." : "Save overrides"}
        </Button>
      </div>
    </div>
  );
}

/** The CTA field name inside the global ctaForm fallback — submitLabel maps
 *  to the existing `submit` key, others share a name. */
function mapToGlobalField(f: CtaOverrideFields): string {
  return f === "submitLabel" ? "submit" : f;
}

/** Ensure every registered CTA has an entry so controlled inputs don't toggle
 *  between undefined and a string. */
function hydrate(src: CtaOverrides): CtaOverrides {
  const out: CtaOverrides = {};
  for (const e of CTA_REGISTRY) {
    const raw = (src[e.key] as Record<string, Leaf>) || {};
    out[e.key] = {};
    for (const f of FIELDS) {
      const leaf = raw[f.key] || {};
      out[e.key][f.key] = { uk: leaf.uk || "", ru: leaf.ru || "", en: leaf.en || "" };
    }
  }
  return out;
}
