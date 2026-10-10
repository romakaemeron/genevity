import { requireSession } from "../../_actions/auth";
import BeforeAfterEditor from "../../_components/before-after-editor";
import {
  adminGetBeforeAfterCases, HOMEPAGE_BEFORE_AFTER_KEY,
} from "@/lib/db/queries/before-after";
import { AdminPageHeader } from "../../_components/admin-list";

export const dynamic = "force-dynamic";

/** ТЗ #16 §1.1 — the homepage "До / Після" slider. Per-service cases are
 *  edited on each service's own "Before / After" tab. */
export default async function HomepageBeforeAfterPage() {
  await requireSession();
  const cases = await adminGetBeforeAfterCases(HOMEPAGE_BEFORE_AFTER_KEY);

  return (
    <div className="p-8">
      <AdminPageHeader
        title="До / Після — головна сторінка"
        subtitle="Візуальні докази результату на головній. Кожен кейс — дві фотографії (до і після), зона корекції та кількість сеансів. Блок не показується, поки немає жодного кейсу з двома фото."
      />
      <BeforeAfterEditor
        ownerKey={HOMEPAGE_BEFORE_AFTER_KEY}
        ownerLabel="Головна сторінка"
        initial={cases}
      />
    </div>
  );
}
