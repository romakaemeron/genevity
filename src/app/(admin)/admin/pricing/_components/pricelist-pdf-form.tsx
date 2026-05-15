"use client";

import { useActionState, useRef, useState } from "react";
import { savePricelistPdf } from "../../_actions/settings";
import SaveBar from "../../_components/save-bar";
import { FormDirtyTracker } from "../../_components/unsaved-changes";
import { Upload, FileText, X } from "lucide-react";

export default function PricelistPdfForm({ currentUrl }: { currentUrl: string | null }) {
  const [state, formAction] = useActionState(savePricelistPdf, null as any);
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [customUrl, setCustomUrl] = useState(currentUrl || "");
  const [pendingFile, setPendingFile] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPendingFile(file?.name ?? null);
  };

  const clearFile = () => {
    if (fileRef.current) fileRef.current.value = "";
    setPendingFile(null);
  };

  return (
    <form action={formAction} ref={formRef}>
      <FormDirtyTracker
        id="pricelist-pdf"
        label="Pricelist PDF"
        formRef={formRef}
        onSave={() => formRef.current?.requestSubmit()}
      />
      {state?.success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          Збережено!
        </div>
      )}

      <div className="flex flex-col gap-4">
        <p className="body-s text-muted">
          PDF-файл із повним прайс-листом. З'явиться кнопка на сторінці /prices.
        </p>

        {/* Manual URL input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Посилання на PDF
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              name="pricelist_pdf_current"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-champagne-dark body-m text-black placeholder:text-muted focus:outline-none focus:border-main transition-colors"
            />
            {customUrl && (
              <button
                type="button"
                onClick={() => setCustomUrl("")}
                className="w-9 h-9 rounded-xl border border-line bg-champagne-dark flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="flex-1 border-t border-line" />
          або завантажте файл (замінить посилання)
          <div className="flex-1 border-t border-line" />
        </div>

        {/* File upload */}
        <div>
          <input
            ref={fileRef}
            type="file"
            name="pricelist_pdf"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {pendingFile ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-line bg-champagne-dark">
              <FileText size={16} className="text-main shrink-0" />
              <span className="text-sm text-ink flex-1 truncate">{pendingFile}</span>
              <button
                type="button"
                onClick={clearFile}
                className="text-xs text-muted hover:text-ink transition-colors cursor-pointer shrink-0"
              >
                Скасувати
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-line hover:border-main/40 bg-champagne-dark text-muted hover:text-ink transition-colors cursor-pointer text-sm w-full"
            >
              <Upload size={16} />
              Завантажити PDF файл
            </button>
          )}
        </div>
      </div>

      <SaveBar />
    </form>
  );
}
