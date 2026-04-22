"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { saveHero } from "../_actions/settings";
import TranslationTabs, { type LocaleKey } from "./translation-tabs";
import FormField from "./form-field";
import { FormDirtyTracker, snapshotForm } from "./unsaved-changes";
import Button from "@/components/ui/Button";

/**
 * Homepage hero text editor — Title / Subtitle / CTA label / Location line.
 * Backed by the `hero` singleton table. The slideshow images live in a
 * separate `hero_slides` editor; this one controls the copy rendered on top.
 */
export default function HeroSingletonForm({ hero, label = "Hero section (homepage)" }: { hero: any; label?: string }) {
  const [state, action] = useActionState(saveHero, null as any);
  const formRef = useRef<HTMLFormElement | null>(null);
  const baselineRef = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const take = () => { baselineRef.current = snapshotForm(form); setDirty(false); };
    const raf = requestAnimationFrame(take);
    const recompute = () => {
      if (baselineRef.current === null) return;
      setDirty(snapshotForm(form) !== baselineRef.current);
    };
    const onReset = () => { setDirty(false); requestAnimationFrame(take); };
    form.addEventListener("input", recompute);
    form.addEventListener("change", recompute);
    form.addEventListener("reset", onReset);
    return () => {
      cancelAnimationFrame(raf);
      form.removeEventListener("input", recompute);
      form.removeEventListener("change", recompute);
      form.removeEventListener("reset", onReset);
    };
  }, []);

  useEffect(() => {
    if (state?.success && formRef.current) {
      baselineRef.current = snapshotForm(formRef.current);
      setDirty(false);
    }
  }, [state?.success]);

  return (
    <div className="bg-champagne-dark rounded-2xl border border-line p-6">
      <h2 className="font-heading text-lg text-ink mb-1">{label}</h2>
      <p className="body-s text-muted mb-4">
        Overlay text shown on top of the hero slideshow on the homepage — the main
        <strong> H1 heading</strong>, subtitle, a short location line, and the CTA button label.
      </p>
      {state?.success && <div className="mb-4 p-3 bg-success-light text-success rounded-xl text-sm">Saved!</div>}
      <form action={action} ref={formRef}>
        <FormDirtyTracker
          id="hero-singleton"
          label="Homepage hero text (H1, subtitle, CTA)"
          formRef={formRef}
          onSave={() => formRef.current?.requestSubmit()}
        />
        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-4" key={locale}>
              <FormField
                label="Title (H1 — main page heading)"
                name={`title_${locale}`}
                type="textarea"
                rows={2}
                defaultValue={hero[`title_${locale}`] || ""}
                hint="Rendered as the H1 of the homepage — Google treats this as the single most important SEO signal."
              />
              <FormField
                label="Subtitle"
                name={`subtitle_${locale}`}
                type="textarea"
                rows={2}
                defaultValue={hero[`subtitle_${locale}`] || ""}
                hint="Supporting paragraph under the H1"
              />
              <FormField
                label="CTA button text"
                name={`cta_${locale}`}
                defaultValue={hero[`cta_${locale}`] || ""}
                hint="The primary button label overlaid on the hero"
              />
              <FormField
                label="Location line"
                name={`location_${locale}`}
                defaultValue={hero[`location_${locale}`] || ""}
                hint="Small badge shown near the CTA (e.g., the city / address)"
              />
            </div>
          )}
        </TranslationTabs>
        <div className="mt-4 flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-warning">Unsaved changes</span>}
          <Button variant="neutral" size="sm" type="reset" disabled={!dirty} title="Revert unsaved edits to the last-saved values">Cancel changes</Button>
          <Button variant="primary" size="sm" type="submit" disabled={!dirty}>Save Hero</Button>
        </div>
      </form>
    </div>
  );
}
