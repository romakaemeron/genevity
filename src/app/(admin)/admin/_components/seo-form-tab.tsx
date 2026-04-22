"use client";

/**
 * Generic SEO editor tab used by every "page-like" admin form:
 *   - static pages (/admin/pages/<slug>)
 *   - service category hubs (/admin/pages/categories/<id>)
 *   - service detail pages (/admin/pages/services/<id>)
 *
 * Reads the seo_title_*, seo_desc_*, seo_keywords_*, seo_og_image, seo_noindex
 * columns on the entity, renders per-locale inputs with character counters,
 * and includes a live Google SERP preview + OG share-card preview.
 *
 * Because this tab's <form> submits its own slice of the entity, consumers
 * pass `hiddenFields` with every OTHER column the server action would read,
 * so a SEO-only save doesn't accidentally null out non-SEO fields.
 */

import { useActionState, useRef, useState, useEffect } from "react";
import type { LocaleKey } from "./translation-tabs";
import TranslationTabs from "./translation-tabs";
import FormField from "./form-field";
import ImageUpload from "./image-upload";
import SaveBar from "./save-bar";
import { FormDirtyTracker } from "./unsaved-changes";
import { Search, AlertTriangle } from "lucide-react";
import Image from "next/image";
// Real site favicon used in the SERP preview — imported from /src/app/ so
// Next.js bundles and serves it via its static image pipeline. Replaces the
// placeholder "G" circle we used to show.
import faviconSrc from "@/app/android-chrome-192x192.png";

const LOCALE_LABEL: Record<LocaleKey, string> = { uk: "UA", ru: "RU", en: "EN" };
const BASE_URL = "https://genevity.com.ua";

export interface SeoFormTabProps {
  /** Row with `seo_title_*`, `seo_desc_*`, `seo_keywords_*`, `seo_og_image`, `seo_noindex`. */
  entity: any;
  /** Unique identifier passed through the form (usually the row's `id`). Rendered as <input type="hidden" name={idField}>. */
  entityId: string;
  /** Name of the hidden input. Defaults to "id". */
  idField?: string;
  /** Server action — must accept the form-data slice and update the entity. */
  saveAction: (prev: any, formData: FormData) => Promise<any>;
  /** Display label for the unsaved-changes tracker. */
  label: string;
  /** Maps locale → path for the Google preview URL. */
  publicPathFor: (locale: LocaleKey) => string;
  /**
   * Hidden inputs that the server action also reads (non-SEO columns). Without
   * these the action would null them on a SEO-only submit.
   */
  hiddenFields?: Record<string, string | number | boolean | null | undefined>;
  /** Fallback value for the preview title when `seo_title` is empty. */
  fallbackTitleFor?: (locale: LocaleKey) => string;
  /** Fallback value for the preview description when `seo_desc` is empty. */
  fallbackDescFor?: (locale: LocaleKey) => string;
  /** Optional extra controls rendered directly below the OG image upload. Used by
   *  CategoryForm for the "apply this OG image to every service in the category" checkbox. */
  extraFieldsAfterOg?: React.ReactNode;
}

