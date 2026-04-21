"use client";

import { useActionState } from "react";
import { saveCategory } from "../../_actions/categories";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";

export default function CategoryForm({ category: cat }: { category: any }) {
  const [state, formAction] = useActionState(saveCategory, null as any);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={cat.id} />
      <div className="p-8 max-w-3xl">
        <h1 className="heading-2 text-ink mb-2">{cat.title_uk}</h1>
        <p className="body-m text-muted mb-8">/{cat.slug}</p>

        {state?.error && <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}
        {state?.success && <div className="mb-6 p-4 bg-success-light text-success rounded-xl text-sm">Saved!</div>}

        <div className="flex gap-4 mb-6">
          <div className="w-32"><FormField label="Sort Order" name="sort_order" type="number" defaultValue={cat.sort_order ?? 0} /></div>
          <FormField label="Icon Key" name="icon_key" defaultValue={cat.icon_key || ""} placeholder="syringe" />
        </div>

        <div className="mb-6">
          <ImageUpload name="hero_image" label="Hero Image" currentUrl={cat.hero_image} aspect="aspect-video" />
        </div>

        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-5" key={locale}>
              <FormField label="Title" name={`title_${locale}`} defaultValue={cat[`title_${locale}`] || ""} required={locale === "uk"} />
              <FormField label="Summary" name={`summary_${locale}`} type="textarea" rows={3} defaultValue={cat[`summary_${locale}`] || ""} />
              <FormField label="SEO Title" name={`seo_title_${locale}`} defaultValue={cat[`seo_title_${locale}`] || ""} />
              <FormField label="SEO Description" name={`seo_desc_${locale}`} type="textarea" rows={2} defaultValue={cat[`seo_desc_${locale}`] || ""} />
            </div>
          )}
        </TranslationTabs>
      </div>
      <SaveBar />
    </form>
  );
}
