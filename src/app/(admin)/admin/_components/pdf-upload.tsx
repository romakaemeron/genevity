"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, ExternalLink } from "lucide-react";

interface Props {
  name: string;
  currentUrl?: string | null;
}

export default function PdfUpload({ name, currentUrl }: Props) {
  const [url, setUrl] = useState(currentUrl || null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const notifyDirty = () =>
    setTimeout(() => inputRef.current?.form?.dispatchEvent(new Event("input", { bubbles: true })), 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingName(file.name);
    setUrl(null);
    notifyDirty();
  };

  const handleClear = () => {
    setUrl(null);
    setPendingName(null);
    if (inputRef.current) inputRef.current.value = "";
    notifyDirty();
  };

  const displayName = url
    ? decodeURIComponent(url.split("/").pop() || url)
    : pendingName;

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" name={name} accept="application/pdf,.pdf" onChange={handleChange} className="hidden" />
      <input type="hidden" name={`${name}_current`} value={url || ""} />

      {displayName ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-line bg-champagne-dark">
          <FileText size={18} className="text-main shrink-0" />
          <div className="flex-1 min-w-0">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-main hover:underline flex items-center gap-1.5 truncate">
                {displayName}
                <ExternalLink size={11} className="shrink-0" />
              </a>
            ) : (
              <span className="text-sm text-ink truncate block">
                {displayName} <span className="text-muted text-xs">(буде збережено)</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="text-xs text-muted hover:text-ink transition-colors cursor-pointer">
              Замінити
            </button>
            <button type="button" onClick={handleClear}
              className="w-6 h-6 rounded-full hover:bg-line flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer">
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-line hover:border-main/40 bg-champagne-dark text-muted hover:text-ink transition-colors cursor-pointer text-sm w-full">
          <Upload size={16} />
          Завантажити PDF файл
        </button>
      )}
    </div>
  );
}