export default function SeoFormTab({
  entity, entityId, idField = "id", saveAction, label,
  publicPathFor, hiddenFields = {}, fallbackTitleFor, fallbackDescFor,
  extraFieldsAfterOg,
}: SeoFormTabProps) {
  const [state, formAction] = useActionState(saveAction, null as any);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [previewLocale, setPreviewLocale] = useState<LocaleKey>("uk");

  const [title, setTitle] = useState({
    uk: (entity.seo_title_uk as string) || "",
    ru: (entity.seo_title_ru as string) || "",
    en: (entity.seo_title_en as string) || "",
  });
  const [desc, setDesc] = useState({
    uk: (entity.seo_desc_uk as string) || "",
    ru: (entity.seo_desc_ru as string) || "",
    en: (entity.seo_desc_en as string) || "",
  });
  const [keywords, setKeywords] = useState({
    uk: (entity.seo_keywords_uk as string) || "",
    ru: (entity.seo_keywords_ru as string) || "",
    en: (entity.seo_keywords_en as string) || "",
  });
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(entity.seo_og_image || null);

  const initialOgImage = entity.seo_og_image || null;
  const controlledDirty = ogImageUrl !== initialOgImage;

  // The actual values the public page will render: admin's SEO input first,
  // then the fallback source (hero Title / Summary), then slug as a last resort.
  const previewTitle = title[previewLocale] || fallbackTitleFor?.(previewLocale) || entity.slug || "";
  const previewDesc = desc[previewLocale] || fallbackDescFor?.(previewLocale) || "";
  const previewUrl = `${BASE_URL}${publicPathFor(previewLocale)}`;
  const titleLen = title[previewLocale].length;
  const descLen = desc[previewLocale].length;

  // Tell the admin when SEO fields are empty for THIS locale and we're
  // silently borrowing from the Content tab — helps them decide whether to
  // write dedicated SEO copy or not.
  const titleIsFallback = !title[previewLocale] && !!previewTitle;
  const descIsFallback = !desc[previewLocale] && !!previewDesc;
  const anyFallback = titleIsFallback || descIsFallback;

  return (
    <form action={formAction} ref={formRef}>
      <FormDirtyTracker
        id={`seo:${entityId}`}
        label={`SEO · ${label}`}
        formRef={formRef}
        externalDirty={controlledDirty}
        onSave={() => formRef.current?.requestSubmit()}
      />
      <input type="hidden" name={idField} value={entityId} />
      {/* Round-trip every column the server action reads that isn't in this tab */}
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input
          key={name}
          type="hidden"
          name={name}
          defaultValue={value == null ? "" : String(value)}
        />
      ))}

      <div className="p-8 flex flex-col gap-8">
        {state?.error && <div className="p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>}
        {state?.success && <div className="p-4 bg-success-light text-success rounded-xl text-sm">Saved!</div>}

        <div>
          <h3 className="font-heading text-lg text-ink mb-1">Search engine indexing</h3>
          <p className="body-s text-muted mb-3">Keep this URL out of Google / Bing without unpublishing it.</p>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input type="checkbox" name="seo_noindex" defaultChecked={entity.seo_noindex || false} className="rounded" />
            Hide this page from search engines (<code className="font-mono text-xs">noindex, nofollow</code>)
          </label>
        </div>

        <div className="border-t border-line" />

        <div>
          <h3 className="font-heading text-lg text-ink mb-1">Social share image (Open Graph)</h3>
          <p className="body-s text-muted mb-3">
            Displayed when this URL is shared on Facebook, Twitter, LinkedIn, Telegram, etc. 1200×630 recommended.
            If left empty, the default <code className="font-mono text-xs">/og/genevity-og.jpg</code> is used.
          </p>
          <ImageUpload
            name="seo_og_image"
            label="OG image"
            currentUrl={ogImageUrl}
            onUrlChange={setOgImageUrl}
            aspect="aspect-[1200/630]"
          />
          {extraFieldsAfterOg}
        </div>

        <div className="border-t border-line" />

        <div>
          <h3 className="font-heading text-lg text-ink mb-1">Meta title, description, keywords</h3>
          <p className="body-s text-muted mb-4">
            Separate per language. Google shows the title (~60 chars) and description (~155 chars) in search results.
            Keywords are ignored by Google but still read by Bing / Yandex.
          </p>
        </div>

        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-5" key={locale}>
              <FormField
                label={`Meta title (${LOCALE_LABEL[locale]})`}
                name={`seo_title_${locale}`}
                defaultValue={title[locale]}
                hint={`${title[locale].length} / 60 characters — over 60 will be truncated by Google`}
              />
              <FormField
                label={`Meta description (${LOCALE_LABEL[locale]})`}
                name={`seo_desc_${locale}`}
                type="textarea"
                rows={3}
                defaultValue={desc[locale]}
                hint={`${desc[locale].length} / 155 characters`}
              />
              <FormField
                label={`Keywords (${LOCALE_LABEL[locale]})`}
                name={`seo_keywords_${locale}`}
                defaultValue={keywords[locale]}
                hint="Comma-separated list (e.g. cosmetology, GENEVITY, Dnipro)"
              />
            </div>
          )}
        </TranslationTabs>

        <OnInputMirror
          formRef={formRef}
          onTitleChange={(l, v) => setTitle((p) => ({ ...p, [l]: v }))}
          onDescChange={(l, v) => setDesc((p) => ({ ...p, [l]: v }))}
          onKeywordsChange={(l, v) => setKeywords((p) => ({ ...p, [l]: v }))}
        />

        <div className="border-t border-line" />

        <div>
          <h3 className="font-heading text-lg text-ink mb-1">Live preview</h3>
          <p className="body-s text-muted mb-4">How this page will appear in Google search results and when shared on social networks.</p>

          <div className="flex gap-1 mb-5">
            {(["uk", "ru", "en"] as LocaleKey[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setPreviewLocale(l)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  previewLocale === l
                    ? "bg-main text-champagne"
                    : "bg-champagne-dark text-muted hover:text-ink"
                }`}
              >
                {LOCALE_LABEL[l]}
              </button>
            ))}
          </div>

          {/* No-SEO warning: the preview is usable (fallback kicks in) but Google
              will see the page's hero Title/Summary instead of dedicated SEO copy. */}
          {anyFallback && (
            <div className="mb-5 p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-start gap-3">
              <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-medium text-ink">
                  No dedicated SEO for <span className="uppercase">{LOCALE_LABEL[previewLocale]}</span> — using hero text as a fallback
                </p>
                <p className="text-muted">
                  {titleIsFallback && descIsFallback && <>Both the <strong>Meta title</strong> and <strong>Meta description</strong> are empty, so the preview below borrows from the hero Title / Summary on the Content tab.</>}
                  {titleIsFallback && !descIsFallback && <>The <strong>Meta title</strong> is empty, so the preview below uses the hero Title from the Content tab.</>}
                  {!titleIsFallback && descIsFallback && <>The <strong>Meta description</strong> is empty, so the preview below uses the hero Summary from the Content tab.</>}
                  {" "}Write dedicated SEO copy above for better Google / social sharing results.
                </p>
              </div>
            </div>
          )}

          {/* Google SERP */}
          <div className="bg-champagne-dark rounded-2xl border border-line p-6 mb-5">
            <div className="flex items-center gap-2 mb-3 text-[11px] font-medium text-muted uppercase tracking-wider">
              <Search size={12} />
              Google search result
            </div>
            <div className="max-w-[600px]">
              <div className="flex items-center gap-2 text-xs text-[#202124]">
                <div className="w-6 h-6 rounded-full bg-champagne-dark border border-line overflow-hidden flex items-center justify-center shrink-0">
                  <Image src={faviconSrc} alt="" width={24} height={24} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-px">
                  <span className="text-[13px] text-[#202124]">GENEVITY</span>
                  <span className="text-[12px] text-[#5f6368]">{previewUrl}</span>
                </div>
              </div>
              <h3 className="mt-2 text-[20px] leading-[26px] text-[#1a0dab] font-normal hover:underline cursor-default truncate">
                {previewTitle}
              </h3>
              <p className="mt-1 text-[14px] leading-[22px] text-[#4d5156] line-clamp-2">
                {previewDesc || <span className="italic text-[#9aa0a6]">(no description)</span>}
              </p>
            </div>
            <div className="mt-4 flex gap-4 text-[11px] text-muted">
              <span className={titleLen > 60 ? "text-error font-medium" : ""}>Title: {titleLen} chars {titleLen > 60 ? "(over limit)" : ""}</span>
              <span className={descLen > 155 ? "text-error font-medium" : ""}>Description: {descLen} chars {descLen > 155 ? "(over limit)" : ""}</span>
            </div>
          </div>

          {/* Warning: no custom OG image — surface BEFORE the preview so admins
              understand what they're about to see (a site-wide default image). */}
          {!ogImageUrl && (
            <div className="mb-3 p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-start gap-3">
              <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-medium text-ink">
                  No OG image uploaded — the site-wide default is shown below
                </p>
                <p className="text-muted">
                  When shared on Facebook, Twitter, LinkedIn, Telegram, etc., this page will use
                  <code className="font-mono text-xs mx-1">/og/genevity-og.jpg</code>. Upload a
                  page-specific 1200×630 image above for better social sharing.
                </p>
              </div>
            </div>
          )}

          {/* Facebook / OG */}
          <div className="bg-champagne-dark rounded-2xl border border-line p-6">
            <div className="mb-3 text-[11px] font-medium text-muted uppercase tracking-wider">
              Facebook / OpenGraph share card
            </div>
            <div className="max-w-[524px] border border-line rounded-lg overflow-hidden">
              <div className="aspect-[1200/630] bg-champagne-dark relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogImageUrl || "/og/genevity-og.jpg"}
                  alt="OG preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-[#f0f2f5]">
                <div className="text-[11px] uppercase text-[#606770] tracking-wide">genevity.com.ua</div>
                <div className="text-[16px] leading-tight font-semibold text-[#050505] mt-0.5 line-clamp-1">
                  {previewTitle}
                </div>
                {previewDesc && (
                  <div className="text-[14px] leading-[19px] text-[#606770] mt-0.5 line-clamp-2">
                    {previewDesc}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SaveBar label="Save SEO" />
    </form>
  );
}

function OnInputMirror({
  formRef, onTitleChange, onDescChange, onKeywordsChange,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  onTitleChange: (l: LocaleKey, v: string) => void;
  onDescChange: (l: LocaleKey, v: string) => void;
  onKeywordsChange: (l: LocaleKey, v: string) => void;
}) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handler = (e: Event) => {
      const t = e.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (!t?.name) return;
      const m = t.name.match(/^seo_(title|desc|keywords)_(uk|ru|en)$/);
      if (!m) return;
      const [, field, loc] = m;
      if (field === "title") onTitleChange(loc as LocaleKey, t.value);
      if (field === "desc") onDescChange(loc as LocaleKey, t.value);
      if (field === "keywords") onKeywordsChange(loc as LocaleKey, t.value);
    };
    form.addEventListener("input", handler);
    return () => form.removeEventListener("input", handler);
  }, [formRef, onTitleChange, onDescChange, onKeywordsChange]);
  return null;
}
