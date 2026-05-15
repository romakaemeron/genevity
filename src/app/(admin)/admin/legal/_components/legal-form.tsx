"use client";

import { useActionState, useRef } from "react";
import { saveLegalDoc, deleteLegalDoc } from "../../_actions/legal";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import SaveBar from "../../_components/save-bar";
import { FormDirtyTracker } from "../../_components/unsaved-changes";
import Button from "@/components/ui/Button";

export default function LegalForm({ doc }: { doc?: any }) {
  const [state, formAction] = useActionState(saveLegalDoc, null as any);
  const isNew = !doc;
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <form action={formAction} ref={formRef}>
      <FormDirtyTracker
        id={doc ? `legal:${doc.slug}` : "legal:new"}
        label={`Legal doc · ${doc?.title_uk || doc?.slug || "new"}`}
        formRef={formRef}
        onSave={() => formRef.current?.requestSubmit()}
      />
      {doc && <input type="hidden" name="id" value={doc.id} />}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-2 text-ink">{isNew ? "New Legal Document" : doc.title_uk || doc.slug}</h1>
            {!isNew && <p className="body-m text-muted mt-1">/legal/{doc.slug}</p>}
          </div>
          {!isNew && (
            <Button
              variant="destructive-ghost"
              size="xs"
              onClick={() => { if (confirm("Delete this legal document?")) deleteLegalDoc(doc.id); }}
            >
              Delete
            </Button>
          )}
        </div>

        {state?.error && <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}
        {state?.success && <div className="mb-6 p-4 bg-success-light text-success rounded-xl text-sm">Saved!</div>}

        <div className="grid grid-cols-2 gap-4 mb-6 max-w-2xl">
          <FormField label="Slug" name="slug" defaultValue={doc?.slug || ""} placeholder="privacy-policy" required />
          <FormField label="Sort Order" name="sort_order" type="number" defaultValue={doc?.sort_order ?? 0} />
        </div>

        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-5" key={locale}>
              <FormField
                label="Title (full)"
                name={`title_${locale}`}
                defaultValue={doc?.[`title_${locale}`] || ""}
                placeholder="Privacy Policy"
                required={locale === "uk"}
              />
              <FormField
                label="Short label (for footer links)"
                name={`short_label_${locale}`}
                defaultValue={doc?.[`short_label_${locale}`] || ""}
                placeholder="Privacy"
                hint="Shown in the footer link list. Defaults to title if empty."
              />
              <FormField
                label="Body (full legal text — markdown or plain)"
                name={`body_${locale}`}
                type="textarea"
                rows={20}
                defaultValue={doc?.[`body_${locale}`] || ""}
              />
            </div>
          )}
        </TranslationTabs>
      </div>
      <SaveBar label={isNew ? "Create Legal Document" : "Save Changes"} />
    </form>
  );
}
