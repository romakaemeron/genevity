"use client";

import { useActionState, useRef, useState } from "react";
import { saveSiteSettings } from "../../_actions/settings";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";
import { FormDirtyTracker } from "../../_components/unsaved-changes";

export default function SiteSettingsForm({ settings }: { settings: any }) {
  const [state, formAction] = useActionState(saveSiteSettings, null as any);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [ogUrl, setOgUrl] = useState<string | null>(settings.og_image || null);

  return (
    <form action={formAction} ref={formRef}>
      <FormDirtyTracker
        id="site-settings"
        label="Site-wide settings (contact info, OG image)"
        formRef={formRef}
        externalDirty={ogUrl !== (settings.og_image || null)}
        onSave={() => formRef.current?.requestSubmit()}
      />
      {state?.success && <div className="mb-4 p-3 bg-success-light text-success rounded-xl text-sm">Saved!</div>}

      <div className="flex flex-col gap-8 mb-8">
        {/* ── Contact info ── */}
        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone 1" name="phone1" defaultValue={settings.phone1 || ""} placeholder="+380 73 000 0150" />
            <FormField label="Phone 2" name="phone2" defaultValue={settings.phone2 || ""} placeholder="+380 93 000 0150" />
          </div>
          <FormField label="Instagram" name="instagram" defaultValue={settings.instagram || ""} placeholder="@genevity.center" />
          <FormField
            label="Google Maps URL"
            name="maps_url"
            defaultValue={settings.maps_url || ""}
            placeholder="https://www.google.com/maps/place/..."
            hint="Paste the full link from the Google Maps address bar (the /place/... URL). Used for the click-through on the address card AND the embedded map on /contacts. If you use Google's &quot;Embed a map&quot; share dialog, paste the /maps/embed?pb=... URL instead."
          />

          <TranslationTabs>
            {(locale: LocaleKey) => (
              <div className="flex flex-col gap-4" key={locale}>
                <FormField label="Address" name={`address_${locale}`} defaultValue={settings[`address_${locale}`] || ""} />
                <FormField label="Working Hours" name={`hours_${locale}`} defaultValue={settings[`hours_${locale}`] || ""} />
              </div>
            )}
          </TranslationTabs>
        </section>

        <div className="border-t border-line" />

        {/* ── Default OG image — cascade source for every page ── */}
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="font-heading text-base text-ink mb-1">Default social share image (Open Graph)</h3>
            <p className="body-s text-muted">
              Shown when any page of the site is shared on Facebook, Twitter, LinkedIn, Telegram, etc. —
              unless that page has its own OG image in the SEO tab, which overrides this one.
              1200×630 recommended.
            </p>
          </div>
          <ImageUpload
            name="og_image"
            label="Default OG image"
            currentUrl={ogUrl}
            onUrlChange={setOgUrl}
            aspect="aspect-[1200/630]"
          />
        </section>
      </div>
      <SaveBar />
    </form>
  );
}
