"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, Check, ChevronRight } from "lucide-react";
import { saveLabServices, saveLabPrepSteps, saveLabCheckups } from "../_actions/phase2";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";

/* ------ Shared types ------ */
export interface LabServiceInput {
  id?: string;
  icon_key: string;
  label_uk: string; label_ru: string; label_en: string;
  items_uk: string[]; items_ru: string[]; items_en: string[];
  price_uk: string; price_ru: string; price_en: string;
}
export interface LabPrepStepInput {
  id?: string;
  icon_key: string;
  label_uk: string; label_ru: string; label_en: string;
  desc_uk: string; desc_ru: string; desc_en: string;
}
export interface LabCheckupInput {
  id?: string;
  label_uk: string; label_ru: string; label_en: string;
  price_uk: string; price_ru: string; price_en: string;
  desc_uk: string; desc_ru: string; desc_en: string;
}

interface Props {
  services: LabServiceInput[];
  prepSteps: LabPrepStepInput[];
  checkups: LabCheckupInput[];
}

type Tab = "services" | "prep" | "checkups";

export default function LabEditor({ services: iSvc, prepSteps: iPrep, checkups: iChk }: Props) {
  const [tab, setTab] = useState<Tab>("services");

  return (
    <div>
      <div className="flex gap-1 border-b border-line mb-6">
        {([["services", "Services"], ["prep", "Prep Steps"], ["checkups", "Check-Ups"]] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              tab === key ? "text-main border-b-2 border-main -mb-px" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "services" && <ServicesEditor initial={iSvc} />}
      {tab === "prep" && <PrepStepsEditor initial={iPrep} />}
      {tab === "checkups" && <CheckupsEditor initial={iChk} />}
    </div>
  );
}

/* ================== SERVICES ================== */
function ServicesEditor({ initial }: { initial: LabServiceInput[] }) {
  const [items, setItems] = useState(initial);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const upd = (i: number, patch: Partial<LabServiceInput>) => { const n = [...items]; n[i] = { ...n[i], ...patch }; setItems(n); };
  const remove = (i: number) => {
    if (!confirm("Remove this service?")) return;
    setItems(items.filter((_, idx) => idx !== i));
    if (expanded === i) setExpanded(null);
  };
  const add = () => {
    setItems([...items, { icon_key: "Scan", label_uk: "", label_ru: "", label_en: "", items_uk: [], items_ru: [], items_en: [], price_uk: "", price_ru: "", price_en: "" }]);
    setExpanded(items.length);
  };
  const save = () => {
    startTransition(async () => {
      await saveLabServices(items);
      setSavedAt(Date.now()); setTimeout(() => setSavedAt(null), 2000);
    });
  };

  const labelField = `label_${locale}` as const;
  const itemsField = `items_${locale}` as const;
  const priceField = `price_${locale}` as const;
  const inputCls = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";

  const { getRowProps, getHandleProps } = useReorderable(items, (next) => {
    setItems(next);
    setExpanded(null);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end"><MiniTabs active={locale} onChange={setLocale} /></div>

      {items.map((svc, i) => (
        <div
          key={i}
          {...getRowProps(i)}
          className={`rounded-xl border border-line bg-champagne-dark overflow-hidden ${REORDERABLE_ROW_CLASSES}`}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 bg-champagne/40 border-b border-line">
            <DragHandle {...getHandleProps(i)} />
            <button type="button" onClick={() => setExpanded(expanded === i ? null : i)} className="flex-1 text-left cursor-pointer">
              <ChevronRight size={12} className={`inline mr-2 text-muted transition-transform ${expanded === i ? "rotate-90" : ""}`} />
              <span className="text-sm font-medium text-ink">{svc[labelField] || <span className="text-muted italic">New service</span>}</span>
              <span className="text-xs text-muted ml-2">({svc.icon_key} · {(svc[itemsField] || []).length} items)</span>
            </button>
            <button type="button" onClick={() => remove(i)} className="text-muted hover:text-error cursor-pointer"><Trash2 size={14} /></button>
          </div>
          {expanded === i && (
            <div className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Icon (lucide key)</label>
                  <input value={svc.icon_key} onChange={(e) => upd(i, { icon_key: e.target.value })} placeholder="Scan" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Label ({locale.toUpperCase()})</label>
                  <input value={svc[labelField]} onChange={(e) => upd(i, { [labelField]: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Items ({locale.toUpperCase()}) — one per line</label>
                <textarea
                  rows={4}
                  value={(svc[itemsField] || []).join("\n")}
                  onChange={(e) => upd(i, { [itemsField]: e.target.value.split("\n").filter(Boolean) })}
                  className={`${inputCls} resize-y`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Price ({locale.toUpperCase()})</label>
                <input value={svc[priceField]} onChange={(e) => upd(i, { [priceField]: e.target.value })} placeholder="від 500 грн" className={inputCls} />
              </div>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">No services yet.</div>}

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer">
          <Plus size={14} /> Add service
        </button>
        <div className="flex-1" />
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button type="button" onClick={save} disabled={pending} className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer">
          {pending ? "Saving..." : "Save services"}
        </button>
      </div>
    </div>
  );
}

/* ================== PREP STEPS ================== */
function PrepStepsEditor({ initial }: { initial: LabPrepStepInput[] }) {
  const [items, setItems] = useState(initial);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const upd = (i: number, patch: Partial<LabPrepStepInput>) => { const n = [...items]; n[i] = { ...n[i], ...patch }; setItems(n); };
  const remove = (i: number) => { if (!confirm("Remove this step?")) return; setItems(items.filter((_, idx) => idx !== i)); };
  const add = () => setItems([...items, { icon_key: "Clock", label_uk: "", label_ru: "", label_en: "", desc_uk: "", desc_ru: "", desc_en: "" }]);

  const save = () => {
    startTransition(async () => {
      await saveLabPrepSteps(items);
      setSavedAt(Date.now()); setTimeout(() => setSavedAt(null), 2000);
    });
  };

  const labelField = `label_${locale}` as const;
  const descField = `desc_${locale}` as const;
  const inputCls = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";

  const { getRowProps, getHandleProps } = useReorderable(items, setItems);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end"><MiniTabs active={locale} onChange={setLocale} /></div>

      {items.map((step, i) => (
        <div
          key={i}
          {...getRowProps(i)}
          className={`rounded-xl border border-line bg-champagne-dark p-3 ${REORDERABLE_ROW_CLASSES}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1">
              <DragHandle {...getHandleProps(i)} />
              <span className="text-[10px] text-muted text-center">#{i + 1}</span>
            </div>
            <div className="flex-1 grid grid-cols-[100px_1fr] gap-2">
              <input value={step.icon_key} onChange={(e) => upd(i, { icon_key: e.target.value })} placeholder="Icon" className={inputCls} />
              <input value={step[labelField]} onChange={(e) => upd(i, { [labelField]: e.target.value })} placeholder="Label" className={inputCls} />
              <div />
              <textarea rows={2} value={step[descField]} onChange={(e) => upd(i, { [descField]: e.target.value })} placeholder="Description" className={`${inputCls} resize-y`} />
            </div>
            <button type="button" onClick={() => remove(i)} className="text-muted hover:text-error cursor-pointer"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}

      {items.length === 0 && <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">No prep steps yet.</div>}

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer">
          <Plus size={14} /> Add step
        </button>
        <div className="flex-1" />
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button type="button" onClick={save} disabled={pending} className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer">
          {pending ? "Saving..." : "Save steps"}
        </button>
      </div>
    </div>
  );
}

/* ================== CHECKUPS ================== */
function CheckupsEditor({ initial }: { initial: LabCheckupInput[] }) {
  const [items, setItems] = useState(initial);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const upd = (i: number, patch: Partial<LabCheckupInput>) => { const n = [...items]; n[i] = { ...n[i], ...patch }; setItems(n); };
  const remove = (i: number) => { if (!confirm("Remove this checkup?")) return; setItems(items.filter((_, idx) => idx !== i)); };
  const add = () => setItems([...items, { label_uk: "", label_ru: "", label_en: "", price_uk: "", price_ru: "", price_en: "", desc_uk: "", desc_ru: "", desc_en: "" }]);

  const save = () => {
    startTransition(async () => {
      await saveLabCheckups(items);
      setSavedAt(Date.now()); setTimeout(() => setSavedAt(null), 2000);
    });
  };

  const labelField = `label_${locale}` as const;
  const priceField = `price_${locale}` as const;
  const descField = `desc_${locale}` as const;
  const inputCls = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";

  const { getRowProps, getHandleProps } = useReorderable(items, setItems);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end"><MiniTabs active={locale} onChange={setLocale} /></div>

      {items.map((c, i) => (
        <div
          key={i}
          {...getRowProps(i)}
          className={`rounded-xl border border-line bg-champagne-dark p-3 flex flex-col gap-2 ${REORDERABLE_ROW_CLASSES}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1">
              <DragHandle {...getHandleProps(i)} />
              <span className="text-[10px] text-muted text-center">#{i + 1}</span>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input value={c[labelField]} onChange={(e) => upd(i, { [labelField]: e.target.value })} placeholder="Label" className={inputCls} />
              <input value={c[priceField]} onChange={(e) => upd(i, { [priceField]: e.target.value })} placeholder="Price" className={inputCls} />
            </div>
            <button type="button" onClick={() => remove(i)} className="text-muted hover:text-error cursor-pointer"><Trash2 size={14} /></button>
          </div>
          <textarea rows={2} value={c[descField]} onChange={(e) => upd(i, { [descField]: e.target.value })} placeholder="Description" className={`${inputCls} resize-y ml-[calc(14px+1rem)]`} />
        </div>
      ))}

      {items.length === 0 && <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">No checkups yet.</div>}

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer">
          <Plus size={14} /> Add checkup
        </button>
        <div className="flex-1" />
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button type="button" onClick={save} disabled={pending} className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer">
          {pending ? "Saving..." : "Save checkups"}
        </button>
      </div>
    </div>
  );
}
