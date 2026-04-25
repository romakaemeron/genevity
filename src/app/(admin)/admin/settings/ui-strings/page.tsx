import { requireSession } from "../../_actions/auth";
import { getUiStringsNamespace } from "@/lib/db/queries";
import NamespaceTextsEditor from "../../_components/namespace-texts-editor";
import { AdminSectionHeading } from "../../_components/admin-list";

export default async function GlobalLabelsPage() {
  await requireSession();
  const [footer, ctaForm] = await Promise.all([
    getUiStringsNamespace("footer"),
    getUiStringsNamespace("ctaForm"),
  ]);

  return (
    <div className="p-8 flex flex-col gap-10">
      <div>
        <h1 className="heading-2 text-ink">Footer & Labels</h1>
        <p className="body-m text-muted mt-1">
          Global texts that appear across every page — footer links and booking form labels.
          Page-specific texts live on each page's editor under{" "}
          <a href="/admin/pages" className="text-main underline-offset-2 hover:underline">Pages</a>.
        </p>
      </div>

      <div>
        <AdminSectionHeading>Footer</AdminSectionHeading>
        <p className="body-m text-muted mb-6">Links, headings, and labels in the site footer.</p>
        <NamespaceTextsEditor namespace="footer" initial={footer} />
      </div>

      <div>
        <AdminSectionHeading>Booking form labels</AdminSectionHeading>
        <p className="body-m text-muted mb-6">
          Default labels for the booking modal — name field, phone field, submit button, etc.
          Per-location overrides are in{" "}
          <a href="/admin/settings/cta" className="text-main underline-offset-2 hover:underline">Booking CTAs</a>.
        </p>
        <NamespaceTextsEditor namespace="ctaForm" initial={ctaForm} />
      </div>
    </div>
  );
}
