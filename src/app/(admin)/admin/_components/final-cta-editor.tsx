"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronRight, Trash2, Upload, Image as ImageIcon, X as XIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { LocaleText, SectionLocaleProvider } from "./locale-inputs";
import type { LocaleString } from "./locale-inputs";
import { useUnsavedTracker } from "./unsaved-changes";
import PhotoPositionEditor from "./photo-position-editor";
import MediaPicker from "./media-picker";
import {
  saveFinalCtaData,
  uploadServiceImage,
  type ServiceFinalCtaInput,
} from "../_actions/services";

const COLOR_TOKENS = [
  { name: "color-main",         label: "Taupe (default)", swatch: "#8B7B6B" },
  { name: "color-main-dark",    label: "Dark taupe",      swatch: "#6B5E51" },
  { name: "color-main-darker",  label: "Darker taupe",    swatch: "#5A4D42" },
  { name: "color-ink",          label: "Ink",             swatch: "#2A2520" },
  { name: "color-black",        label: "Black",           swatch: "#2D2D2D" },
  { name: "color-ice-dark",     label: "Rosegold",        swatch: "#A3B5BD" },
  { name: "color-ice-darker",   label: "Deep rosegold",   swatch: "#88A0AA" },
  { name: "color-champagne-dark",   label: "Champagne dark",   swatch: "#F0EDE7" },
  { name: "color-champagne-darker", label: "Champagne darker", swatch: "#E5E0D8" },
];

type LocalCta = {
  bgType: "default" | "color" | "image";
  bgColor: string;
  bgImage: string | null;
  bgFocalPoint: string;
  heading: LocaleString;
  subtitle: LocaleString;
  buttonText: LocaleString;
};

function emptyLocale(): LocaleString { return { uk: "", ru: "", en: "" }; }

function hydrate(raw: ServiceFinalCtaInput): LocalCta {
  return {
    bgType: raw.bgType === "color" ? "color" : raw.bgType === "image" ? "image" : "default",
    bgColor: raw.bgColor || COLOR_TOKENS[0].name,
    bgImage: raw.bgImage || null,
    bgFocalPoint: raw.bgFocalPoint || "50% 50%",
    heading:    { uk: raw.heading?.uk    || "", ru: raw.heading?.ru    || "", en: raw.heading?.en    || "" },
    subtitle:   { uk: raw.subtitle?.uk   || "", ru: raw.subtitle?.ru   || "", en: raw.subtitle?.en   || "" },
    buttonText: { uk: raw.buttonText?.uk || "", ru: raw.buttonText?.ru || "", en: raw.buttonText?.en || "" },
  };
}

interface Props {
  serviceId: string;
  serviceLabel: string;
  initial: ServiceFinalCtaInput;
  onDelete?: () => void;
}

