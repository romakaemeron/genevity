"use client";

/**
 * ТЗ #16 §1.1 / §2.1 — editor for "До / Після" cases.
 *
 * Mounted twice with different owners: once on /admin/settings/before-after
 * (homepage) and once as a tab on the service form. Saving replaces the whole
 * set for that owner, which is what keeps the drag order meaningful.
 */

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, Plus, Trash2, Upload, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";
import MediaPicker from "./media-picker";
import { saveBeforeAfterCases, uploadBeforeAfterImage } from "../_actions/before-after";
import type { BeforeAfterCaseInput } from "@/lib/db/queries/before-after";
import { useUnsavedTracker } from "./unsaved-changes";

const emptyCase = (): BeforeAfterCaseInput => ({
  before_url: "", after_url: "",
  title_uk: "", title_ru: "", title_en: "",
  zone_uk: "", zone_ru: "", zone_en: "",
  sessions_uk: "", sessions_ru: "", sessions_en: "",
  note_uk: "", note_ru: "", note_en: "",
  alt_uk: "", alt_ru: "", alt_en: "",
  is_published: true,
});

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all placeholder:text-stone-light";

type Slot = "before_url" | "after_url";

function PhotoSlot({
  label, url, uploading, onUpload, onPick, onClear,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted uppercase tracking-wider">{label}</span>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-champagne">
        {url ? (
          <>
            <Image src={url} alt="" fill sizes="240px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={onClear}
              title="Remove photo"
              className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1.5 text-muted hover:text-error cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <label className={`inline-flex cursor-pointer flex-col items-center gap-1 text-muted transition-colors hover:text-ink ${uploading ? "pointer-events-none opacity-50" : ""}`}>
              <Upload size={16} />
              <span className="text-[10px]">{uploading ? "Uploading…" : "Upload"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
              />
            </label>
            <button type="button" onClick={onPick} className="inline-flex items-center gap-1 text-[10px] text-main hover:text-main-dark cursor-pointer">
              <ImageIcon size={11} /> Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  /** 'homepage' or 'service:<uuid>'. */
  ownerKey: string;
  /** Shown in the unsaved-changes guard. */
  ownerLabel: string;
  initial: BeforeAfterCaseInput[];
}

export default function BeforeAfterEditor({ ownerKey, ownerLabel, initial }: Props) {
  const [items, setItems] = useState<BeforeAfterCaseInput[]>(initial);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [picker, setPicker] = useState<{ index: number; slot: Slot } | null>(null);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));

  const dirty = JSON.stringify(items) !== baseline;

  const save = () => {
    startTransition(async () => {
      await saveBeforeAfterCases(ownerKey, items);
      setBaseline(JSON.stringify(items));
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  useUnsavedTracker({
    id: `before-after:${ownerKey}`,
    label: `Before / After · ${ownerLabel}`,
    dirty,
    save,
    discard: () => setItems(JSON.parse(baseline) as BeforeAfterCaseInput[]),
  });

  const update = (i: number, patch: Partial<BeforeAfterCaseInput>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => {
    if (!confirm("Remove this before/after case?")) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const { getRowProps, getHandleProps } = useReorderable(items, setItems);

  const handleUpload = async (i: number, slot: Slot, file: File) => {
    const token = `${i}:${slot}`;
    setUploading(token);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadBeforeAfterImage(fd);
      update(i, { [slot]: url } as Partial<BeforeAfterCaseInput>);
    } finally {
      setUploading(null);
    }
  };

  const incomplete = items.filter((it) => !it.before_url || !it.after_url).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Language</span>
        <MiniTabs active={locale} onChange={setLocale} />
        <span className="ml-auto text-xs text-muted">{items.length} cases</span>
      </div>

      {items.map((it, i) => (
        <div
          key={it.id || `new-${i}`}
          {...getRowProps(i)}
          className={`${REORDERABLE_ROW_CLASSES} flex flex-col gap-4 rounded-xl border border-line bg-champagne-dark p-4`}
        >
          <div className="flex items-center gap-2">
            <DragHandle {...getHandleProps(i)} />
            <span className="text-xs text-muted">#{i + 1}</span>
            <button
              type="button"
              onClick={() => update(i, { is_published: !it.is_published })}
              title={it.is_published ? "Published — click to hide" : "Hidden — click to publish"}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-[11px] text-muted hover:text-ink cursor-pointer"
            >
              {it.is_published ? <Eye size={12} className="text-success" /> : <EyeOff size={12} />}
              {it.is_published ? "Published" : "Hidden"}
            </button>
            <button type="button" onClick={() => remove(i)} className="p-1.5 text-muted hover:text-error cursor-pointer" title="Remove">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_240px_1fr]">
            <PhotoSlot
              label="Before"
              url={it.before_url}
              uploading={uploading === `${i}:before_url`}
              onUpload={(f) => handleUpload(i, "before_url", f)}
              onPick={() => setPicker({ index: i, slot: "before_url" })}
              onClear={() => update(i, { before_url: "" })}
            />
            <PhotoSlot
              label="After"
              url={it.after_url}
              uploading={uploading === `${i}:after_url`}
              onUpload={(f) => handleUpload(i, "after_url", f)}
              onPick={() => setPicker({ index: i, slot: "after_url" })}
              onClear={() => update(i, { after_url: "" })}
            />

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Case title ({locale})</label>
                <input
                  value={it[`title_${locale}` as const]}
                  onChange={(e) => update(i, { [`title_${locale}`]: e.target.value } as Partial<BeforeAfterCaseInput>)}
                  placeholder="Корекція живота, пацієнтка 34 роки"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Treated zone ({locale})</label>
                  <input
                    value={it[`zone_${locale}` as const]}
                    onChange={(e) => update(i, { [`zone_${locale}`]: e.target.value } as Partial<BeforeAfterCaseInput>)}
                    placeholder="Живіт, боки"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Sessions ({locale})</label>
                  <input
                    value={it[`sessions_${locale}` as const]}
                    onChange={(e) => update(i, { [`sessions_${locale}`]: e.target.value } as Partial<BeforeAfterCaseInput>)}
                    placeholder="4 сеанси"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Note ({locale}) — optional</label>
                <textarea
                  rows={2}
                  value={it[`note_${locale}` as const]}
                  onChange={(e) => update(i, { [`note_${locale}`]: e.target.value } as Partial<BeforeAfterCaseInput>)}
                  placeholder="Інтервал між сеансами — 7 днів. Фото зроблені через 4 тижні після курсу."
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Alt text ({locale}) — for SEO</label>
                <input
                  value={it[`alt_${locale}` as const]}
                  onChange={(e) => update(i, { [`alt_${locale}`]: e.target.value } as Partial<BeforeAfterCaseInput>)}
                  placeholder="Фото до і після процедури EMSCULPT NEO на живіт"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          No cases yet. The block stays hidden on the public page until a case has both photos.
        </div>
      )}

      {incomplete > 0 && (
        <p className="text-xs text-amber-600">
          {incomplete} case{incomplete > 1 ? "s" : ""} missing a photo — those are dropped on save.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyCase()])}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-champagne-dark px-4 py-2.5 text-sm text-ink transition-colors hover:border-main cursor-pointer"
        >
          <Plus size={14} /> Add case
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-main px-5 py-2.5 text-sm font-medium text-champagne transition-colors hover:bg-main-dark disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Saving…" : "Save cases"}
        </button>
        {savedAt && (
          <span className="inline-flex items-center gap-1.5 text-sm text-success">
            <Check size={14} /> Saved
          </span>
        )}
      </div>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        preferredFolder="before-after"
        onPick={(url) => {
          if (picker) update(picker.index, { [picker.slot]: url } as Partial<BeforeAfterCaseInput>);
          setPicker(null);
        }}
      />
    </div>
  );
}
