"use client";

import { useActionState, useState, useRef } from "react";
import { saveCategory } from "../../_actions/categories";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";
import SectionBuilder from "../../_components/section-builder";
import FaqEditor from "../../_components/faq-editor";
import SeoFormTab from "../../_components/seo-form-tab";
import { FormDirtyTracker } from "../../_components/unsaved-changes";

interface Props {
  category: any;
  sections?: { type: string; data: any }[];
  faq?: any[];
  doctors?: { id: string; name_uk: string; role_uk: string | null }[];
}

type Tab = "meta" | "seo" | "sections" | "faq";

export default function CategoryForm({ category: cat, sections = [], faq = [], doctors = [] }: Props) {
  const [state, formAction] = useActionState(saveCategory, null as any);
  const [tab, setTab] = useState<Tab>("meta");
  const metaFormRef = useRef<HTMLFormElement | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "meta", label: "Content" },
    { key: "seo", label: "SEO" },
    { key: "sections", label: `Sections (${sections.length})` },
    { key: "faq", label: `FAQ (${faq.length})` },
  ];

  return (
    <div>
      <div className="px-8 pt-8">
        <h1 className="heading-2 text-ink">{cat.title_uk}</h1>
        <p className="body-m text-muted mt-1 mb-6">/services/{cat.slug}</p>

        <div className="flex gap-1 border-b border-line -mx-8 px-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                tab === t.key ? "text-main border-b-2 border-main -mb-px" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "meta" && (
        <form action={formAction} ref={metaFormRef}>
          <FormDirtyTracker
            id={`category:${cat.id}`}
            label={`Category · ${cat.title_uk || cat.slug}`}
            formRef={metaFormRef}
            onSave={() => metaFormRef.current?.requestSubmit()}
          />
          <input type="hidden" name="id" value={cat.id} />
          {/* Round-trip SEO columns so saving Content doesn't null them */}
          {(["uk", "ru", "en"] as const).map((l) => (
            <div key={l} className="hidden">
              <input type="hidden" name={`seo_title_${l}`} defaultValue={cat[`seo_title_${l}`] || ""} />
              <input type="hidden" name={`seo_desc_${l}`} defaultValue={cat[`seo_desc_${l}`] || ""} />
              <input type="hidden" name={`seo_keywords_${l}`} defaultValue={cat[`seo_keywords_${l}`] || ""} />
            </div>
          ))}
          <input type="hidden" name="seo_og_image_current" defaultValue={cat.seo_og_image || ""} />
          {cat.seo_noindex && <input type="hidden" name="seo_noindex" value="on" />}

          <div className="p-8">
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
                </div>
              )}
            </TranslationTabs>

            <p className="body-s text-muted mt-6">
              For search-engine metadata (meta title, description, keywords, OG image, no-index) switch to the <strong>SEO</strong> tab.
            </p>
          </div>
          <SaveBar />
        </form>
      )}

      {tab === "seo" && (
        <SeoFormTab
          entity={cat}
          entityId={cat.id}
          saveAction={saveCategory}
          label={cat.title_uk || cat.slug}
          publicPathFor={(locale) => {
            const base = `/services/${cat.slug}`;
            return locale === "uk" ? base : `/${locale}${base}`;
          }}
          hiddenFields={buildHiddenRoundtripFields(cat)}
          fallbackTitleFor={(l) => cat[`title_${l}`] || ""}
          fallbackDescFor={(l) => cat[`summary_${l}`] || ""}
          extraFieldsAfterOg={
            <label className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-champagne-dark cursor-pointer hover:bg-champagne-darker transition-colors">
              <input
                type="checkbox"
                name="apply_og_to_services"
                className="mt-0.5 rounded"
              />
              <div className="flex flex-col gap-0.5 text-sm">
                <span className="text-ink font-medium">Apply this OG image to every service in this category</span>
                <span className="text-xs text-muted">
                  When saved, the same image becomes the Open Graph image for all services under
                  <code className="font-mono text-xs mx-1">/services/{cat.slug}/…</code>.
                  Existing per-service overrides will be replaced.
                </span>
              </div>
            </label>
          }
        />
      )}

      {tab === "sections" && (
        <div className="p-8">
          <p className="body-m text-muted mb-6">Sections displayed on the category page between the hero and the services grid.</p>
          <SectionBuilder ownerType="category" ownerId={cat.id} initial={sections} doctors={doctors} />
        </div>
      )}

      {tab === "faq" && (
        <div className="p-8">
          <p className="body-m text-muted mb-6">Category-level FAQ.</p>
          <FaqEditor ownerType="category" ownerId={cat.id} initial={faq} />
        </div>
      )}
    </div>
  );
}

function buildHiddenRoundtripFields(cat: any): Record<string, string | number | boolean | null | undefined> {
  const fields: Record<string, string | number | boolean | null | undefined> = {
    icon_key: cat.icon_key || "",
    sort_order: cat.sort_order ?? 0,
    hero_image_current: cat.hero_image || "",
  };
  for (const l of ["uk", "ru", "en"] as const) {
    fields[`title_${l}`] = cat[`title_${l}`] || "";
    fields[`summary_${l}`] = cat[`summary_${l}`] || "";
  }
  return fields;
}