export default function FinalCtaEditor({ serviceId, serviceLabel, initial, onDelete }: Props) {
  const [cta, setCta] = useState<LocalCta>(() => hydrate(initial));
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseline = useMemo(() => JSON.stringify(hydrate(initial)), [initial]);
  const dirty = JSON.stringify(cta) !== baseline;

  const set = (patch: Partial<LocalCta>) => setCta((p) => ({ ...p, ...patch }));

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadServiceImage(fd);
      set({ bgImage: url });
    } finally { setUploading(false); }
  };

  const buildPayload = (): ServiceFinalCtaInput => ({
    bgType: cta.bgType === "default" ? null : cta.bgType,
    bgColor: cta.bgType === "color" ? cta.bgColor : null,
    bgImage: cta.bgType === "image" ? cta.bgImage : null,
    bgFocalPoint: cta.bgType === "image" ? cta.bgFocalPoint : null,
    heading: cta.heading,
    subtitle: cta.subtitle,
    buttonText: cta.buttonText,
  });

  const doSave = async () => {
    await saveFinalCtaData(serviceId, buildPayload());
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const save = () => { startTransition(async () => { await doSave(); }); };
  const cancel = () => setCta(hydrate(initial));

  useUnsavedTracker({
    id: `finalCta:${serviceId}`,
    label: `Final CTA · ${serviceLabel}`,
    dirty,
    save: doSave,
    discard: cancel,
  });

  const activeToken = COLOR_TOKENS.find((c) => c.name === cta.bgColor) || COLOR_TOKENS[0];

  return (
    <div className="rounded-xl border border-line bg-champagne-dark overflow-hidden">
      {/* Header — same pattern as section cards in SectionBuilder */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-champagne/40 border-b border-line">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center gap-2 text-left text-sm font-medium text-ink hover:text-main transition-colors cursor-pointer"
        >
          {expanded ? <ChevronDown size={14} className="text-muted shrink-0" /> : <ChevronRight size={14} className="text-muted shrink-0" />}
          Final booking CTA
          {dirty && <span className="ml-2 text-[10px] font-semibold text-warning uppercase tracking-wider">unsaved</span>}
        </button>
        {savedAt && (
          <span className="inline-flex items-center gap-1 text-xs text-success">
            <Check size={12} /> Saved
          </span>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-muted hover:text-error transition-colors cursor-pointer"
            title="Remove Final CTA"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {expanded && (
        <SectionLocaleProvider>
          <div className="p-5 flex flex-col gap-5">
            {/* Text overrides */}
            <LocaleText
              label="Heading (leave blank for global default)"
              value={cta.heading}
              onChange={(v) => set({ heading: v })}
              placeholder="e.g. Ready to book your consultation?"
            />
            <LocaleText
              label="Subtitle (leave blank for global default)"
              value={cta.subtitle}
              onChange={(v) => set({ subtitle: v })}
              multiline
              rows={2}
              placeholder="Supporting text below the heading"
            />
            <LocaleText
              label="Button text (leave blank for global default)"
              value={cta.buttonText}
              onChange={(v) => set({ buttonText: v })}
              placeholder="e.g. Book a consultation"
            />

            <div className="border-t border-line" />

            {/* Background */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Background</label>
              <div className="flex flex-wrap gap-2">
                {(["default", "color", "image"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set({ bgType: opt })}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      cta.bgType === opt
                        ? "bg-main text-champagne border-main"
                        : "bg-champagne-darker border-line text-ink hover:border-main/40"
                    }`}
                  >
                    {opt === "default" ? "Default taupe" : opt === "color" ? "Color token" : "Image"}
                  </button>
                ))}
              </div>

              {cta.bgType === "color" && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {COLOR_TOKENS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => set({ bgColor: c.name })}
                        title={c.label}
                        className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                          cta.bgColor === c.name ? "border-main ring-2 ring-main/30" : "border-line hover:border-main/40"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md border border-black/10 shrink-0" style={{ background: c.swatch }} />
                        <span className="text-ink">{c.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 rounded-xl p-6 text-center" style={{ backgroundColor: `var(--${activeToken.name})` }}>
                    <p className="heading-3 text-champagne">{cta.heading.uk || "Ready to book your consultation?"}</p>
                  </div>
                </div>
              )}

              {cta.bgType === "image" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-4">
                    <div
                      className="relative aspect-[16/9] w-64 rounded-xl overflow-hidden border border-line bg-champagne-dark cursor-pointer shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {cta.bgImage ? (
                        <>
                          <Image src={cta.bgImage} alt="" fill className="object-cover" sizes="256px" style={{ objectPosition: cta.bgFocalPoint }} />
                          <div className="absolute inset-0 bg-black/30" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); set({ bgImage: null }); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                          >
                            <XIcon size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
                          <Upload size={20} />
                          <span className="text-xs">{uploading ? "Uploading…" : "Upload"}</span>
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
                          name="cta_focal_unused"
                          label="Focal point"
                          photoUrl={cta.bgImage}
                          defaultValue={cta.bgFocalPoint}
                          aspect="wide"
                          onPositionChange={(pos) => set({ bgFocalPoint: pos })}
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

            {/* Save bar */}
            <div className="flex items-center gap-3 pt-1 border-t border-line">
              <div className="flex-1" />
              <Button variant="neutral" size="sm" onClick={cancel} disabled={pending || !dirty}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={save} disabled={pending || !dirty}>
                {pending ? "Saving…" : "Save CTA"}
              </Button>
            </div>
          </div>
        </SectionLocaleProvider>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(url) => set({ bgImage: url })}
        preferredFolder="services"
      />
    </div>
  );
}
