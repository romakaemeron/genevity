"use client";

import { useActionState } from "react";
import { createDraftService } from "../../_actions/services";
import FormField from "../../_components/form-field";
import SaveBar from "../../_components/save-bar";
import { ArrowRight } from "lucide-react";

interface Props {
  categories: { id: string; title_uk: string; slug: string }[];
}

export default function NewServiceForm({ categories }: Props) {
  const [state, formAction] = useActionState(createDraftService, null as any);

  return (
    <div>
      <div className="px-8 pt-8 pb-4">
        <h1 className="heading-2 text-ink">Add service</h1>
        <p className="body-m text-muted mt-1 max-w-xl">
          Start with a Ukrainian title and a category. After the service is created you&apos;ll be taken
          straight to its page editor to fill in body, photos, pricing, sections, FAQ and SEO.
        </p>
      </div>

      <form action={formAction}>
        <div className="p-8 flex flex-col gap-5 max-w-2xl">
          {state?.error && (
            <div className="p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>
          )}

          <FormField
            label="Service title (UA)"
            name="title_uk"
            placeholder="Ботулінотерапія"
            required
            hint="Pick a short Ukrainian name — it auto-generates a URL slug. You can edit every translation and the slug later."
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider inline-flex items-center gap-1.5">
              <span>Category</span>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-error text-error text-[10px] font-bold leading-none" title="Required">*</span>
            </label>
            <select
              name="category_id"
              defaultValue=""
              required
              className="px-4 py-2.5 rounded-xl bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main"
            >
              <option value="" disabled>Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title_uk} ({c.slug})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">Determines the public URL: <code className="font-mono">/services/&lt;category&gt;/&lt;slug&gt;</code></p>
          </div>

          <div className="mt-2 rounded-2xl bg-champagne-dark p-4 flex items-start gap-3">
            <ArrowRight size={16} className="text-main mt-0.5 shrink-0" />
            <p className="body-s text-muted">
              On save you&apos;ll be redirected to the full service page editor to add the body,
              hero photo, translations, pricing, sections, FAQ, relations and SEO.
            </p>
          </div>
        </div>

        <SaveBar label="Create service & open page editor" />
      </form>
    </div>
  );
}
