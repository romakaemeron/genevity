"use client";

/**
 * Per-service overrides for the five reorderable blocks on the service detail
 * page — heading text overrides (fall back to global ui_strings when blank)
 * plus a Final CTA background customizer (CSS-token color or uploaded image
 * with an editable focal point).
 *
 * Both groups are saved in a single shot via `saveServiceOverrides` so the
 * admin doesn't have to click save twice for the same logical concern. The
 * global ui_strings labels still live under Settings → UI strings and keep
 * working as defaults site-wide.
 */

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, Upload, Image as ImageIcon, X as XIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { MiniTabs } from "./locale-inputs";
import type { LocaleKey } from "./translation-tabs";
import { useUnsavedTracker } from "./unsaved-changes";
import PhotoPositionEditor from "./photo-position-editor";
import MediaPicker from "./media-picker";
import {
  saveServiceOverrides,
  uploadServiceImage,
  type LocaleString,
  type ServiceBlockHeadingsInput,
  type ServiceFinalCtaInput,
} from "../_actions/services";

interface BlockSpec {
  key: keyof ServiceBlockHeadingsInput;
  label: string;
  /** Current global default (from ui_strings) — shown as placeholder so the
   *  admin can see what text would render if they leave the field blank. */
  globalDefault?: string;
}

interface Props {
  serviceId: string;
  serviceLabel: string;
  blocks: BlockSpec[];
  initialHeadings: ServiceBlockHeadingsInput;
  initialFinalCta: ServiceFinalCtaInput;
}

/** Curated set of tokens the admin can pick for the Final CTA background.
 *  Kept short on purpose — offering every variable from globals.css would be
 *  overwhelming; these are the palette anchors we actually want to use. */
const COLOR_TOKENS: { name: string; label: string; swatch: string }[] = [
  { name: "color-main", label: "Taupe (default)", swatch: "#8B7B6B" },
  { name: "color-main-dark", label: "Dark taupe", swatch: "#6B5E51" },
  { name: "color-main-darker", label: "Darker taupe", swatch: "#5A4D42" },
  { name: "color-ink", label: "Ink", swatch: "#2A2520" },
  { name: "color-black", label: "Black", swatch: "#2D2D2D" },
  { name: "color-ice-dark", label: "Rosegold", swatch: "#A3B5BD" },
  { name: "color-ice-darker", label: "Deep rosegold", swatch: "#88A0AA" },
  { name: "color-champagne-dark", label: "Champagne dark", swatch: "#F0EDE7" },
  { name: "color-champagne-darker", label: "Champagne darker", swatch: "#E5E0D8" },
];

function emptyLocale(): LocaleString {
  return { uk: "", ru: "", en: "" };
}

/** Merge the initial (possibly partial) overrides into a fully-populated
 *  {uk, ru, en} map so controlled inputs don't complain. */
function hydrateHeadings(raw: ServiceBlockHeadingsInput): Record<string, LocaleString> {
  const out: Record<string, LocaleString> = {};
  for (const k of ["faq", "doctors", "equipment", "relatedServices", "finalCTA"] as const) {
    const src = raw[k] || {};
    out[k] = { uk: src.uk || "", ru: src.ru || "", en: src.en || "" };
  }
  return out;
}

type LocalCta = {
  bgType: "default" | "color" | "image";
  bgColor: string;
  bgImage: string | null;
  bgFocalPoint: string;
};

function hydrateCta(raw: ServiceFinalCtaInput): LocalCta {
  const bgType: LocalCta["bgType"] =
    raw.bgType === "color" ? "color" : raw.bgType === "image" ? "image" : "default";
  return {
    bgType,
    bgColor: raw.bgColor || COLOR_TOKENS[0].name,
    bgImage: raw.bgImage || null,
    bgFocalPoint: raw.bgFocalPoint || "50% 50%",
  };
}

