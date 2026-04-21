"use client";

import { useActionState } from "react";
import { saveSiteSettings } from "../../_actions/settings";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import SaveBar from "../../_components/save-bar";

export default function SiteSettingsForm({ settings }: { settings: any }) {
  const [state, formAction] = useActionState(saveSiteSettings, null as any);

  return (
    <form action={formAction}>
      {state?.success && <div className="mb-4 p-3 bg-success-light text-success rounded-xl text-sm">Saved!</div>}

      <div className="flex flex-col gap-5 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone 1" name="phone1" defaultValue={settings.phone1 || ""} placeholder="+380 73 000 0150" />
          <FormField label="Phone 2" name="phone2" defaultValue={settings.phone2 || ""} placeholder="+380 93 000 0150" />
        </div>
        <FormField label="Instagram" name="instagram" defaultValue={settings.instagram || ""} placeholder="@genevity.center" />
        <FormField label="Google Maps URL" name="maps_url" defaultValue={settings.maps_url || ""} />

        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-4" key={locale}>
              <FormField label="Address" name={`address_${locale}`} defaultValue={settings[`address_${locale}`] || ""} />
              <FormField label="Working Hours" name={`hours_${locale}`} defaultValue={settings[`hours_${locale}`] || ""} />
            </div>
          )}
        </TranslationTabs>
      </div>
      <SaveBar />
    </form>
  );
}
