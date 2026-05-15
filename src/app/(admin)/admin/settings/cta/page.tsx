import { requireSession } from "../../_actions/auth";
import { getUiStringsTree } from "@/lib/db/queries";
import CtaOverridesEditor from "../../_components/cta-overrides-editor";

/**
 * Dedicated admin screen for editing per-instance CTA copy. Lists every
 * BookingCTA location registered in CTA_REGISTRY (homepage hero, final CTAs,
 * navigation, etc.) and exposes four optional localized overrides each:
 * buttonLabel / modalTitle / modalSubtitle / submitLabel.
 *
 * Blanks fall back to the global ctaForm defaults on the public site, so
 * this page is additive — admins only fill in the cells they want to vary
 * per-surface.
 */
export default async function CtaSettingsPage() {
  await requireSession();
  const tree = await getUiStringsTree();
  const cta = ((tree as Record<string, unknown>).cta || {}) as Record<string, Record<string, { uk?: string; ru?: string; en?: string }>>;
  const ctaForm = ((tree as Record<string, unknown>).ctaForm || {}) as Record<string, { uk?: string; ru?: string; en?: string }>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="heading-2 text-ink">Call-to-action overrides</h1>
        <p className="body-m text-muted mt-1 max-w-2xl">
          Fine-tune every booking CTA on the public site. Each registered location
          (homepage hero, service final CTA, etc.) can have its own button text,
          modal title, subtitle and submit label — leave blank to fall back to the
          global <code className="font-mono text-xs">ctaForm</code> defaults.
        </p>
      </div>
      <CtaOverridesEditor initial={cta} globalFallbacks={ctaForm} />
    </div>
  );
}
