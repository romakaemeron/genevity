"use client";

import { useActionState, useState, useRef } from "react";
import { saveService, deleteService, saveServiceBlockOrder, applyLayoutToAllServices, deleteFinalCta } from "../../_actions/services";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";
import SectionBuilder from "../../_components/section-builder";
import FaqEditor from "../../_components/faq-editor";
import RelationsEditor from "../../_components/relations-editor";
import SeoFormTab from "../../_components/seo-form-tab";
import BlockOrderEditor, { type BlockDef } from "../../_components/block-order-editor";
import ServiceOverridesEditor from "../../_components/service-overrides-editor";
import FinalCtaEditor from "../../_components/final-cta-editor";
import { FormDirtyTracker } from "../../_components/unsaved-changes";
import Button from "@/components/ui/Button";
import type { ServiceBlockHeadingsInput, ServiceFinalCtaInput } from "../../_actions/services";

interface Props {
  service?: any;
  categories: { id: string; title_uk: string; slug: string }[];
  sections?: { id?: string; type: string; data: any }[];
  faq?: any[];
  relations?: { doctorIds: string[]; relatedServiceIds: string[]; equipmentIds: string[] };
  doctors?: { id: string; name_uk: string; role_uk: string | null }[];
  allServices?: { id: string; title_uk: string; slug: string; cat_title: string }[];
  equipment?: { id: string; name: string; category: string }[];
  /** Global ui_strings labels for all locales — used as placeholders in per-service override inputs. */
  uiDefaults?: {
    faq?: { uk: string; ru: string; en: string };
    doctors?: { uk: string; ru: string; en: string };
    equipment?: { uk: string; ru: string; en: string };
    relatedServices?: { uk: string; ru: string; en: string };
    finalCTA?: { uk: string; ru: string; en: string };
  };
}

type Tab = "meta" | "seo" | "sections" | "faq" | "relations" | "layout";

