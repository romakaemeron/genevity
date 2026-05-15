"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useUnsavedTracker } from "./unsaved-changes";
import {
  saveServiceOverrides,
  type LocaleString,
  type ServiceBlockHeadingsInput,
} from "../_actions/services";

interface BlockSpec {
  key: keyof ServiceBlockHeadingsInput;
  label: string;
  globalDefault?: { uk: string; ru: string; en: string };
}

interface Props {
  serviceId: string;
  serviceLabel: string;
  blocks: BlockSpec[];
  initialHeadings: ServiceBlockHeadingsInput;
}

function hydrateHeadings(raw: ServiceBlockHeadingsInput): Record<string, LocaleString> {
  const out: Record<string, LocaleString> = {};
  for (const k of ["faq", "doctors", "equipment", "relatedServices"] as const) {
    const src = raw[k] || {};
    out[k] = { uk: src.uk || "", ru: src.ru || "", en: src.en || "" };
  }
  return out;
}

export default function ServiceOverridesEditor({
  serviceId, serviceLabel, blocks, initialHeadings,
}: Props) {
  const [headings, setHeadings] = useState<Record<string, LocaleString>>(() => hydrateHeadings(initialHeadings));
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("uk");
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const baseline = useMemo(() => JSON.stringify(hydrateHeadings(initialHeadings)), [initialHeadings]);
  const dirty = JSON.stringify(headings) !== baseline;

  const updateHeading = (blockKey: string, value: string) => {
    setHeadings((prev) => ({ ...prev, [blockKey]: { ...prev[blockKey], [activeLocale]: value } }));
  };

  const buildPayload = (): ServiceBlockHeadingsInput => {
    const out: ServiceBlockHeadingsInput = {};
    for (const b of blocks) {
      const v = headings[b.key];
      if (v && (v.uk?.trim() || v.ru?.trim() || v.en?.trim())) out[b.key as keyof ServiceBlockHeadingsInput] = v;
    }
    return out;
  };

  const doSave = async () => {
    await saveServiceOverrides(serviceId, buildPayload());
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const save = () => { startTransition(async () => { await doSave(); }); };
  const cancel = () => { setHeadings(hydrateHeadings(initialHeadings)); };

  useUnsavedTracker({
    id: `service-overrides:${serviceId}`,
    label: `Overrides · ${serviceLabel}`,
    dirty,
    save: doSave,
    discard: cancel,
  });

  return (
    <div className="rounded-xl border border-line bg-champagne-dark overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-champagne/40 border-b border-line">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center gap-2 text-left text-sm font-medium text-ink hover:text-main transition-colors cursor-pointer"
        >
          {expanded ? <ChevronDown size={14} className="text-muted shrink-0" /> : <ChevronRight size={14} className="text-muted shrink-0" />}
          Block heading overrides
          {dirty && <span className="ml-2 text-[10px] font-semibold text-warning uppercase tracking-wider">unsaved</span>}
        </button>
        {savedAt && (
          <span className="inline-flex items-center gap-1 text-xs text-success">
            <Check size={12} /> Saved
          </span>
        )}
      </div>

      {expanded && (
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Language</span>
            <MiniTabs active={activeLocale} onChange={setActiveLocale} />
          </div>
          <p className="text-[11px] text-muted -mt-2">
            Override section headings for this service. Leave blank to use global <em>ui_strings</em> defaults.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blocks.map((b) => (
              <div key={b.key} className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">{b.label}</label>
                <input
                  type="text"
                  value={headings[b.key]?.[activeLocale] || ""}
                  onChange={(e) => updateHeading(b.key, e.target.value)}
                  placeholder={b.globalDefault?.[activeLocale] || "Use global default"}
                  className="w-full px-3 py-2 rounded-lg bg-champagne-darker border border-line text-ink text-sm outline-none focus:border-main"
                />
                {b.globalDefault?.[activeLocale] && (
                  <p className="text-[10px] text-muted">Default: <span className="font-mono">{b.globalDefault[activeLocale]}</span></p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-line">
            <div className="flex-1" />
            <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={save} disabled={pending || !dirty}>
              {pending ? "Saving..." : "Save overrides"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
