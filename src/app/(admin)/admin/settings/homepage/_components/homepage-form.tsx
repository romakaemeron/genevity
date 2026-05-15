"use client";

import { useActionState } from "react";
import { saveHero, saveAbout } from "../../../_actions/settings";
import TranslationTabs, { type LocaleKey } from "../../../_components/translation-tabs";
import FormField from "../../../_components/form-field";
import SaveBar from "../../../_components/save-bar";

export default function HomepageForm({ hero, about }: { hero: any; about: any }) {
  const [heroState, heroAction] = useActionState(saveHero, null as any);
  const [aboutState, aboutAction] = useActionState(saveAbout, null as any);

  return (
    <div className="p-8">
      <h1 className="heading-2 text-ink mb-8">Homepage Settings</h1>

      {/* Hero */}
      <div className="bg-champagne-dark rounded-2xl border border-line p-6 mb-6">
        <h2 className="font-heading text-lg text-ink mb-4">Hero Section</h2>
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
        <h2 className="font-heading text-lg text-ink mb-4">About Section</h2>
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
    </div>
  );
}