export default function ServiceForm({
  service: svc, categories,
  sections = [], faq = [], relations = { doctorIds: [], relatedServiceIds: [], equipmentIds: [] },
  doctors = [], allServices = [], equipment = [], uiDefaults = {},
}: Props) {
  const [state, formAction] = useActionState(saveService, null as any);
  const [tab, setTab] = useState<Tab>("meta");
  const isNew = !svc;
  const metaFormRef = useRef<HTMLFormElement | null>(null);

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "meta", label: "Content", show: true },
    { key: "seo", label: "SEO", show: !isNew },
    { key: "sections", label: `Sections (${sections.length})`, show: !isNew },
    { key: "faq", label: `FAQ (${faq.length})`, show: !isNew },
    { key: "relations", label: "Relations", show: !isNew },
    { key: "layout", label: "Layout", show: !isNew },
  ];

  const categorySlug = svc?.category_id
    ? categories.find((c) => c.id === svc.category_id)?.slug || ""
    : "";

  return (
    <div>
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-2 text-ink">{isNew ? "New Service" : svc.title_uk}</h1>
            {!isNew && categorySlug && (
              <p className="body-m text-muted mt-1">/services/{categorySlug}/{svc.slug}</p>
            )}
          </div>
          {!isNew && (
            <Button
              variant="destructive-ghost"
              size="xs"
              onClick={() => { if (confirm("Delete this service and all its sections?")) deleteService(svc.id); }}
            >
              Delete
            </Button>
          )}
        </div>

        {!isNew && (
          <div className="flex gap-1 border-b border-line -mx-8 px-8">
            {tabs.filter((t) => t.show).map((t) => (
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
        )}
      </div>

      {tab === "meta" && (
        <form action={formAction} ref={metaFormRef}>
          <FormDirtyTracker
            id={svc ? `service:${svc.id}` : "service:new"}
            label={`Service · ${svc?.title_uk || "new"}`}
            formRef={metaFormRef}
            onSave={() => metaFormRef.current?.requestSubmit()}
          />
          {svc && <input type="hidden" name="id" value={svc.id} />}
          {/* Round-trip SEO columns so saving Content doesn't null them */}
          {!isNew && (["uk", "ru", "en"] as const).map((l) => (
            <div key={l} className="hidden">
              <input type="hidden" name={`seo_title_${l}`} defaultValue={svc?.[`seo_title_${l}`] || ""} />
              <input type="hidden" name={`seo_desc_${l}`} defaultValue={svc?.[`seo_desc_${l}`] || ""} />
              <input type="hidden" name={`seo_keywords_${l}`} defaultValue={svc?.[`seo_keywords_${l}`] || ""} />
            </div>
          ))}
          {!isNew && (
            <>
              <input type="hidden" name="seo_og_image_current" defaultValue={svc?.seo_og_image || ""} />
              {/* Server reads seo_noindex === "on" — round-trip the current value so a
                  Content-tab save doesn't clear the admin's no-index flag. */}
              {svc?.seo_noindex && <input type="hidden" name="seo_noindex" value="on" />}
            </>
          )}

          <div className="p-8 flex flex-col gap-10">
            {state?.error && <div className="p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}
            {state?.success && <div className="p-4 bg-success-light text-success rounded-xl text-sm">Saved!</div>}

            {/* ── URL & sorting ── */}
            <section className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-base text-ink mb-1">Routing & ordering</h3>
                <p className="body-s text-muted">
                  The public URL and the position of this service inside its category grid.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Slug" name="slug" defaultValue={svc?.slug || ""} placeholder="botulinum-therapy" required hint="URL segment shown at /services/<category>/<slug>" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted uppercase tracking-wider inline-flex items-center gap-1.5">
                    <span>Category</span>
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-error text-error text-[10px] font-bold leading-none" title="Required">*</span>
                  </label>
                  <select name="category_id" defaultValue={svc?.category_id || ""} required className="px-4 py-2.5 rounded-xl bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main">
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.title_uk} ({c.slug})</option>)}
                  </select>
                </div>
              </div>

              <div className="w-32">
                <FormField label="Sort Order" name="sort_order" type="number" defaultValue={svc?.sort_order ?? 0} hint="Lower = earlier" />
              </div>
            </section>

            <div className="border-t border-line" />

            {/* ── Hero image ── */}
            <section className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-base text-ink mb-1">Hero image</h3>
                <p className="body-s text-muted">
                  Photo shown at the top of the service detail page, paired with the Title + Summary below.
                  Also used as the card thumbnail on the category grid.
                </p>
              </div>
              <ImageUpload name="hero_image" label="Upload hero image" currentUrl={svc?.hero_image} aspect="aspect-video" />
            </section>

            <div className="border-t border-line" />

            {/* ── Hero copy + key facts (per-locale) ── */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-main text-champagne text-[10px] font-bold uppercase tracking-wider">Hero</span>
                  <h3 className="font-heading text-base text-ink">Hero section text & key facts (H1)</h3>
                </div>
                <p className="body-s text-muted">
                  Everything shown at the top of <code className="font-mono text-xs">/services/&lt;category&gt;/&lt;slug&gt;</code>:
                  the <strong>Title</strong> (breadcrumb + page heading), optional <strong>H1</strong> override,
                  the <strong>Summary</strong> paragraph under the heading, plus the
                  key-fact chips (duration / effect / sessions / price).
                  The H1 is the single most important heading on the page for SEO.
                </p>
              </div>

              <TranslationTabs>
                {(locale: LocaleKey) => (
                  <div className="flex flex-col gap-5" key={locale}>
                    <FormField
                      label="Title"
                      name={`title_${locale}`}
                      defaultValue={svc?.[`title_${locale}`] || ""}
                      required={locale === "uk"}
                      hint="Shown in breadcrumbs, service cards, and as the page heading (if no H1 override)"
                    />
                    <FormField
                      label="H1 (optional hero heading override)"
                      name={`h1_${locale}`}
                      defaultValue={svc?.[`h1_${locale}`] || ""}
                      hint="Leave blank to reuse the Title as the page's H1"
                    />
                    <FormField
                      label="Summary (hero paragraph)"
                      name={`summary_${locale}`}
                      type="textarea"
                      rows={3}
                      defaultValue={svc?.[`summary_${locale}`] || ""}
                      hint="Short paragraph shown directly under the hero heading"
                    />

                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Key-fact chips (shown below the hero)</p>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField label="Duration" name={`procedure_length_${locale}`} defaultValue={svc?.[`procedure_length_${locale}`] || ""} placeholder="30 хв" />
                        <FormField label="Effect" name={`effect_duration_${locale}`} defaultValue={svc?.[`effect_duration_${locale}`] || ""} placeholder="6 міс" />
                        <FormField label="Sessions" name={`sessions_recommended_${locale}`} defaultValue={svc?.[`sessions_recommended_${locale}`] || ""} placeholder="3-5" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Pricing</p>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Price From" name={`price_from_${locale}`} defaultValue={svc?.[`price_from_${locale}`] || ""} placeholder="від 4000 грн" hint="Headline price shown on the key-fact bar and in cards" />
                        <FormField label="Price Unit" name={`price_unit_${locale}`} defaultValue={svc?.[`price_unit_${locale}`] || ""} placeholder="за зону" hint="Appended in muted text after the price" />
                      </div>
                    </div>
                  </div>
                )}
              </TranslationTabs>
            </section>

            <div className="border-t border-line" />

            <p className="body-s text-muted">
              For the rest of the page: body content on the <strong>Sections</strong> tab,
              questions on <strong>FAQ</strong>, related doctors / services / equipment on <strong>Relations</strong>.
              Search-engine metadata (meta title, description, keywords, OG image, no-index) lives on the <strong>SEO</strong> tab.
            </p>
          </div>

          <SaveBar label={isNew ? "Create Service" : "Save Changes"} />
        </form>
      )}

      {tab === "seo" && !isNew && (
        <SeoFormTab
          entity={svc}
          entityId={svc.id}
          saveAction={saveService}
          label={svc.title_uk || svc.slug}
          publicPathFor={(locale) => {
            const base = `/services/${categorySlug}/${svc.slug}`;
            return locale === "uk" ? base : `/${locale}${base}`;
          }}
          hiddenFields={buildHiddenRoundtripFields(svc)}
          fallbackTitleFor={(l) => svc[`title_${l}`] || ""}
          fallbackDescFor={(l) => svc[`summary_${l}`] || ""}
        />
      )}

      {tab === "sections" && !isNew && (() => {
        // Sort sections by their position in block_order so the Sections tab
        // matches the order shown in the Layout tab.
        const blockOrder: string[] = Array.isArray(svc.block_order) ? svc.block_order : [];
        const orderMap = new Map<string, number>();
        blockOrder.forEach((key, i) => { if (key.startsWith("section:")) orderMap.set(key.slice(8), i); });
        const sortedSections = orderMap.size > 0
          ? [...sections].sort((a, b) => (orderMap.get(a.id ?? "") ?? 9999) - (orderMap.get(b.id ?? "") ?? 9999))
          : sections;
        return (
        <div className="p-8 flex flex-col gap-5">
          <p className="body-m text-muted">Build the service page by adding and arranging sections. Changes save independently.</p>
          <SectionBuilder
            ownerType="service"
            ownerId={svc.id}
            initial={sortedSections}
            doctors={doctors}
            bottomSlot={
              <>
                <ServiceOverridesEditor
                  serviceId={svc.id}
                  serviceLabel={svc.title_uk || svc.slug}
                  blocks={[
                    { key: "faq",             label: "FAQ",              globalDefault: uiDefaults.faq },
                    { key: "doctors",         label: "Doctors",          globalDefault: uiDefaults.doctors },
                    { key: "equipment",       label: "Equipment",        globalDefault: uiDefaults.equipment },
                    { key: "relatedServices", label: "Related services", globalDefault: uiDefaults.relatedServices },
                  ]}
                  initialHeadings={(svc.block_headings as ServiceBlockHeadingsInput | null) || {}}
                />
                <FinalCtaEditor
                  serviceId={svc.id}
                  serviceLabel={svc.title_uk || svc.slug}
                  initial={(svc.final_cta as ServiceFinalCtaInput | null) || {}}
                  onDelete={async () => { await deleteFinalCta(svc.id); }}
                />
              </>
            }
          />
        </div>
        );
      })()}

      {tab === "faq" && !isNew && (
        <div className="p-8">
          <p className="body-m text-muted mb-6">Frequently asked questions shown at the bottom of the service page.</p>
          <FaqEditor ownerType="service" ownerId={svc.id} initial={faq} />
        </div>
      )}

      {tab === "relations" && !isNew && (
        <div className="p-8">
          <p className="body-m text-muted mb-6">Link doctors, related services, and equipment used for this procedure.</p>
          <RelationsEditor
            serviceId={svc.id}
            initial={relations}
            doctors={doctors.map((d) => ({ id: d.id, label: d.name_uk, sub: d.role_uk || undefined }))}
            services={allServices.map((s) => ({ id: s.id, label: s.title_uk, sub: `${s.cat_title} · ${s.slug}` }))}
            equipment={equipment.map((e) => ({ id: e.id, label: e.name, sub: e.category }))}
          />
        </div>
      )}

      {tab === "layout" && !isNew && (
        <div className="p-8 flex flex-col gap-10">
          <div>
            <h3 className="font-heading text-lg text-ink mb-1">Page layout</h3>
            <p className="body-m text-muted max-w-2xl">
              Drag or use the up/down arrows to reorder the sections that appear below the hero on
              <code className="font-mono text-xs mx-1">/services/{categorySlug}/{svc.slug}</code>.
              The hero title, summary, key-fact chips and CTA stay at the top. Blocks with no content
              simply won&apos;t render — you can still keep them in the order for when they have content later.
            </p>
          </div>
          <BlockOrderEditor
            entityId={svc.id}
            entityLabel={svc.title_uk || svc.slug}
            blocks={buildServiceBlocks(svc, sections, faq, relations)}
            initialOrder={(svc.block_order as string[] | null) || null}
            onSave={(order) => saveServiceBlockOrder(svc.id, order)}
            onApplyToAll={(order) => applyLayoutToAllServices(order, svc.id)}
          />

        </div>
      )}
    </div>
  );
}

// Human-readable labels for each section block type — mirrors the admin's
// "Add section" picker so layout entries read the same way.
const SECTION_TYPE_LABELS: Record<string, string> = {
  richText: "Rich text",
  bullets: "Bullet list",
  steps: "Steps",
  compareTable: "Compare table",
  indicationsContraindications: "Indications / Contraindications",
  priceTeaser: "Price teaser",
  callout: "Callout",
  imageGallery: "Image gallery",
  relatedDoctors: "Related doctors block",
  cta: "CTA block",
};

/** First non-empty localized value from an object like { uk, ru, en } */
function firstLocaleValue(v: unknown): string {
  if (!v || typeof v !== "object") return "";
  const obj = v as Record<string, unknown>;
  for (const k of ["uk", "ru", "en"] as const) {
    const val = obj[k];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

/**
 * Emit one reorderable BlockDef per individual content section plus the five
 * fixed blocks. Admins can interleave sections with FAQ / doctors / equipment
 * so the Layout tab controls the page as a whole, not just block categories.
 */
function buildServiceBlocks(
  svc: any,
  sections: { id?: string; type: string; data: any }[],
  faq: any[],
  relations: { doctorIds: string[]; relatedServiceIds: string[]; equipmentIds: string[] },
): BlockDef[] {
  const sectionBlocks: BlockDef[] = sections
    // Only sections that have a DB id can be referenced in block_order
    .filter((s) => s.id)
    .map((s, i) => {
      const typeLabel = SECTION_TYPE_LABELS[s.type] || s.type;
      const preview = firstLocaleValue(s.data?.heading) || firstLocaleValue(s.data?.indicationsHeading) || firstLocaleValue(s.data?.body);
      return {
        key: `section:${s.id}`,
        label: `${typeLabel}${preview ? ` — ${preview.slice(0, 60)}${preview.length > 60 ? "…" : ""}` : ""}`,
        description: `Section #${i + 1} of the page body. Edit its content on the Sections tab.`,
        hasContent: true,
      };
    });

  return [
    ...sectionBlocks,
    { key: "faq",             label: "FAQ",                    description: "Frequently asked questions. Managed on the FAQ tab.",                              hasContent: faq.length > 0 },
    { key: "doctors",         label: "Related doctors",        description: "Doctors who perform this procedure. Managed on the Relations tab.",                hasContent: relations.doctorIds.length > 0 },
    { key: "equipment",       label: "Related equipment",      description: "Devices used for this procedure. Managed on the Relations tab.",                   hasContent: relations.equipmentIds.length > 0 },
    { key: "relatedServices", label: "Related services",       description: '"Also interesting" grid of other services. Managed on the Relations tab.',         hasContent: relations.relatedServiceIds.length > 0 },
    { key: "finalCTA",        label: "Final booking CTA",      description: "Closing call-to-action card with the Book button.",                               hasContent: true },
  ];
}

/**
 * Every non-SEO column the saveService server action reads. Passed to the SEO
 * tab so a SEO-only save doesn't clear the Content/sections fields.
 */
function buildHiddenRoundtripFields(svc: any): Record<string, string | number | boolean | null | undefined> {
  const fields: Record<string, string | number | boolean | null | undefined> = {
    slug: svc.slug,
    category_id: svc.category_id,
    sort_order: svc.sort_order,
    hero_image_current: svc.hero_image || "",
  };
  for (const l of ["uk", "ru", "en"] as const) {
    fields[`title_${l}`] = svc[`title_${l}`] || "";
    fields[`h1_${l}`] = svc[`h1_${l}`] || "";
    fields[`summary_${l}`] = svc[`summary_${l}`] || "";
    fields[`procedure_length_${l}`] = svc[`procedure_length_${l}`] || "";
    fields[`effect_duration_${l}`] = svc[`effect_duration_${l}`] || "";
    fields[`sessions_recommended_${l}`] = svc[`sessions_recommended_${l}`] || "";
    fields[`price_from_${l}`] = svc[`price_from_${l}`] || "";
    fields[`price_unit_${l}`] = svc[`price_unit_${l}`] || "";
  }
  return fields;
}
