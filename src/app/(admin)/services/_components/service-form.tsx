"use client";

import { useActionState } from "react";
import { saveService, deleteService } from "../../_actions/services";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";

interface Props {
  service?: any;
  categories: { id: string; title_uk: string; slug: string }[];
}

export default function ServiceForm({ service: svc, categories }: Props) {
  const [state, formAction] = useActionState(saveService, null as any);
  const isNew = !svc;

  return (
    <form action={formAction}>
      {svc && <input type="hidden" name="id" value={svc.id} />}

      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-2 text-ink">{isNew ? "New Service" : svc.title_uk}</h1>
          {!isNew && (
            <button type="button" onClick={() => { if (confirm("Delete this service and all its sections?")) deleteService(svc.id); }} className="text-sm text-error hover:text-error/80 transition-colors cursor-pointer">
              Delete
            </button>
          )}
        </div>

        {state?.error && <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}

        {/* Meta fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <FormField label="Slug" name="slug" defaultValue={svc?.slug || ""} placeholder="botulinum-therapy" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Category *</label>
            <select name="category_id" defaultValue={svc?.category_id || ""} required className="px-4 py-2.5 rounded-xl bg-white border border-line text-ink text-sm outline-none focus:border-main">
              <option value="">Select...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.title_uk} ({c.slug})</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-32"><FormField label="Sort Order" name="sort_order" type="number" defaultValue={svc?.sort_order ?? 0} /></div>
          <ImageUpload name="hero_image" label="Hero Image" currentUrl={svc?.hero_image} aspect="aspect-video" />
        </div>

        {/* Trilingual content */}
        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-5" key={locale}>
              <FormField label="Title" name={`title_${locale}`} defaultValue={svc?.[`title_${locale}`] || ""} required={locale === "uk"} />
              <FormField label="H1 (if different from title)" name={`h1_${locale}`} defaultValue={svc?.[`h1_${locale}`] || ""} />
              <FormField label="Summary" name={`summary_${locale}`} type="textarea" rows={3} defaultValue={svc?.[`summary_${locale}`] || ""} />

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Duration" name={`procedure_length_${locale}`} defaultValue={svc?.[`procedure_length_${locale}`] || ""} placeholder="30 хв" />
                <FormField label="Effect" name={`effect_duration_${locale}`} defaultValue={svc?.[`effect_duration_${locale}`] || ""} placeholder="6 міс" />
                <FormField label="Sessions" name={`sessions_recommended_${locale}`} defaultValue={svc?.[`sessions_recommended_${locale}`] || ""} placeholder="3-5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Price From" name={`price_from_${locale}`} defaultValue={svc?.[`price_from_${locale}`] || ""} placeholder="від 4000 грн" />
                <FormField label="Price Unit" name={`price_unit_${locale}`} defaultValue={svc?.[`price_unit_${locale}`] || ""} placeholder="за зону" />
              </div>

              <div className="border-t border-line pt-5 mt-2">
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">SEO</p>
                <div className="flex flex-col gap-3">
                  <FormField label="SEO Title (≤60 chars)" name={`seo_title_${locale}`} defaultValue={svc?.[`seo_title_${locale}`] || ""} />
                  <FormField label="SEO Description (≤155 chars)" name={`seo_desc_${locale}`} type="textarea" rows={2} defaultValue={svc?.[`seo_desc_${locale}`] || ""} />
                </div>
              </div>
            </div>
          )}
        </TranslationTabs>
      </div>

      <SaveBar label={isNew ? "Create Service" : "Save Changes"} />
    </form>
  );
}
