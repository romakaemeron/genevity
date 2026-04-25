"use client";

import React, { useState, useTransition } from "react";
import { Trash2, Plus, Check, ArrowUpDown } from "lucide-react";
import { SECTION_LABELS, SECTION_TYPES, SectionEditor, createDefaultData } from "./section-editors";
import { SectionLocaleProvider } from "./locale-inputs";
import { saveSections } from "../_actions/sections";

interface Section {
  /** DB row ID for existing sections — undefined for newly-added sections until saved. */
  id?: string;
  type: string;
  data: any;
}

interface Props {
  ownerType: "service" | "category" | "static_page";
  ownerId: string;
  initial: Section[];
  doctors?: { id: string; name_uk: string; role_uk: string | null }[];
  bottomSlot?: React.ReactNode;
}

export default function SectionBuilder({ ownerType, ownerId, initial, doctors, bottomSlot }: Props) {
  const [sections, setSections] = useState<Section[]>(initial);
  const [expanded, setExpanded] = useState<number | null>(initial.length === 0 ? null : 0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Section>) => {
    const next = [...sections];
    next[i] = { ...next[i], ...patch };
    setSections(next);
  };
  const remove = (i: number) => {
    if (!confirm("Remove this section?")) return;
    setSections(sections.filter((_, idx) => idx !== i));
    if (expanded === i) setExpanded(null);
  };
  const add = (type: string) => {
    setSections([...sections, { type, data: createDefaultData(type) }]);
    setExpanded(sections.length);
    setPickerOpen(false);
  };

  const save = () => {
    startTransition(async () => {
      await saveSections(ownerType, ownerId, sections);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-champagne/40 border border-line px-4 py-3 flex items-start gap-3">
        <ArrowUpDown size={16} className="text-muted mt-0.5 shrink-0" />
        <p className="body-s text-muted">
          This tab is for <strong>editing section content</strong>. To <strong>reorder</strong> the sections
          (and interleave them with FAQ / doctors / equipment etc.), switch to the <strong>Layout</strong> tab.
        </p>
      </div>
      {sections.map((section, i) => (
        <div
          key={section.id || i}
          className="rounded-xl border border-line bg-champagne-dark overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2.5 bg-champagne/40 border-b border-line">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex-1 text-left text-sm font-medium text-ink hover:text-main transition-colors cursor-pointer"
            >
              <span className="text-xs text-muted mr-2">#{i + 1}</span>
              {SECTION_LABELS[section.type] || section.type}
              <span className="ml-2 text-xs text-muted">
                {previewText(section)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted hover:text-error transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {expanded === i && (
            <SectionLocaleProvider>
              <div className="p-5 flex flex-col gap-5">
                <SectionEditor
                  type={section.type}
                  data={section.data}
                  onChange={(data) => update(i, { data })}
                  doctors={doctors}
                />
              </div>
            </SectionLocaleProvider>
          )}
        </div>
      ))}

      {sections.length === 0 && (
        <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No sections yet. Add one to get started.
        </div>
      )}

      {bottomSlot}

      {/* Add + Save bar */}
      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add section
          </button>
          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl bg-champagne-dark border border-line shadow-lg overflow-hidden z-20">
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => add(type)}
                    className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-champagne/60 transition-colors cursor-pointer border-b border-line last:border-b-0"
                  >
                    {SECTION_LABELS[type]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        {savedAt && (
          <span className="inline-flex items-center gap-1.5 text-xs text-success">
            <Check size={14} /> Saved
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : "Save sections"}
        </button>
      </div>
    </div>
  );
}

function previewText(section: Section): string {
  const d = section.data || {};
  const str = (v: any) => (v?.uk || v?.ru || v?.en || "").toString().slice(0, 40);
  switch (section.type) {
    case "richText":
    case "bullets":
    case "steps":
    case "compareTable":
    case "priceTeaser":
    case "imageGallery":
    case "relatedDoctors":
    case "cta":
      return str(d.heading);
    case "indicationsContraindications":
      return str(d.indicationsHeading);
    case "callout":
      return `${d.tone || "info"} · ${str(d.body)}`;
    default:
      return "";
  }
}
