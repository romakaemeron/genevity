import { AdminPageHeader } from "../../_components/admin-list";
import { getAdminStrings } from "../../_i18n/server";
import { requireAdminPage } from "../_guard";
import IssueForm from "../_components/issue-form";

export default async function NewLoyaltyCardPage() {
  await requireAdminPage();
  const t = await getAdminStrings();
  return (
    <div className="p-8 max-w-xl">
      <AdminPageHeader title={t.loyaltyPage.issueTitle} subtitle={t.loyaltyPage.issueSubtitle} />
      <IssueForm />
    </div>
  );
}
