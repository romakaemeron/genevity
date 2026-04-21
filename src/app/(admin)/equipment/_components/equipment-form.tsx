"use client";

import { useActionState } from "react";
import { saveEquipment, deleteEquipment } from "../../_actions/equipment";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";

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

  return (
    <form action={formAction}>
      {eq && <input type="hidden" name="id" value={eq.id} />}

      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-2 text-ink">{isNew ? "New Equipment" : eq.name}</h1>
          {!isNew && (
            <button type="button" onClick={() => { if (confirm("Delete?")) deleteEquipment(eq.id); }} className="text-sm text-error hover:text-error/80 transition-colors cursor-pointer">
              Delete
            </button>
          )}
        </div>

        {state?.error && <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}

        {/* Photo + Name + Category */}
        <div className="flex gap-6 mb-8">
          <ImageUpload name="photo" label="Photo" currentUrl={eq?.photo} aspect="aspect-square" />
          <div className="flex-1 flex flex-col gap-4">
            <FormField label="Device Name" name="name" defaultValue={eq?.name} placeholder="EMFACE" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">Category</label>
              <select name="category" defaultValue={eq?.category || "face"} className="px-4 py-2.5 rounded-xl bg-white border border-line text-ink text-sm outline-none focus:border-main">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <FormField label="Sort Order" name="sort_order" type="number" defaultValue={eq?.sort_order ?? 0} />
          </div>
        </div>

        {/* Trilingual fields */}
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
    </form>
  );
}
