"use client";

import { useActionState, useState, useRef } from "react";
import { saveEquipment, deleteEquipment } from "../../_actions/equipment";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { FormDirtyTracker } from "../../_components/unsaved-changes";
import Button from "@/components/ui/Button";

interface Equipment {
  id: string;
  name: string;
  category: string;
  short_description_uk: string; short_description_ru: string; short_description_en: string;
  description_uk: string; description_ru: string; description_en: string;
  suits_uk: string[]; suits_ru: string[]; suits_en: string[];
  results_uk: string[]; results_ru: string[]; results_en: string[];
  note_uk: string; note_ru: string; note_en: string;
  photo: string | null;
  sort_order: number;
}

const categories = [
  { value: "face", label: "Face" },
  { value: "body", label: "Body" },
  { value: "skin", label: "Skin" },
  { value: "intimate", label: "Intimate" },
  { value: "laser", label: "Laser" },
];

export default function EquipmentForm({ equipment: eq }: { equipment?: Equipment }) {
  const [state, formAction] = useActionState(saveEquipment, null as any);
  const isNew = !eq;
  const [photoUrl, setPhotoUrl] = useState<string | null>(eq?.photo ?? null);
  const [modalOpen, setModalOpen] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const controlledDirty = photoUrl !== (eq?.photo ?? null);

  return (
    <form action={formAction} ref={formRef}>
      <FormDirtyTracker
        id={eq ? `equipment:${eq.id}` : "equipment:new"}
        label={`Equipment · ${eq?.name || "new"}`}
        formRef={formRef}
        externalDirty={controlledDirty}
        onSave={() => formRef.current?.requestSubmit()}
      />
      {eq && <input type="hidden" name="id" value={eq.id} />}

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-2 text-ink">{isNew ? "New Equipment" : eq.name}</h1>
          {!isNew && (
            <Button variant="destructive-ghost" size="xs" onClick={() => { if (confirm("Delete?")) deleteEquipment(eq.id); }}>
              Delete
            </Button>
          )}
        </div>

        {state?.error && <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}

        {/* ── Photo + Name + Category ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 mb-10">
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-champagne-dark">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base text-ink">Device photo</h3>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-xs text-main hover:text-main-dark inline-flex items-center gap-1 cursor-pointer"
                  title="Show full image"
                >
                  <Maximize2 size={12} /> Full size
                </button>
              )}
            </div>

            {/* Large preview */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-champagne-darker">
              {photoUrl ? (
                <Image src={photoUrl} alt={eq?.name || ""} fill className="object-cover" sizes="400px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">No photo yet</div>
              )}
            </div>

            <ImageUpload name="photo" label="Upload / replace" currentUrl={photoUrl} onUrlChange={setPhotoUrl} aspect="aspect-square" />
          </div>

          <div className="flex flex-col gap-4">
            <FormField label="Device Name" name="name" defaultValue={eq?.name} placeholder="EMFACE" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">Category</label>
              <select name="category" defaultValue={eq?.category || "face"} className="px-4 py-2.5 rounded-xl bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <FormField label="Sort Order" name="sort_order" type="number" defaultValue={eq?.sort_order ?? 0} />
          </div>
        </div>

        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-5" key={locale}>
              <FormField label="Short Description" name={`short_description_${locale}`} type="textarea" rows={2} defaultValue={(eq as any)?.[`short_description_${locale}`] || ""} />
              <FormField label="Full Description" name={`description_${locale}`} type="textarea" rows={4} defaultValue={(eq as any)?.[`description_${locale}`] || ""} />
              <FormField label="Suits (one per line)" name={`suits_${locale}`} type="textarea" rows={4} defaultValue={((eq as any)?.[`suits_${locale}`] || []).join("\n")} hint="One indication per line" />
              <FormField label="Results (one per line)" name={`results_${locale}`} type="textarea" rows={4} defaultValue={((eq as any)?.[`results_${locale}`] || []).join("\n")} hint="One result per line" />
              <FormField label="Note" name={`note_${locale}`} defaultValue={(eq as any)?.[`note_${locale}`] || ""} />
            </div>
          )}
        </TranslationTabs>
      </div>

      <SaveBar label={isNew ? "Create Equipment" : "Save Changes"} />

      {modalOpen && photoUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6" onClick={() => setModalOpen(false)}>
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-champagne-dark/10 hover:bg-champagne-dark/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt={eq?.name || ""} className="w-full h-auto max-h-[90vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </form>
  );
}