export default function ServiceOverridesEditor({
  serviceId, serviceLabel, blocks, initialHeadings, initialFinalCta,
}: Props) {
  const [headings, setHeadings] = useState<Record<string, LocaleString>>(() => hydrateHeadings(initialHeadings));
  const [cta, setCta] = useState<LocalCta>(() => hydrateCta(initialFinalCta));
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("uk");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseline = useMemo(
    () => JSON.stringify({
      headings: hydrateHeadings(initialHeadings),
      cta: hydrateCta(initialFinalCta),
    }),
    [initialHeadings, initialFinalCta],
  );
  const current = JSON.stringify({ headings, cta });
  const dirty = current !== baseline;

  const updateHeading = (blockKey: string, locale: LocaleKey, value: string) => {
    setHeadings((prev) => ({ ...prev, [blockKey]: { ...prev[blockKey], [locale]: value } }));
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadServiceImage(fd);
      setCta((prev) => ({ ...prev, bgImage: url }));
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => setCta((prev) => ({ ...prev, bgImage: null }));

  const buildPayload = () => {
    const payloadHeadings: ServiceBlockHeadingsInput = {};
    for (const b of blocks) {
      const v = headings[b.key];
      if (v && (v.uk?.trim() || v.ru?.trim() || v.en?.trim())) payloadHeadings[b.key] = v;
    }
    const payloadCta: ServiceFinalCtaInput = {
      bgType: cta.bgType === "default" ? null : cta.bgType,
      bgColor: cta.bgType === "color" ? cta.bgColor : null,
      bgImage: cta.bgType === "image" ? cta.bgImage : null,
      bgFocalPoint: cta.bgType === "image" ? cta.bgFocalPoint : null,
    };
    return { payloadHeadings, payloadCta };
  };

  const doSave = async () => {
    const { payloadHeadings, payloadCta } = buildPayload();
    await saveServiceOverrides(serviceId, payloadHeadings, payloadCta);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const save = () => { startTransition(() => { void doSave(); }); };
  const cancel = () => {
    setHeadings(hydrateHeadings(initialHeadings));
    setCta(hydrateCta(initialFinalCta));
  };

  useUnsavedTracker({
    id: `service-overrides:${serviceId}`,
    label: `Overrides · ${serviceLabel}`,
    dirty,
    save: doSave,
    discard: cancel,
  });

  const activeColorToken = COLOR_TOKENS.find((c) => c.name === cta.bgColor) || COLOR_TOKENS[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-base text-ink mb-1">Per-service overrides</h3>
          <p className="body-s text-muted max-w-2xl">
            Customize the headings for each reorderable block and the Final CTA&apos;s background on
            this specific service page. Leave headings blank to use the global <em>ui_strings</em> defaults.
          </p>
        </div>
        <MiniTabs active={activeLocale} onChange={setActiveLocale} />
      </div>

      {/* ── Heading overrides ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-ink">Block headings</h4>
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{activeLocale}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blocks.map((b) => (
            <div key={b.key} className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">{b.label}</label>
              <input
                type="text"
                value={headings[b.key]?.[activeLocale] || ""}
                onChange={(e) => updateHeading(b.key, activeLocale, e.target.value)}
                placeholder={b.globalDefault || "Use global default"}
                className="w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main"
              />
              {b.globalDefault && (
                <p className="text-[10px] text-muted">Global default: <span className="font-mono">{b.globalDefault}</span></p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line" />

      {/* ── Final CTA background ── */}
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-medium text-ink mb-1">Final CTA background</h4>
          <p className="body-s text-muted">
            Choose how the closing call-to-action card looks on this page. The heading text
            above also applies (under <strong>Final CTA</strong>).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "default", label: "Default taupe" },
              { value: "color", label: "Color token" },
              { value: "image", label: "Image" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCta((prev) => ({ ...prev, bgType: opt.value }))}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                cta.bgType === opt.value
                  ? "bg-main text-champagne border-main"
                  : "bg-white border-line text-ink hover:border-main/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {cta.bgType === "color" && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_TOKENS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCta((prev) => ({ ...prev, bgColor: c.name }))}
                  title={`${c.label} (${c.name})`}
                  className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    cta.bgColor === c.name ? "border-main ring-2 ring-main/30" : "border-line hover:border-main/40"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-md border border-black/10 shrink-0"
                    style={{ background: c.swatch }}
                  />
                  <span className="text-ink">{c.label}</span>
                </button>
              ))}
            </div>
            {/* Live preview */}
            <div
              className="mt-1 rounded-xl p-6 text-center"
              style={{ backgroundColor: `var(--${activeColorToken.name})` }}
            >
              <p className="heading-3 text-champagne">
                {headings.finalCTA?.[activeLocale] || "Ready to book your consultation?"}
              </p>
            </div>
          </div>
        )}

        {cta.bgType === "image" && (
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Background image</label>
            <div className="flex items-start gap-4">
              <div
                className="relative aspect-[16/9] w-64 rounded-xl overflow-hidden border border-line bg-champagne-dark cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {cta.bgImage ? (
                  <>
                    <Image
                      src={cta.bgImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="256px"
                      style={{ objectPosition: cta.bgFocalPoint }}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearImage(); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      title="Remove image"
                    >
                      <XIcon size={14} />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
                    <Upload size={20} />
                    <span className="text-xs">{uploading ? "Uploading..." : "Upload"}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-main hover:text-main-dark transition-colors cursor-pointer self-start"
                >
                  <ImageIcon size={12} /> Pick from library
                </button>
                {cta.bgImage && (
                  <PhotoPositionEditor
                    name="cta_focal_point_unused"
                    label="Focal point"
                    photoUrl={cta.bgImage}
                    defaultValue={cta.bgFocalPoint}
                    aspect="wide"
                    onPositionChange={(pos) => setCta((prev) => ({ ...prev, bgFocalPoint: pos }))}
                  />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* ── Save bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1" />
        {dirty && !savedAt && <span className="text-xs text-warning">Unsaved changes</span>}
        {savedAt && <span className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={14} /> Saved</span>}
        <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty} title="Revert to last-saved overrides">
          Cancel changes
        </Button>
        <Button variant="primary" size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? "Saving..." : "Save overrides"}
        </Button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(url) => setCta((prev) => ({ ...prev, bgImage: url }))}
        preferredFolder="services"
      />
    </div>
  );
}
