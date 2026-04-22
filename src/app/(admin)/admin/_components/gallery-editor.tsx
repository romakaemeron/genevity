"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Trash2, Plus, Check, Upload } from "lucide-react";
import { saveGallery, uploadPhase2Image } from "../_actions/phase2";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";

export interface GalleryItemInput {
  id?: string;
  image_url: string;
  alt_uk: string; alt_ru: string; alt_en: string;
  label_uk: string; label_ru: string; label_en: string;
  sublabel_uk: string; sublabel_ru: string; sublabel_en: string;
  description_uk: string; description_ru: string; description_en: string;
}

const emptyItem = (): GalleryItemInput => ({
  image_url: "",
  alt_uk: "", alt_ru: "", alt_en: "",
  label_uk: "", label_ru: "", label_en: "",
  sublabel_uk: "", sublabel_ru: "", sublabel_en: "",
  description_uk: "", description_ru: "", description_en: "",
});

interface Props {
  ownerKey: string;
  initial: GalleryItemInput[];
}

export default function GalleryEditor({ ownerKey, initial }: Props) {
  const [items, setItems] = useState<GalleryItemInput[]>(initial);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const update = (i: number, patch: Partial<GalleryItemInput>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    setItems(next);
  };
  const remove = (i: number) => {
    if (!confirm("Remove this photo?")) return;
    setItems(items.filter((_, idx) => idx !== i));
    if (expanded === i) setExpanded(null);
  };
  const add = () => {
    setItems([...items, emptyItem()]);
    setExpanded(items.length);
  };
  const handleUpload = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadPhase2Image(fd);
      update(i, { image_url: url });
    } finally {
      setUploadingIdx(null);
    }
  };

  const save = () => {
    startTransition(async () => {
      await saveGallery(ownerKey, items);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  const field = (key: "label" | "sublabel" | "description" | "alt") => `${key}_${locale}` as const;
  const inputCls = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";

  const { getRowProps, getHandleProps } = useReorderable(items, (next) => {
    setItems(next);
    setExpanded(null);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <MiniTabs active={locale} onChange={setLocale} />
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          {...getRowProps(i)}
          className={`rounded-xl border border-line bg-champagne-dark overflow-hidden ${REORDERABLE_ROW_CLASSES}`}
        >
          <div className="flex items-center gap-3 p-3 bg-champagne/40 border-b border-line">
            <DragHandle {...getHandleProps(i)} />
            <div className="relative w-20 h-16 rounded overflow-hidden bg-champagne-dark shrink-0 cursor-pointer" onClick={() => fileInputRefs.current[i]?.click()}>
              {item.image_url ? (
                <Image src={item.image_url} alt="" fill className="object-cover" sizes="80px" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted text-[10px] gap-0.5">
                  <Upload size={12} />
                  {uploadingIdx === i ? "..." : "Upload"}
                </div>
              )}
              <input
                ref={(el) => { fileInputRefs.current[i] = el; }}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleUpload(i, e.target.files[0])}
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex-1 text-left text-sm font-medium text-ink hover:text-main transition-colors cursor-pointer truncate"
            >
              <span className="text-xs text-muted mr-2">#{i + 1}</span>
              {item[field("label")] || <span className="text-muted italic">No label ({locale})</span>}
            </button>
            <button type="button" onClick={() => remove(i)} className="text-muted hover:text-error cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
          {expanded === i && (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Label ({locale.toUpperCase()})</label>
                <input value={item[field("label")]} onChange={(e) => update(i, { [field("label")]: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Sublabel ({locale.toUpperCase()})</label>
                <input value={item[field("sublabel")]} onChange={(e) => update(i, { [field("sublabel")]: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Description ({locale.toUpperCase()})</label>
                <textarea rows={3} value={item[field("description")]} onChange={(e) => update(i, { [field("description")]: e.target.value })} className={`${inputCls} resize-y`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Alt text ({locale.toUpperCase()})</label>
                <input value={item[field("alt")]} onChange={(e) => update(i, { [field("alt")]: e.target.value })} className={inputCls} />
              </div>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No photos yet.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer">
          <Plus size={14} /> Add photo
        </button>
        <div className="flex-1" />
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <button type="button" onClick={save} disabled={pending} className="px-4 py-2.5 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer">
          {pending ? "Saving..." : "Save gallery"}
        </button>
      </div>
    </div>
  );
}
