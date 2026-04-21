"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface Props {
  name: string;
  label: string;
  currentUrl?: string | null;
  aspect?: string;
}

export default function ImageUpload({ name, label, currentUrl, aspect = "aspect-[3/4]" }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
      <div
        className={`relative ${aspect} w-full max-w-[200px] rounded-xl overflow-hidden border-2 border-dashed border-line hover:border-main/40 transition-colors cursor-pointer bg-champagne-dark`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" sizes="200px" />
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
            <span className="text-xs">Upload</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      {/* Hidden field to preserve current URL if no new file uploaded */}
      <input type="hidden" name={`${name}_current`} value={currentUrl || ""} />
    </div>
  );
}
