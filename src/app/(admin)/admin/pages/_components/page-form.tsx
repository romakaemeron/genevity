"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { saveStaticPage, deleteStaticPage } from "../../_actions/static-pages";
import { FormDirtyTracker } from "../../_components/unsaved-changes";
import Button from "@/components/ui/Button";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";
import SectionBuilder from "../../_components/section-builder";
import FaqEditor from "../../_components/faq-editor";
import NamespaceTextsEditor from "../../_components/namespace-texts-editor";
import AboutSingletonForm from "../../_components/about-singleton-form";
import GalleryEditor, { type GalleryItemInput } from "../../_components/gallery-editor";
import PricesEditor, { type PriceCategory } from "../../_components/prices-editor";
import LabEditor, { type LabServiceInput, type LabPrepStepInput, type LabCheckupInput } from "../../_components/lab-editor";
import SiteSettingsForm from "../../settings/_components/site-settings-form";
import HeroSlidesEditor from "../../_components/hero-slides-editor";
import HeroSingletonForm from "../../_components/hero-singleton-form";
import SeoTab from "./seo-tab";

interface HeroSlideInput {
  id?: string;
  image_url: string;
  object_position: string;
  alt_uk: string;
  alt_ru: string;
  alt_en: string;
}

interface HomeNamespacePayload {
  key: string;
  label: string;
  description?: string;
  initial: Record<string, unknown>;
}

interface Props {
  page?: any;
  sections?: { type: string; data: any }[];
  faq?: any[];
  doctors?: { id: string; name_uk: string; role_uk: string | null }[];
  textNamespace?: string | null;
  pageTexts?: Record<string, unknown> | null;
  pageMetaTexts?: Record<string, unknown> | null;
  pageSlug?: string;
  aboutSingleton?: any | null;
  gallery?: GalleryItemInput[] | null;
  galleryOwnerKey?: string | null;
  priceCategories?: PriceCategory[] | null;
  labServices?: LabServiceInput[] | null;
  labPrepSteps?: LabPrepStepInput[] | null;
  labCheckups?: LabCheckupInput[] | null;
  siteSettings?: any | null;
  isHome?: boolean;
  heroSlides?: HeroSlideInput[];
  heroSingleton?: any | null;
  homeNamespaces?: HomeNamespacePayload[];
}

type Tab = "meta" | "seo" | "sections" | "faq" | "gallery" | "prices" | "lab" | "contactInfo" | "texts" | "home";

