"use client";

import { useActionState, useRef } from "react";
import { savePricelistPdf } from "../../_actions/settings";
import PdfUpload from "../../_components/pdf-upload";
import SaveBar from "../../_components/save-bar";
import { FormDirtyTracker } from "../../_components/unsaved-changes";

export default function PricelistPdfForm({ currentUrl }: { currentUrl: string | null }) {
  const [state, formAction] = useActionState(savePricelistPdf, null as any);
  const formRef = useRef<HTMLFormElement | null>(null);

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
      <div className="flex flex-col gap-2">
        <p className="body-s text-muted">
          PDF-файл із повним прайс-листом. З'явиться кнопка завантаження на сторінці /prices.
        </p>
        <PdfUpload name="pricelist_pdf" currentUrl={currentUrl} />
      </div>
      <SaveBar />
    </form>
  );
}
