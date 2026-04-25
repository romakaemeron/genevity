"use client";

import { useState, useRef, useContext } from "react";
import Image from "next/image";
import { Trash2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { LocaleText, LocaleStringList, MiniTabs, SectionLocaleContext, emptyLocaleString, emptyLocaleArray, type LocaleString, type LocaleArray } from "./locale-inputs";
import { uploadSectionImage } from "../_actions/sections";
import type { LocaleKey } from "./translation-tabs";
import MediaPicker from "./media-picker";
import PhotoPositionEditor from "./photo-position-editor";

/** Registry: each section type has a label, a default data factory, and an editor component */

export const SECTION_LABELS: Record<string, string> = {
  richText: "Rich Text",
  bullets: "Bullet List",
  steps: "Steps",
  compareTable: "Compare Table",
  indicationsContraindications: "Indications / Contraindications",
  priceTeaser: "Price Teaser",
  callout: "Callout",
  imageGallery: "Image Gallery",
  showcaseGallery: "Showcase Gallery",
  relatedDoctors: "Related Doctors",
  cta: "CTA Block",
};

export const SECTION_TYPES = Object.keys(SECTION_LABELS);

export function createDefaultData(type: string): any {
  switch (type) {
    case "richText":
      return { heading: emptyLocaleString(), body: emptyLocaleString(), calloutBody: emptyLocaleString(), heroImage: "", heroImageFocalPoint: "50% 50%" };
    case "bullets":
      return { heading: emptyLocaleString(), items: emptyLocaleArray() };
    case "steps":
      return { heading: emptyLocaleString(), steps: [] };
    case "compareTable":
      return { heading: emptyLocaleString(), columns: emptyLocaleArray(), rows: [] };
    case "indicationsContraindications":
      return {
        title: emptyLocaleString(),
        indicationsHeading: emptyLocaleString(),
        indications: emptyLocaleArray(),
        contraindicationsHeading: emptyLocaleString(),
        contraindications: emptyLocaleArray(),
      };
    case "priceTeaser":
      return { heading: emptyLocaleString(), intro: emptyLocaleString(), ctaLabel: emptyLocaleString() };
    case "callout":
      return { tone: "info", body: emptyLocaleString() };
    case "imageGallery":
      return { heading: emptyLocaleString(), images: [] };
    case "showcaseGallery":
      return { heading: emptyLocaleString(), subtitle: emptyLocaleString(), images: [] };
    case "relatedDoctors":
      return { heading: emptyLocaleString(), doctorIds: [] };
    case "cta":
      return { heading: emptyLocaleString(), body: emptyLocaleString(), ctaLabel: emptyLocaleString(), ctaHref: "" };
    default:
      return {};
  }
}

/* ── Individual editors ── */

interface EditorProps<T = any> {
  data: T;
  onChange: (next: T) => void;
  doctors?: { id: string; name_uk: string; role_uk: string | null }[];
}

export function SectionEditor({ type, data, onChange, doctors }: { type: string } & EditorProps) {
  switch (type) {
    case "richText": return <RichTextEditor data={data} onChange={onChange} />;
    case "bullets": return <BulletsEditor data={data} onChange={onChange} />;
    case "steps": return <StepsEditor data={data} onChange={onChange} />;
    case "compareTable": return <CompareTableEditor data={data} onChange={onChange} />;
    case "indicationsContraindications": return <IndicationsEditor data={data} onChange={onChange} />;
    case "priceTeaser": return <PriceTeaserEditor data={data} onChange={onChange} />;
    case "callout": return <CalloutEditor data={data} onChange={onChange} />;
    case "imageGallery": return <ImageGalleryEditor data={data} onChange={onChange} />;
    case "showcaseGallery": return <ShowcaseGalleryEditor data={data} onChange={onChange} />;
    case "relatedDoctors": return <RelatedDoctorsEditor data={data} onChange={onChange} doctors={doctors || []} />;
    case "cta": return <CtaEditor data={data} onChange={onChange} />;
    default: return <div className="text-sm text-muted">Unknown section type: {type}</div>;
  }
}

function RichTextEditor({
  data,
  onChange,
}: EditorProps<{
  heading: LocaleString;
  body: LocaleString;
  calloutBody?: LocaleString;
  heroImage?: string;
  heroImageFocalPoint?: string;
}>) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const { url } = await uploadSectionImage(fd);
      onChange({ ...data, heroImage: url });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <LocaleText
        label="Body"
        multiline
        rows={6}
        value={data.body}
        onChange={(v) => onChange({ ...data, body: v })}
        placeholder="Main paragraph under the heading"
      />
      <LocaleText
        label="Callout (optional)"
        multiline
        rows={4}
        value={data.calloutBody || emptyLocaleString()}
        onChange={(v) => onChange({ ...data, calloutBody: v })}
        placeholder="Shorter paragraph rendered inside a highlighted card next to the body"
      />

      {/* Hero image — only renders on the FIRST rich-text section of the page
          (the signature side-by-side hero layout). Leave empty for a normal
          single-column section. */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          Hero image (optional — rendered on the first rich-text section of the page)
        </label>
        {data.heroImage ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.heroImage} alt="" className="w-40 h-24 object-cover rounded-lg border border-line" style={{ objectPosition: data.heroImageFocalPoint || "50% 50%" }} />
              <button
                type="button"
                onClick={() => onChange({ ...data, heroImage: "", heroImageFocalPoint: "50% 50%" })}
                className="text-xs text-error hover:text-error/80 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
            <PhotoPositionEditor
              name="richtext_hero_focal_unused"
              label="Image focal point"
              photoUrl={data.heroImage}
              defaultValue={data.heroImageFocalPoint || "50% 50%"}
              aspect="wide"
              onPositionChange={(pos) => onChange({ ...data, heroImageFocalPoint: pos })}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-line bg-white text-sm text-muted hover:border-main/40 hover:text-ink cursor-pointer self-start transition-colors">
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload hero image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
            </label>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-main hover:text-main-dark transition-colors cursor-pointer"
            >
              <ImageIcon size={12} />
              Pick from library
            </button>
          </div>
        )}
        <p className="text-[11px] text-muted">
          When present, the section renders as a 2-column hero: heading + body + callout on one side, this image on the other.
        </p>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(url) => onChange({ ...data, heroImage: url })}
        preferredFolder="sections"
      />
    </div>
  );
}