export default function PageForm({
  page, sections = [], faq = [], doctors = [],
  textNamespace, pageTexts, pageMetaTexts, pageSlug,
  aboutSingleton, gallery, galleryOwnerKey,
  priceCategories, labServices, labPrepSteps, labCheckups, siteSettings,
  isHome, heroSlides, heroSingleton, homeNamespaces,
}: Props) {
  const [state, formAction] = useActionState(saveStaticPage, null as any);
  const [tab, setTab] = useState<Tab>(isHome && page ? "home" : "meta");
  const isNew = !page;
  const hasTexts = Boolean(textNamespace && !isNew);
  const hasGallery = Boolean(galleryOwnerKey && !isNew);
  const hasPrices = Boolean(priceCategories && !isNew);
  const hasLab = Boolean(labServices && !isNew);
  const hasContactInfo = Boolean(siteSettings && !isNew);
  const metaFormRef = useRef<HTMLFormElement | null>(null);

  // The 8 seeded core pages are structural — they have dedicated editors
  // (gallery, prices, lab, site settings, namespace texts) and don't use the
  // generic Sections / FAQ editors. Hide those tabs there to reduce clutter,
  // and also make the pages non-deletable.
  const CORE_PAGE_SLUGS = ["home", "about", "contacts", "doctors", "prices", "stationary", "laboratory", "services"];
  const isCorePage = !isNew && CORE_PAGE_SLUGS.includes(page?.slug as string);
  const canDelete = !isNew && !isCorePage;

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "meta", label: "Content", show: true },
    { key: "home", label: "Homepage Content", show: Boolean(isHome && !isNew) },
    // Sections: only show on custom pages, or on core pages that somehow have sections populated
    { key: "sections", label: `Sections (${sections.length})`, show: !isNew && !isHome && (!isCorePage || sections.length > 0) },
    // FAQ: same treatment — custom pages or populated-only
    { key: "faq", label: `FAQ (${faq.length})`, show: !isNew && !isHome && (!isCorePage || faq.length > 0) },
    { key: "prices", label: `Price Items (${priceCategories?.reduce((s, c) => s + c.items.length, 0) ?? 0})`, show: hasPrices },
    { key: "lab", label: "Lab Content", show: hasLab },
    { key: "gallery", label: `Gallery (${gallery?.length ?? 0})`, show: hasGallery },
    { key: "contactInfo", label: "Contact Info", show: hasContactInfo || Boolean(isHome && !isNew) },
    { key: "texts", label: "Page Texts", show: hasTexts },
    { key: "seo", label: "SEO", show: !isNew },
  ];

  return (
    <div>
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-2 text-ink">{isNew ? "New Page" : page.title_uk || page.slug}</h1>
            {!isNew && <p className="body-m text-muted mt-3">{page.slug === "home" ? "/" : `/${page.slug}`}</p>}
          </div>
          {canDelete && (
            <Button
              variant="destructive-ghost"
              size="xs"
              onClick={() => { if (confirm("Delete this page and all its sections?")) deleteStaticPage(page.id); }}
            >
              Delete
            </Button>
          )}
          {isCorePage && (
            <span className="text-xs text-muted italic">Core page — cannot be deleted</span>
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
        <ContentTab
          page={page}
          isNew={isNew}
          isCorePage={isCorePage}
          isHome={Boolean(isHome)}
          state={state}
          formAction={formAction}
          formRef={metaFormRef}
        />
      )}

      {tab === "seo" && !isNew && <SeoTab page={page} />}

      {tab === "home" && isHome && !isNew && (
        <div className="p-8 flex flex-col gap-10">
          {heroSingleton && (
            <>
              <div>
                <h3 className="font-heading text-lg text-ink mb-1">Hero text overlay (H1, subtitle, CTA)</h3>
                <p className="body-m text-muted">
                  The biggest typography on the homepage — the <strong>H1</strong> is the single most important SEO heading,
                  plus the supporting subtitle and CTA label shown on top of the slideshow below.
                </p>
              </div>
              <HeroSingletonForm hero={heroSingleton} label="Homepage hero text" />
              <div className="border-t border-line" />
            </>
          )}

          <div>
            <h3 className="font-heading text-lg text-ink mb-1">Hero slideshow (background images)</h3>
            <p className="body-m text-muted">
              Background images rotating behind the hero text above. Drag to reorder, upload to replace, tune alt text per locale.
            </p>
          </div>
          <HeroSlidesEditor initial={heroSlides || []} />

          <div className="border-t border-line" />

          {aboutSingleton && (
            <>
              <div>
                <h3 className="font-heading text-lg text-ink mb-1">About section (homepage + /about hero)</h3>
                <p className="body-m text-muted">
                  Title, lead paragraph, accent line, and diagnostics list — shared with the <code className="font-mono text-xs">/about</code> page hero.
                </p>
              </div>
              <AboutSingletonForm about={aboutSingleton} label="Title, main paragraph, accent, diagnostics" />
              <div className="border-t border-line" />
            </>
          )}

          {(homeNamespaces || []).map((ns) => (
            <div key={ns.key} className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-lg text-ink mb-1">{ns.label}</h3>
                {ns.description && <p className="body-m text-muted">{ns.description}</p>}
                <p className="body-s text-muted mt-1">
                  Namespace: <code className="font-mono text-xs">{ns.key}</code>
                </p>
              </div>
              <NamespaceTextsEditor namespace={ns.key} initial={ns.initial} />
              <div className="border-t border-line" />
            </div>
          ))}

          {/* SEO metadata now lives in the dedicated "SEO" tab */}
        </div>
      )}

      {tab === "sections" && !isNew && (
        <div className="p-8">
          <p className="body-m text-muted mb-6">Page body — build up from sections.</p>
          <SectionBuilder ownerType="static_page" ownerId={page.id} initial={sections} doctors={doctors} />
        </div>
      )}

      {tab === "faq" && !isNew && (
        <div className="p-8">
          <p className="body-m text-muted mb-6">Page-level FAQ.</p>
          <FaqEditor ownerType="static_page" ownerId={page.id} initial={faq} />
        </div>
      )}

      {tab === "gallery" && hasGallery && (
        <div className="p-8 flex flex-col gap-6">
          <div>
            <h3 className="font-heading text-lg text-ink mb-1">Photo gallery</h3>
            <p className="body-m text-muted">
              StripeGallery shown on this page. Upload images, drag to reorder, and edit labels per locale.
            </p>
          </div>
          <GalleryEditor ownerKey={galleryOwnerKey!} initial={gallery || []} />
        </div>
      )}

      {tab === "prices" && hasPrices && (
        <div className="p-8 flex flex-col gap-6">
          <div>
            <h3 className="font-heading text-lg text-ink mb-1">Price categories & items</h3>
            <p className="body-m text-muted">Full price list shown on /prices — add categories, drag to reorder, set prices per item.</p>
          </div>
          <PricesEditor initial={priceCategories!} />
        </div>
      )}

      {tab === "lab" && hasLab && (
        <div className="p-8 flex flex-col gap-6">
          <div>
            <h3 className="font-heading text-lg text-ink mb-1">Laboratory-specific content</h3>
            <p className="body-m text-muted">
              Tabbed diagnostic services, preparation steps, and Check-Up programs shown on /laboratory.
            </p>
          </div>
          <LabEditor services={labServices!} prepSteps={labPrepSteps || []} checkups={labCheckups || []} />
        </div>
      )}

      {tab === "contactInfo" && (hasContactInfo || (isHome && siteSettings)) && (
        <div className="p-8 flex flex-col gap-6">
          <div>
            <h3 className="font-heading text-lg text-ink mb-1">Contact information</h3>
            <p className="body-m text-muted">
              Phone numbers, address, working hours, Instagram — shared across the site and used prominently on /contacts.
            </p>
          </div>
          <SiteSettingsForm settings={siteSettings!} />
        </div>
      )}

      {tab === "texts" && hasTexts && (
        <div className="p-8 flex flex-col gap-8">
          {aboutSingleton && (
            <>
              <div>
                <h3 className="font-heading text-lg text-ink mb-1">Hero / About section (title + paragraphs)</h3>
                <p className="body-m text-muted">
                  Stored in the <code className="font-mono text-xs">about</code> singleton. Shown on both the homepage About section and at the top of <code className="font-mono text-xs">/about</code>.
                </p>
              </div>
              <AboutSingletonForm about={aboutSingleton} label="Title, main paragraph, accent, diagnostics" />
              <div className="border-t border-line" />
            </>
          )}

          <div>
            <h3 className="font-heading text-lg text-ink mb-1">Body copy texts</h3>
            <p className="body-m text-muted">Every heading, label, and body paragraph used on this page. Edits apply immediately.</p>
          </div>
          <NamespaceTextsEditor
            namespace={textNamespace!}
            initial={(pageTexts || {}) as Record<string, unknown>}
          />
          {/* SEO metadata now lives in the dedicated "SEO" tab */}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Content tab — now just Title (+ H1/Summary on the two pages that render them)
   ────────────────────────────────────────────────────────────────────────── */

interface ContentTabProps {
  page: any;
  isNew: boolean;
  isCorePage: boolean;
  isHome: boolean;
  state: any;
  formAction: any;
  formRef: React.RefObject<HTMLFormElement | null>;
}

// Slugs where the public page actually renders static_pages.h1 / static_pages.summary
// in the hero section. For every other core page the hero comes from somewhere else
// (About singleton, homepage hero, ui_strings namespace) so these fields would be dead.
const SLUGS_WITH_PUBLIC_HERO_CONTENT = new Set(["stationary", "laboratory"]);

// Localized label for the home root in the breadcrumb preview.
const HOME_LABEL: Record<LocaleKey, string> = { uk: "Головна", ru: "Главная", en: "Home" };

function ContentTab({ page, isNew, isCorePage, isHome, state, formAction, formRef }: ContentTabProps) {
  const slug = (page?.slug as string) || "";
  const showH1Summary = isNew || !isCorePage || SLUGS_WITH_PUBLIC_HERO_CONTENT.has(slug);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Client-side guard: the Ukrainian Title must always be non-empty. The input
  // has `required`, but when the user is on a non-UA tab the field is inside a
  // CSS-hidden wrapper, which makes the browser skip constraint validation.
  // So we re-check on submit and block with an inline banner if needed.
  const validateBeforeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const uk = (form.elements.namedItem("title_uk") as HTMLInputElement | null)?.value?.trim();
    if (!uk) {
      e.preventDefault();
      setValidationError("Ukrainian title is required. Switch to the UA tab and fill in the Title field.");
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setValidationError(null);
  };

  return (
    <form action={formAction} ref={formRef} onSubmit={validateBeforeSubmit}>
      <FormDirtyTracker
        id={page ? `page-meta:${page.slug}` : "page-meta:new"}
        label={`Page title · ${page?.title_uk || page?.slug || "new"}`}
        formRef={formRef}
        onSave={() => formRef.current?.requestSubmit()}
      />
      {page && <input type="hidden" name="id" value={page.id} />}

      <div className="p-8">
        {validationError && (
          <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm font-medium">
            {validationError}
          </div>
        )}
        {state?.error && <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}
        {state?.success && <div className="mb-6 p-4 bg-success-light text-success rounded-xl text-sm">Saved!</div>}

        {/* ── URL + noindex ── */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {isCorePage ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">URL</label>
              <div className="px-4 py-2.5 rounded-xl bg-champagne-dark text-muted text-sm font-mono">
                {slug === "home" ? "/" : `/${slug}`}
              </div>
              <input type="hidden" name="slug" value={slug} />
            </div>
          ) : (
            <FormField label="Slug" name="slug" defaultValue={slug} placeholder="pro-tsentr" required />
          )}
          <div className="flex flex-col gap-1.5 justify-end pb-1">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" name="seo_noindex" defaultChecked={page?.seo_noindex || false} className="rounded" />
              Hide from search engines
            </label>
          </div>
        </div>

        {/* ── Preserve all fields managed elsewhere ── */}
        {(["uk", "ru", "en"] as const).map((l) => (
          <div key={l} className="hidden">
            <input type="hidden" name={`seo_title_${l}`} defaultValue={page?.[`seo_title_${l}`] || ""} />
            <input type="hidden" name={`seo_desc_${l}`} defaultValue={page?.[`seo_desc_${l}`] || ""} />
            <input type="hidden" name={`seo_keywords_${l}`} defaultValue={page?.[`seo_keywords_${l}`] || ""} />
            {!showH1Summary && (
              <>
                <input type="hidden" name={`h1_${l}`} defaultValue={page?.[`h1_${l}`] || ""} />
                <input type="hidden" name={`summary_${l}`} defaultValue={page?.[`summary_${l}`] || ""} />
              </>
            )}
          </div>
        ))}
        <input type="hidden" name="seo_og_image_current" defaultValue={page?.seo_og_image || ""} />

        {/* ── Hero section heading — the most important SEO surface on this page ── */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-main text-champagne text-[10px] font-bold uppercase tracking-wider">Hero</span>
            <h3 className="font-heading text-base text-ink">Page title {showH1Summary ? "(H1)" : ""}</h3>
          </div>
          <p className="body-s text-muted">
            {showH1Summary ? (
              <>The <strong>Title</strong> doubles as the page <strong>H1</strong> — the single most important heading on the page
              for both readers and search engines. Keep it short, descriptive, and include the primary keyword if possible.</>
            ) : isHome ? (
              <>Used as the label for this page inside the admin — the homepage does not show a breadcrumb on the site itself.</>
            ) : (
              <>Used as the <strong>breadcrumb label</strong> at the top of <code className="font-mono text-xs">{slug === "home" ? "/" : `/${slug}`}</code> and as the page identifier in admin lists.</>
            )}
          </p>
        </div>

        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-5" key={locale}>
              {/* Live breadcrumb preview — sits under the language tabs and
                  above the Title field, mirroring the public Breadcrumbs
                  markup exactly. Updates per-locale as the user types. */}
              {!isHome && (
                <div>
                  <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1.5">Preview</p>
                  <nav aria-label="Breadcrumb" className="body-s text-muted">
                    <ol className="flex items-center gap-1.5 flex-wrap">
                      <li className="flex items-center gap-1.5">
                        <span>{HOME_LABEL[locale]}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-black-20">/</span>
                        <span className="text-black">
                          <BreadcrumbPreview formRef={formRef} locale={locale} fallback={page?.[`title_${locale}`] || page?.title_uk || slug} />
                        </span>
                      </li>
                    </ol>
                  </nav>
                </div>
              )}

              <FormField
                label={showH1Summary ? "Title (rendered as page H1)" : "Title"}
                name={`title_${locale}`}
                defaultValue={page?.[`title_${locale}`] || ""}
                required={locale === "uk"}
                hint={showH1Summary
                  ? "Shown as the page's H1 — Google treats this as the strongest ranking signal on the page"
                  : "Short — appears in breadcrumbs and admin lists"}
              />
              {showH1Summary && (
                <>
                  <FormField
                    label="H1 (page hero heading)"
                    name={`h1_${locale}`}
                    defaultValue={page?.[`h1_${locale}`] || ""}
                    hint="Shown as the main heading on the page. Leave empty to reuse the Title."
                  />
                  <FormField
                    label="Summary (hero subtitle)"
                    name={`summary_${locale}`}
                    type="textarea"
                    rows={3}
                    defaultValue={page?.[`summary_${locale}`] || ""}
                    hint="Short paragraph under the hero heading."
                  />
                </>
              )}
            </div>
          )}
        </TranslationTabs>
      </div>
      <SaveBar label={isNew ? "Create Page" : "Save Changes"} />
    </form>
  );
}

/**
 * Mirrors the current value of the locale's title input into a little
 * breadcrumb-preview chip without turning the field into a controlled input.
 */
function BreadcrumbPreview({
  formRef, locale, fallback,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  locale: LocaleKey;
  fallback: string;
}) {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const update = () => {
      const v = (form.elements.namedItem(`title_${locale}`) as HTMLInputElement | null)?.value;
      setValue(v || fallback);
    };
    update();
    form.addEventListener("input", update);
    return () => form.removeEventListener("input", update);
  }, [formRef, locale, fallback]);
  return <>{value}</>;
}
