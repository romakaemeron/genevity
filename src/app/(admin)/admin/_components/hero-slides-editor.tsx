"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import Image from "next/image";
import { Trash2, Plus, Check, Upload, Image as ImageIcon, Crop } from "lucide-react";
import { saveHeroSlides, uploadPhase2Image } from "../_actions/phase2";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useUnsavedTracker } from "./unsaved-changes";
import Button from "@/components/ui/Button";
import { useReorderable, DragHandle, REORDERABLE_ROW_CLASSES } from "./reorderable";
import MediaPicker from "./media-picker";
import HeroFocalResponsiveEditor, { type HeroFocalValue } from "./hero-focal-responsive-editor";

interface Slide {
  id?: string;
  image_url: string;
  /** Per-breakpoint focal points. Accepts the legacy flat string so DB rows
   *  that weren't yet touched by the migration still round-trip cleanly. */
  object_position: HeroFocalValue | string;
  alt_uk: string;
  alt_ru: string;
  alt_en: string;
}

interface Props {
  initial: Slide[];
  /** Live homepage hero copy — used as the preview overlay inside the
   *  responsive focal-point editor so admins see where text will sit. */
  heroContent?: { title: string; subtitle: string; cta: string; location: string };
}

function normalizeFocal(v: HeroFocalValue | string | undefined | null): HeroFocalValue {
  const fallback = "50% 50%";
  if (!v) return { desktop: fallback, tablet: fallback, mobile: fallback };
  if (typeof v === "string") return { desktop: v, tablet: v, mobile: v };
  return {
    desktop: v.desktop || fallback,
    tablet: v.tablet || fallback,
    mobile: v.mobile || fallback,
  };
}

export default function HeroSlidesEditor({ initial, heroContent }: Props) {
  const hydrated = useMemo<Slide[]>(
    () => initial.map((s) => ({ ...s, object_position: normalizeFocal(s.object_position) })),
    [initial],
  );
  const [slides, setSlides] = useState<Slide[]>(hydrated);
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [pickerForIdx, setPickerForIdx] = useState<number | null>(null);
  const [focalForIdx, setFocalForIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const update = (i: number, patch: Partial<Slide>) => {
    const next = [...slides];
    next[i] = { ...next[i], ...patch };
    setSlides(next);
  };
  const remove = (i: number) => {
    if (!confirm("Remove this slide?")) return;
    setSlides(slides.filter((_, idx) => idx !== i));
  };
  const add = () => {
    setSlides([
      ...slides,
      {
        image_url: "",
        object_position: { desktop: "50% 50%", tablet: "50% 50%", mobile: "50% 50%" },
        alt_uk: "", alt_ru: "", alt_en: "",
      },
    ]);
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

  const initialSnapshot = useMemo(() => JSON.stringify(hydrated), [hydrated]);
  const dirty = JSON.stringify(slides) !== initialSnapshot;

  const doSave = async () => {
    await saveHeroSlides(slides);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };
  const save = () => { startTransition(() => { void doSave(); }); };

  const cancel = () => setSlides(hydrated);

  useUnsavedTracker({
    id: "hero-slides",
    label: "Hero slideshow",
    dirty,
    save: doSave,
    discard: cancel,
  });

  const { getRowProps, getHandleProps } = useReorderable(slides, setSlides);

  const altKey = `alt_${activeLocale}` as const;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <MiniTabs active={activeLocale} onChange={setActiveLocale} />
      </div>

      {slides.map((slide, i) => (
        <div
          key={i}
          {...getRowProps(i)}
          className={`flex gap-3 p-3 rounded-xl border border-line bg-champagne-dark ${REORDERABLE_ROW_CLASSES}`}
        >
          <div className="flex flex-col items-center gap-1">
            <DragHandle {...getHandleProps(i)} />
            <span className="text-[10px] text-muted text-center">#{i + 1}</span>
          </div>

          <div
            className="relative w-32 h-24 rounded-lg overflow-hidden bg-champagne-dark border border-line cursor-pointer flex-shrink-0"
            onClick={() => fileInputRefs.current[i]?.click()}
          >
            {slide.image_url ? (
              <Image src={slide.image_url} alt="" fill className="object-cover" sizes="128px" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted text-xs gap-1">
                <Upload size={14} />
                {uploadingIdx === i ? "Uploading..." : "Upload"}
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

          <div className="flex-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPickerForIdx(i); }}
              className="inline-flex items-center gap-1.5 text-[11px] text-main hover:text-main-dark transition-colors cursor-pointer self-start"
            >
              <ImageIcon size={11} />
              Pick from library
            </button>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-muted uppercase tracking-wider">Focal points</label>
              {(() => {
                const fp = normalizeFocal(slide.object_position);
                const allSame = fp.desktop === fp.tablet && fp.tablet === fp.mobile;
                return (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFocalForIdx(i); }}
                    disabled={!slide.image_url}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white border border-line text-ink text-xs hover:border-main transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start"
                    title={slide.image_url ? "Open responsive focal-point editor" : "Upload an image first"}
                  >
                    <Crop size={12} />
                    {allSame
                      ? `All: ${fp.desktop}`
                      : `D ${fp.desktop} · T ${fp.tablet} · M ${fp.mobile}`}
                  </button>
                );
              })()}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-muted uppercase tracking-wider">Alt text ({activeLocale.toUpperCase()})</label>
              <input
                value={slide[altKey] || ""}
                onChange={(e) => update(i, { [altKey]: e.target.value })}
                placeholder="Describe the image"
                className="px-2 py-1.5 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main"
              />
            </div>
          </div>

          <button type="button" onClick={() => remove(i)} className="text-muted hover:text-error transition-colors cursor-pointer self-start">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {slides.length === 0 && (
        <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-line text-muted text-sm">
          No slides yet. Add one to get started.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark text-sm text-ink hover:border-main transition-colors cursor-pointer">
          <Plus size={14} /> Add slide
        </button>
        <div className="flex-1" />
        {dirty && !savedAt && <span className="text-xs text-warning">Unsaved changes</span>}
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty} title="Revert unsaved edits to the last-saved values">
          Cancel changes
        </Button>
        <Button variant="primary" size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? "Saving..." : "Save slides"}
        </Button>
      </div>

      <MediaPicker
        open={pickerForIdx !== null}
        onClose={() => setPickerForIdx(null)}
        onPick={(url) => {
          if (pickerForIdx !== null) update(pickerForIdx, { image_url: url });
        }}
        preferredFolder="hero"
      />

      {focalForIdx !== null && slides[focalForIdx]?.image_url && (
        <HeroFocalResponsiveEditor
          open
          onClose={() => setFocalForIdx(null)}
          imageUrl={slides[focalForIdx].image_url}
          initial={normalizeFocal(slides[focalForIdx].object_position)}
          heroContent={heroContent || { title: "", subtitle: "", cta: "", location: "" }}
          onSave={(next) => update(focalForIdx, { object_position: next })}
        />
      )}
    </div>
  );
}
