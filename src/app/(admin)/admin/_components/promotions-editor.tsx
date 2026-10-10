"use client";

/**
 * ТЗ #16 §1.2 — editor for the homepage "Акції / Спеціальні пропозиції" cards.
 *
 * Replaces the whole set on save (keeps the drag order authoritative). An offer
 * with an end date disappears from the public page by itself once that date
 * passes, so nobody has to remember to unpublish it.
 */

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, Plus, Trash2, Upload, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";
import MediaPicker from "./media-picker";
import { savePromotions, uploadPromotionImage } from "../_actions/promotions";
import type { PromotionInput } from "@/lib/db/queries/promotions";
import { useUnsavedTracker } from "./unsaved-changes";

const emptyPromotion = (): PromotionInput => ({
  badge_uk: "", badge_ru: "", badge_en: "",
  title_uk: "", title_ru: "", title_en: "",
  description_uk: "", description_ru: "", description_en: "",
  terms_uk: "", terms_ru: "", terms_en: "",
  cta_label_uk: "", cta_label_ru: "", cta_label_en: "",
  image_url: "",
  image_focal_point: "50% 50%",
  cta_href: "",
  valid_until: "",
  is_published: true,
});

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all placeholder:text-stone-light";

export default function PromotionsEditor({ initial }: { initial: PromotionInput[] }) {
  const [items, setItems] = useState<PromotionInput[]>(initial);
  const [locale, setLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));

  const dirty = JSON.stringify(items) !== baseline;

  const save = () => {
    startTransition(async () => {
      await savePromotions(items);
      setBaseline(JSON.stringify(items));
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    });
  };

  useUnsavedTracker({
    id: "promotions",
    label: "Акції на головній",
    dirty,
    save,
    discard: () => setItems(JSON.parse(baseline) as PromotionInput[]),
  });

  const update = (i: number, patch: Partial<PromotionInput>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => {
    if (!confirm("Remove this offer?")) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const { getRowProps, getHandleProps } = useReorderable(items, setItems);

  const handleUpload = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadPromotionImage(fd);
      update(i, { image_url: url });
    } finally {
      setUploadingIdx(null);
    }
  };

  const untitled = items.filter((it) => !it.title_uk.trim()).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Language</span>
        <MiniTabs active={locale} onChange={setLocale} />
        <span className="ml-auto text-xs text-muted">{items.length} offers</span>
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
            <span className="text-sm font-medium text-ink truncate">
              {it[`title_${locale}` as const] || it.title_uk || "—"}
            </span>
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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
            {/* Image */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Image (optional)</span>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line bg-champagne">
                {it.image_url ? (
                  <>
                    <Image src={it.image_url} alt="" fill sizes="240px" className="object-cover" unoptimized style={{ objectPosition: it.image_focal_point }} />
                    <button
                      type="button"
                      onClick={() => update(i, { image_url: "" })}
                      title="Remove image"
                      className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1.5 text-muted hover:text-error cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <label className={`inline-flex cursor-pointer flex-col items-center gap-1 text-muted hover:text-ink ${uploadingIdx === i ? "pointer-events-none opacity-50" : ""}`}>
                      <Upload size={16} />
                      <span className="text-[10px]">{uploadingIdx === i ? "Uploading…" : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(i, f); e.target.value = ""; }}
                      />
                    </label>
                    <button type="button" onClick={() => setPickerIdx(i)} className="inline-flex items-center gap-1 text-[10px] text-main hover:text-main-dark cursor-pointer">
                      <ImageIcon size={11} /> Library
                    </button>
                  </div>
                )}
              </div>
              {it.image_url && (
                <input
                  value={it.image_focal_point}
                  onChange={(e) => update(i, { image_focal_point: e.target.value })}
                  placeholder="50% 50%"
                  className={inputClass}
                />
              )}
            </div>

            {/* Copy */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Badge ({locale})</label>
                  <input
                    value={it[`badge_${locale}` as const]}
                    onChange={(e) => update(i, { [`badge_${locale}`]: e.target.value } as Partial<PromotionInput>)}
                    placeholder="-20%"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                    Title ({locale}){locale === "uk" && " — required"}
                  </label>
                  <input
                    value={it[`title_${locale}` as const]}
                    onChange={(e) => update(i, { [`title_${locale}`]: e.target.value } as Partial<PromotionInput>)}
                    placeholder="Знижка 20% на перший курс EMSCULPT NEO"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Description ({locale})</label>
                <textarea
                  rows={2}
                  value={it[`description_${locale}` as const]}
                  onChange={(e) => update(i, { [`description_${locale}`]: e.target.value } as Partial<PromotionInput>)}
                  placeholder="Що саме входить у пропозицію."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Button label ({locale})</label>
                  <input
                    value={it[`cta_label_${locale}` as const]}
                    onChange={(e) => update(i, { [`cta_label_${locale}`]: e.target.value } as Partial<PromotionInput>)}
                    placeholder="Записатися"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Link (optional)</label>
                  <input
                    value={it.cta_href}
                    onChange={(e) => update(i, { cta_href: e.target.value })}
                    placeholder="/services/apparatus-cosmetology/emsculpt-neo"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Valid until</label>
                  <input
                    type="date"
                    value={it.valid_until}
                    onChange={(e) => update(i, { valid_until: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted">
                Link must start with <code className="font-mono">/</code> — leave it empty and the button
                opens the booking form instead. An offer past its <strong>Valid until</strong> date stops
                showing on the homepage automatically.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Terms / fine print ({locale})</label>
                <textarea
                  rows={2}
                  value={it[`terms_${locale}` as const]}
                  onChange={(e) => update(i, { [`terms_${locale}`]: e.target.value } as Partial<PromotionInput>)}
                  placeholder="Пропозиція не сумується з іншими акціями."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          No offers yet. The homepage block is hidden while this list is empty.
        </div>
      )}

      {untitled > 0 && (
        <p className="text-xs text-amber-600">
          {untitled} offer{untitled > 1 ? "s" : ""} without a Ukrainian title — those are dropped on save.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyPromotion()])}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-champagne-dark px-4 py-2.5 text-sm text-ink transition-colors hover:border-main cursor-pointer"
        >
          <Plus size={14} /> Add offer
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-main px-5 py-2.5 text-sm font-medium text-champagne transition-colors hover:bg-main-dark disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Saving…" : "Save offers"}
        </button>
        {savedAt && (
          <span className="inline-flex items-center gap-1.5 text-sm text-success">
            <Check size={14} /> Saved
          </span>
        )}
      </div>

      <MediaPicker
        open={pickerIdx !== null}
        onClose={() => setPickerIdx(null)}
        preferredFolder="promotions"
        onPick={(url) => {
          if (pickerIdx !== null) update(pickerIdx, { image_url: url });
          setPickerIdx(null);
        }}
      />
    </div>
  );
}