function BulletsEditor({ data, onChange }: EditorProps<{ heading: LocaleString; items: LocaleArray }>) {
  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <LocaleStringList label="Bullet items" value={data.items} onChange={(v) => onChange({ ...data, items: v })} itemPlaceholder="Benefit or note (prefix with ⚠ for warnings)" />
    </div>
  );
}

function StepsEditor({ data, onChange }: EditorProps<{ heading: LocaleString; steps: { title: LocaleString; description: LocaleString }[] }>) {
  const addStep = () => onChange({ ...data, steps: [...data.steps, { title: emptyLocaleString(), description: emptyLocaleString() }] });
  const updateStep = (i: number, v: Partial<{ title: LocaleString; description: LocaleString }>) => {
    const next = [...data.steps];
    next[i] = { ...next[i], ...v };
    onChange({ ...data, steps: next });
  };
  const removeStep = (i: number) => onChange({ ...data, steps: data.steps.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <div className="flex flex-col gap-3">
        {data.steps.map((step, i) => (
          <div key={i} className="p-3 rounded-lg bg-champagne/50 border border-line flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Step {i + 1}</span>
              <button type="button" onClick={() => removeStep(i)} className="text-muted hover:text-error transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
            <LocaleText label="Title" value={step.title} onChange={(v) => updateStep(i, { title: v })} />
            <LocaleText label="Description" multiline rows={2} value={step.description} onChange={(v) => updateStep(i, { description: v })} />
          </div>
        ))}
        <button type="button" onClick={addStep} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-main hover:bg-main/10 transition-colors cursor-pointer self-start">
          <Plus size={12} /> Add step
        </button>
      </div>
    </div>
  );
}

function CompareTableEditor({ data, onChange }: EditorProps<{ heading: LocaleString; columns: LocaleArray; rows: { label: LocaleString; values: LocaleArray }[] }>) {
  const addRow = () => onChange({ ...data, rows: [...data.rows, { label: emptyLocaleString(), values: emptyLocaleArray() }] });
  const removeRow = (i: number) => onChange({ ...data, rows: data.rows.filter((_, idx) => idx !== i) });
  const updateRow = (i: number, v: Partial<{ label: LocaleString; values: LocaleArray }>) => {
    const next = [...data.rows];
    next[i] = { ...next[i], ...v };
    onChange({ ...data, rows: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <LocaleStringList label="Column headers" value={data.columns} onChange={(v) => onChange({ ...data, columns: v })} itemPlaceholder="Column name" />
      <div className="flex flex-col gap-3">
        {data.rows.map((row, i) => (
          <div key={i} className="p-3 rounded-lg bg-champagne/50 border border-line flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Row {i + 1}</span>
              <button type="button" onClick={() => removeRow(i)} className="text-muted hover:text-error transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
            <LocaleText label="Row label" value={row.label} onChange={(v) => updateRow(i, { label: v })} />
            <LocaleStringList label="Row values" value={row.values} onChange={(v) => updateRow(i, { values: v })} itemPlaceholder="Cell value" />
          </div>
        ))}
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-main hover:bg-main/10 transition-colors cursor-pointer self-start">
          <Plus size={12} /> Add row
        </button>
      </div>
    </div>
  );
}

function IndicationsEditor({ data, onChange }: EditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Section title (optional — leave blank to hide)" value={data.title ?? emptyLocaleString()} onChange={(v) => onChange({ ...data, title: v })} />
      <LocaleText label="Indications heading" value={data.indicationsHeading} onChange={(v) => onChange({ ...data, indicationsHeading: v })} />
      <LocaleStringList label="Indications" value={data.indications} onChange={(v) => onChange({ ...data, indications: v })} />
      <LocaleText label="Contraindications heading" value={data.contraindicationsHeading} onChange={(v) => onChange({ ...data, contraindicationsHeading: v })} />
      <LocaleStringList label="Contraindications" value={data.contraindications} onChange={(v) => onChange({ ...data, contraindications: v })} />
    </div>
  );
}

function PriceTeaserEditor({ data, onChange }: EditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <LocaleText label="Intro" multiline rows={2} value={data.intro} onChange={(v) => onChange({ ...data, intro: v })} />
      <LocaleText label="CTA label" value={data.ctaLabel} onChange={(v) => onChange({ ...data, ctaLabel: v })} />
    </div>
  );
}

function CalloutEditor({ data, onChange }: EditorProps<{ tone: string; body: LocaleString }>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Tone</label>
        <select
          value={data.tone}
          onChange={(e) => onChange({ ...data, tone: e.target.value })}
          className="px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main w-40"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
        </select>
      </div>
      <LocaleText label="Body" multiline rows={4} value={data.body} onChange={(v) => onChange({ ...data, body: v })} />
    </div>
  );
}

