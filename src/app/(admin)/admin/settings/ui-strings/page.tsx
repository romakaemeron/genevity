import { requireSession } from "../../_actions/auth";
import { getUiStringsTree } from "@/lib/db/queries";
import UiStringsEditor from "../../_components/ui-strings-editor";

export default async function UiStringsSettingsPage() {
  await requireSession();
  const tree = await getUiStringsTree();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="heading-2 text-ink">UI Strings</h1>
        <p className="body-m text-muted mt-1">
          Edit every label, heading, CTA and body line shown across the site. Changes apply immediately.
        </p>
      </div>
      <UiStringsEditor tree={tree} />
    </div>
  );
}
