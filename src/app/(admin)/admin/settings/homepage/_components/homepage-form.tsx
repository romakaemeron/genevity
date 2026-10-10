"use client";

import { useActionState, useState } from "react";
import { saveHero, saveAbout, saveHomepageCta } from "../../../_actions/settings";
import TranslationTabs, { type LocaleKey } from "../../../_components/translation-tabs";
import FormField from "../../../_components/form-field";
import ImageUpload from "../../../_components/image-upload";
import type { HomepageCtaRow } from "@/lib/db/queries/homepage-cta";

export default function HomepageForm({
  hero, about, finalCta,
}: { hero: any; about: any; finalCta: HomepageCtaRow }) {
  const [heroState, heroAction] = useActionState(saveHero, null as any);
  const [aboutState, aboutAction] = useActionState(saveAbout, null as any);
  const [ctaState, ctaAction] = useActionState(saveHomepageCta, null as any);
  const [ctaEnabled, setCtaEnabled] = useState(finalCta.is_enabled);
  const [ctaBg, setCtaBg] = useState<string | null>(finalCta.bg_image || null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Homepage Settings</h1>

      {/* Hero */}
      <div className="bg-champagne-dark rounded-2xl border border-line p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Hero Section</h2>
        {heroState?.success && <div className="mb-4 p-3 bg-success-light text-success rounded-xl text-sm">Saved!</div>}
        <form action={heroAction}>
          <TranslationTabs>
            {(locale: LocaleKey) => (
              <div className="flex flex-col gap-4" key={locale}>
                <FormField label="Title" name={`title_${locale}`} type="textarea" rows={2} defaultValue={hero[`title_${locale}`] || ""} />
                <FormField label="Subtitle" name={`subtitle_${locale}`} type="textarea" rows={2} defaultValue={hero[`subtitle_${locale}`] || ""} />
                <FormField label="CTA Button Text" name={`cta_${locale}`} defaultValue={hero[`cta_${locale}`] || ""} />
                <FormField label="Location" name={`location_${locale}`} defaultValue={hero[`location_${locale}`] || ""} />
              </div>
            )}
          </TranslationTabs>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors cursor-pointer">Save Hero</button>
          </div>
        </form>
      </div>

      {/* About */}
      <div className="bg-champagne-dark rounded-2xl border border-line p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">About Section</h2>
        {aboutState?.success && <div className="mb-4 p-3 bg-success-light text-success rounded-xl text-sm">Saved!</div>}
        <form action={aboutAction}>
          <TranslationTabs>
            {(locale: LocaleKey) => (
              <div className="flex flex-col gap-4" key={locale}>
                <FormField label="Title" name={`title_${locale}`} defaultValue={about[`title_${locale}`] || ""} />
                <FormField label="Text 1 (main paragraph)" name={`text1_${locale}`} type="textarea" rows={4} defaultValue={about[`text1_${locale}`] || ""} />
                <FormField label="Text 2 (subtitle/tagline)" name={`text2_${locale}`} type="textarea" rows={2} defaultValue={about[`text2_${locale}`] || ""} />
                <FormField label="Diagnostics callout" name={`diagnostics_${locale}`} type="textarea" rows={3} defaultValue={about[`diagnostics_${locale}`] || ""} />
              </div>
            )}
          </TranslationTabs>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors cursor-pointer">Save About</button>
          </div>
        </form>
      </div>

      {/* ── ТЗ #16 §1.3 — closing CTA banner above the footer ── */}
      <div className="bg-champagne-dark rounded-2xl border border-line p-6 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Final CTA banner (before the footer)</h2>
        <p className="text-xs text-muted mb-4 max-w-2xl">
          The closing offer for visitors who scrolled the whole homepage, shown with the booking
          form inline. Put the incentive in the heading or the benefits list
          (e.g. &laquo;Запишіться на консультацію зараз та отримайте діагностику у подарунок&raquo;).
          The block stays hidden while it is switched off or the Ukrainian heading is empty.
        </p>
        {ctaState?.success && <div className="mb-4 p-3 bg-success-light text-success rounded-xl text-sm">Saved!</div>}
        <form action={ctaAction}>
          <input type="hidden" name="is_enabled" value={ctaEnabled ? "1" : "0"} />
          <input type="hidden" name="bg_image_current" value={ctaBg ?? ""} />

          <label className="mb-5 flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setCtaEnabled((v) => !v)}
              aria-pressed={ctaEnabled}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer ${ctaEnabled ? "bg-success" : "bg-black/20"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${ctaEnabled ? "left-[1.1rem]" : "left-0.5"}`} />
            </button>
            <span className="text-sm text-ink">{ctaEnabled ? "Block is live on the homepage" : "Block is switched off"}</span>
          </label>

          <TranslationTabs>
            {(locale: LocaleKey) => (
              <div className="flex flex-col gap-4" key={locale}>
                <FormField
                  label="Eyebrow (small label above the heading)"
                  name={`eyebrow_${locale}`}
                  defaultValue={(finalCta as any)[`eyebrow_${locale}`] || ""}
                  placeholder="Спеціально для нових пацієнтів"
                />
                <FormField
                  label="Heading"
                  name={`heading_${locale}`}
                  type="textarea"
                  rows={2}
                  defaultValue={(finalCta as any)[`heading_${locale}`] || ""}
                  placeholder="Запишіться на консультацію зараз"
                />
                <FormField
                  label="Subtitle"
                  name={`subtitle_${locale}`}
                  type="textarea"
                  rows={2}
                  defaultValue={(finalCta as any)[`subtitle_${locale}`] || ""}
                />
                <FormField
                  label="Benefits — one per line"
                  name={`benefits_${locale}`}
                  type="textarea"
                  rows={4}
                  defaultValue={((finalCta as any)[`benefits_${locale}`] || []).join("\n")}
                  placeholder={"Безкоштовна консультація\nІндивідуальний план\nБез нав'язування процедур"}
                />
                <FormField
                  label="Note / fine print"
                  name={`note_${locale}`}
                  type="textarea"
                  rows={2}
                  defaultValue={(finalCta as any)[`note_${locale}`] || ""}
                />
              </div>
            )}
          </TranslationTabs>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
            <ImageUpload
              name="bg_image"
              label="Background image (optional)"
              currentUrl={ctaBg}
              onUrlChange={setCtaBg}
              aspect="aspect-[16/9]"
              pickerFolder="homepage-cta"
            />
            <div className="max-w-xs">
              <FormField
                label="Background focal point"
                name="bg_focal_point"
                defaultValue={finalCta.bg_focal_point || "50% 50%"}
                hint="CSS object-position, e.g. 50% 30%. A dark overlay is applied automatically so the copy stays readable."
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors cursor-pointer">Save Final CTA</button>
          </div>
        </form>
      </div>
    </div>
  );
}