function ImageGalleryEditor({ data, onChange }: EditorProps<{ heading: LocaleString; images: { url: string; alt: LocaleString }[] }>) {
  const [uploading, setUploading] = useState(false);
  const [altActive, setAltActive] = useState<LocaleKey>("uk");

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const newImages: { url: string; alt: LocaleString }[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const { url } = await uploadSectionImage(fd);
        newImages.push({ url, alt: emptyLocaleString() });
      }
      onChange({ ...data, images: [...data.images, ...newImages] });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i: number) => onChange({ ...data, images: data.images.filter((_, idx) => idx !== i) });
  const updateAlt = (i: number, v: string) => {
    const next = [...data.images];
    next[i] = { ...next[i], alt: { ...next[i].alt, [altActive]: v } };
    onChange({ ...data, images: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Images ({data.images.length})</label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted">Alt:</span>
            <MiniTabs active={altActive} onChange={setAltActive} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {data.images.map((img, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-champagne-dark border border-line">
                <Image src={img.url} alt={img.alt?.[altActive] || ""} fill className="object-cover" sizes="200px" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <input
                value={img.alt?.[altActive] || ""}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="Alt text"
                className="w-full px-2 py-1 rounded-md bg-champagne-dark border border-line text-ink text-[11px] outline-none focus:border-main"
              />
            </div>
          ))}
          <label className={`aspect-[4/3] rounded-lg border-2 border-dashed border-line hover:border-main/40 transition-colors cursor-pointer bg-champagne-dark flex flex-col items-center justify-center gap-1 text-muted ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={16} />
            <span className="text-[10px]">{uploading ? "Uploading..." : "Upload"}</span>
            <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}

function RelatedDoctorsEditor({ data, onChange, doctors }: EditorProps<{ heading: LocaleString; doctorIds: string[] }> & { doctors: { id: string; name_uk: string; role_uk: string | null }[] }) {
  const toggle = (id: string) => {
    const next = data.doctorIds.includes(id)
      ? data.doctorIds.filter((d) => d !== id)
      : [...data.doctorIds, id];
    onChange({ ...data, doctorIds: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <div>
        <label className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2 block">
          Selected doctors ({data.doctorIds.length})
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {doctors.map((d) => {
            const selected = data.doctorIds.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggle(d.id)}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                  selected ? "bg-main/10 border-main text-ink" : "bg-champagne-dark border-line text-muted hover:border-main/40 hover:text-ink"
                }`}
              >
                <div className="font-medium">{d.name_uk}</div>
                {d.role_uk && <div className="text-[11px] opacity-70">{d.role_uk}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Inline focal-point thumbnail — drag anywhere on the image to reposition. */
function FocalThumb({
  url, focalPoint, onFocalChange, onRemove,
}: {
  url: string;
  focalPoint: string;
  onFocalChange: (pos: string) => void;
  onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsePct = (s: string): { x: number; y: number } => {
    const parts = s.split(" ");
    return { x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 50 };
  };
  const pos = parsePct(focalPoint);

  const calc = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    onFocalChange(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  };

  return (
    <div
      ref={ref}
      className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-champagne-dark border border-line select-none ${dragging ? "cursor-grabbing" : "cursor-crosshair"}`}
      onPointerDown={(e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); setDragging(true); calc(e); }}
      onPointerMove={(e) => { if (dragging) calc(e); }}
      onPointerUp={(e) => { (e.target as HTMLElement).releasePointerCapture(e.pointerId); setDragging(false); }}
      onPointerCancel={() => setDragging(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: focalPoint }} />
      {/* focal crosshair */}
      <div
        className="absolute w-6 h-6 rounded-full border-2 border-white pointer-events-none"
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", boxShadow: "0 0 0 1.5px rgba(0,0,0,0.35)" }}
      />
      {/* focal hint */}
      <div className="absolute bottom-1.5 left-1.5 text-[9px] text-white/80 bg-black/40 rounded px-1 py-0.5 pointer-events-none">
        drag to set focal
      </div>
      {/* delete */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors pointer-events-auto"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function ShowcaseGalleryEditor({ data, onChange }: EditorProps<{
  heading: LocaleString;
  subtitle?: LocaleString;
  images: { url: string; alt?: LocaleString; title?: LocaleString; subtitle?: LocaleString; focalPoint?: string; span?: "1" | "2" }[];
}>) {
  const [uploading, setUploading] = useState(false);
  const activeLocale = useContext(SectionLocaleContext);
  const [pickerOpen, setPickerOpen] = useState(false);

  const MAX_IMAGES = 7;

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const newImages: typeof data.images = [];
      const remaining = MAX_IMAGES - data.images.length;
      const toUpload = Array.from(files).slice(0, remaining);
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        const { url } = await uploadSectionImage(fd);
        newImages.push({ url, alt: emptyLocaleString(), title: emptyLocaleString(), subtitle: emptyLocaleString(), focalPoint: "50% 50%", span: "1" });
      }
      onChange({ ...data, images: [...data.images, ...newImages] });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i: number) => onChange({ ...data, images: data.images.filter((_, idx) => idx !== i) });

  const updateImage = (i: number, patch: Partial<(typeof data.images)[0]>) => {
    const next = [...data.images];
    next[i] = { ...next[i], ...patch };
    onChange({ ...data, images: next });
  };

  const handlePickMultiple = (urls: string[]) => {
    const newImages = urls.map((url) => ({ url, alt: emptyLocaleString(), title: emptyLocaleString(), subtitle: emptyLocaleString(), focalPoint: "50% 50%", span: "1" as const }));
    onChange({ ...data, images: [...data.images, ...newImages].slice(0, MAX_IMAGES) });
  };

  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <LocaleText label="Subtitle (optional)" value={data.subtitle || emptyLocaleString()} onChange={(v) => onChange({ ...data, subtitle: v })} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
            Images ({data.images.length}/{MAX_IMAGES})
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          {data.images.map((img, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-line bg-champagne/30">
              {/* Thumbnail with inline focal-point picker */}
              <FocalThumb
                url={img.url}
                focalPoint={img.focalPoint || "50% 50%"}
                onFocalChange={(pos) => updateImage(i, { focalPoint: pos })}
                onRemove={() => removeImage(i)}
              />
              <input
                value={img.title?.[activeLocale] || ""}
                onChange={(e) => updateImage(i, { title: { ...(img.title || emptyLocaleString()), [activeLocale]: e.target.value } })}
                placeholder="Caption title"
                className="w-full px-2 py-1 rounded-md bg-champagne-dark border border-line text-ink text-[11px] outline-none focus:border-main"
              />
              <input
                value={img.subtitle?.[activeLocale] || ""}
                onChange={(e) => updateImage(i, { subtitle: { ...(img.subtitle || emptyLocaleString()), [activeLocale]: e.target.value } })}
                placeholder="Caption description"
                className="w-full px-2 py-1 rounded-md bg-champagne-dark border border-line text-ink text-[11px] outline-none focus:border-main"
              />
              <input
                value={img.alt?.[activeLocale] || ""}
                onChange={(e) => updateImage(i, { alt: { ...(img.alt || emptyLocaleString()), [activeLocale]: e.target.value } })}
                placeholder="Alt text (for SEO)"
                className="w-full px-2 py-1 rounded-md bg-champagne-dark border border-line text-ink text-[11px] outline-none focus:border-main"
              />
            </div>
          ))}

          {data.images.length < MAX_IMAGES && (
            <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-line bg-champagne-dark flex flex-col items-center justify-center gap-2">
              <label className={`inline-flex flex-col items-center gap-1 cursor-pointer text-muted hover:text-ink transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload size={16} />
                <span className="text-[10px]">{uploading ? "Uploading…" : "Upload"}</span>
                <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] text-main hover:text-main-dark transition-colors cursor-pointer"
              >
                <ImageIcon size={11} /> Library
              </button>
            </div>
          )}
        </div>
        {data.images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-main hover:text-main-dark transition-colors cursor-pointer mt-1"
          >
            <ImageIcon size={12} /> Pick multiple from library
          </button>
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multi
        maxSelect={MAX_IMAGES - data.images.length}
        onPickMultiple={handlePickMultiple}
        preferredFolder="sections"
      />
    </div>
  );
}

function CtaEditor({ data, onChange }: EditorProps<{ heading: LocaleString; body: LocaleString; ctaLabel: LocaleString; ctaHref: string }>) {
  return (
    <div className="flex flex-col gap-4">
      <LocaleText label="Heading" value={data.heading} onChange={(v) => onChange({ ...data, heading: v })} />
      <LocaleText label="Body" multiline rows={2} value={data.body} onChange={(v) => onChange({ ...data, body: v })} />
      <LocaleText label="CTA label" value={data.ctaLabel} onChange={(v) => onChange({ ...data, ctaLabel: v })} />
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-muted uppercase tracking-wider">CTA link</label>
        <input
          value={data.ctaHref || ""}
          onChange={(e) => onChange({ ...data, ctaHref: e.target.value })}
          placeholder="/kontakty or #form"
          className="px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20"
        />
      </div>
    </div>
  );
}
