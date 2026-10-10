import { requireSession } from "../../_actions/auth";
import PromotionsEditor from "../../_components/promotions-editor";
import { adminGetPromotions } from "@/lib/db/queries/promotions";
import { AdminPageHeader } from "../../_components/admin-list";

export const dynamic = "force-dynamic";

/** ТЗ #16 §1.2 — "Акції / Спеціальні пропозиції" block on the homepage. */
export default async function PromotionsPage() {
  await requireSession();
  const promotions = await adminGetPromotions();

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Акції та спеціальні пропозиції"
        subtitle="Картки акцій на головній сторінці. Акція з вказаною датою завершення зникає з сайту автоматично наступного дня."
      />
      <PromotionsEditor initial={promotions} />
    </div>
  );
}
