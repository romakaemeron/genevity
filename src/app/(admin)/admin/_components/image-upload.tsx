"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import MediaPicker from "./media-picker";

interface Props {
  name: string;
  label: string;
  currentUrl?: string | null;
  aspect?: string;
  /** Called with the new object-URL / picked URL (or null on clear) so siblings can live-preview. */
  onUrlChange?: (url: string | null) => void;
  /** CSS object-position (e.g. "50% 30%") — lets the thumbnail mirror a paired PhotoPositionEditor's live crop. */
  objectPosition?: string;
  /** Client-side max longest side in pixels before submit. Downsamples huge originals via canvas. Default 2400. */
  clientMaxDim?: number;
  /** Folder to preselect in the library picker (e.g. "services", "doctors") */
  pickerFolder?: string;
}

/**
 * Pre-shrink a file in the browser via canvas if its longest side exceeds `maxDim`.
 * Keeps aspect ratio, uses bitmap/canvas for speed. Returns a File (jpeg q=92) under the cap,
 * or the original file if it's already small enough or non-image.
 */
async function shrinkIfNeeded(file: File, maxDim: number): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const longest = Math.max(width, height);
    if (longest <= maxDim) {
      bitmap.close?.();
      return file;
    }
    const scale = maxDim / longest;
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export default function ImageUpload({
  name, label, currentUrl, aspect = "aspect-[3/4]", onUrlChange, objectPosition, clientMaxDim = 2400, pickerFolder,
}: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  // When the admin picks from the library, we round-trip the URL through the
  // form's `${name}_current` hidden input — the server treats this as "no new
  // file, keep current URL". Tracked separately from `preview` (which may be
  // a blob: URL for pending uploads).
  const [libraryUrl, setLibraryUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setProcessing(true);
    try {
      const file = await shrinkIfNeeded(picked, clientMaxDim);
      if (inputRef.current && file !== picked) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      setLibraryUrl(null); // new file upload wins over any library selection
      onUrlChange?.(url);
    } finally {
      setProcessing(false);
    }
  };

  /**
   * SaveBar / FormDirtyTracker observe the form via native input/change events.
   * React programmatically updating a hidden input's `value` prop does NOT
   * fire those events, so after library-pick / clear we manually dispatch one
   * on the enclosing form so dirty-detection picks up the change. Timeout 0
   * lets React commit the new DOM value first.
   */
  const notifyFormDirty = () => {
    setTimeout(() => {
      inputRef.current?.form?.dispatchEvent(new Event("input", { bubbles: true }));
    }, 0);
  };

  const handlePickFromLibrary = (url: string) => {
    // Library URL is a real URL — round-trip through `_current` and clear any
    // pending file upload so the server uses the library URL directly.
    setPreview(url);
    setLibraryUrl(url);
    if (inputRef.current) inputRef.current.value = "";
    onUrlChange?.(url);
    notifyFormDirty();
  };

  const handleClear = () => {
    setPreview(null);
    setLibraryUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onUrlChange?.(null);
    notifyFormDirty();
  };

  // Source of truth for the hidden `_current` input:
  //   - if admin picked a library asset → that URL
  //   - else if the prop URL is still the preview → prop value
  //   - else empty (admin cleared the slot)
  const currentValue =
    libraryUrl ||
    (preview === currentUrl ? currentUrl : "") ||
    "";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
      <div
        className={`relative ${aspect} w-full max-w-[200px] rounded-xl overflow-hidden border-2 border-dashed border-line hover:border-main/40 transition-colors cursor-pointer bg-champagne-dark`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt={label}
              fill
              className="object-cover"
              sizes="200px"
              style={objectPosition ? { objectPosition } : undefined}
              unoptimized={preview.startsWith("blob:") || preview.endsWith(".svg")}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
            <Upload size={20} />
            <span className="text-xs">{processing ? "Processing..." : "Upload"}</span>
          </div>
        )}
        {processing && preview && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs">
            Processing...
          </div>
        )}
      </div>

      {/* Picker affordance — opens the shared media library modal */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-main hover:text-main-dark transition-colors cursor-pointer self-start"
      >
        <ImageIcon size={12} />
        Pick from library
      </button>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      {/* Hidden field to preserve current URL when no new file is uploaded. When
          the admin picked from the library, `currentValue` is that library URL
          so the server-side save treats it as "keep current" and skips upload. */}
      <input type="hidden" name={`${name}_current`} value={currentValue} />

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(url) => handlePickFromLibrary(url)}
        preferredFolder={pickerFolder}
      />
    </div>
  );
}
