"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { saveAbout } from "../_actions/settings";
import TranslationTabs, { type LocaleKey } from "./translation-tabs";
import FormField from "./form-field";
import { FormDirtyTracker, snapshotForm } from "./unsaved-changes";
import Button from "@/components/ui/Button";

export default function AboutSingletonForm({ about, label = "About section" }: { about: any; label?: string }) {
  const [state, action] = useActionState(saveAbout, null as any);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Local dirty signal — derived by comparing current DOM against the last
  // baseline snapshot. This way the Save button disables again when the user
  // edits and then restores the original value.
  const baselineRef = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const take = () => {
      baselineRef.current = snapshotForm(form);
      setDirty(false);
    };
    const raf = requestAnimationFrame(take);
    const recompute = () => {
      if (baselineRef.current === null) return;
      setDirty(snapshotForm(form) !== baselineRef.current);
    };
    const onReset = () => {
      setDirty(false);
      requestAnimationFrame(take);
    };
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

  // When the server action reports success, re-baseline so new edits diff
  // against the saved values instead of the original props.
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
        Shared between the homepage About section and the <code className="font-mono text-xs">/about</code> page hero.
      </p>
      {state?.success && <div className="mb-4 p-3 bg-success-light text-success rounded-xl text-sm">Saved!</div>}
      <form action={action} ref={formRef}>
        <FormDirtyTracker
          id="about-singleton"
          label="About section (title, paragraphs, diagnostics)"
          formRef={formRef}
          onSave={() => formRef.current?.requestSubmit()}
        />
        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-4" key={locale}>
              <FormField label="Title" name={`title_${locale}`} defaultValue={about[`title_${locale}`] || ""} />
              <FormField label="Text 1 (main paragraph)" name={`text1_${locale}`} type="textarea" rows={4} defaultValue={about[`text1_${locale}`] || ""} />
              <FormField label="Text 2 (subtitle / accent paragraph)" name={`text2_${locale}`} type="textarea" rows={2} defaultValue={about[`text2_${locale}`] || ""} />
              <FormField label="Diagnostics callout" name={`diagnostics_${locale}`} type="textarea" rows={3} defaultValue={about[`diagnostics_${locale}`] || ""} />
            </div>
          )}
        </TranslationTabs>
        <div className="mt-4 flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-warning">Unsaved changes</span>}
          <Button variant="neutral" size="sm" type="reset" disabled={!dirty} title="Revert unsaved edits to the last-saved values">Cancel changes</Button>
          <Button variant="primary" size="sm" type="submit" disabled={!dirty}>Save</Button>
        </div>
      </form>
    </div>
  );
}
