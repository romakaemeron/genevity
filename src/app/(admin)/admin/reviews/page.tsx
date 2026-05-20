import { requireSession } from "../_actions/auth";
import { listAllReviews, listDoctorsForSelect } from "../_actions/reviews";
import { AdminPageHeader } from "../_components/admin-list";
import ReviewsTable from "./_components/reviews-table";
import { getAdminStrings } from "../_i18n/server";

export default async function ReviewsPage() {
  await requireSession();
  const [rows, doctors, t] = await Promise.all([
    listAllReviews(),
    listDoctorsForSelect(),
    getAdminStrings(),
  ]);
  const pending = rows.filter((r) => !r.isPublished).length;
  const subtitle = pending > 0
    ? t.reviewsPage.subtitlePending(pending, rows.length)
    : t.reviewsPage.subtitleAll(rows.length);

  return (
    <div className="p-8">
      <AdminPageHeader title={t.reviewsPage.title} subtitle={subtitle} />
      <ReviewsTable rows={rows} doctors={doctors} />
    </div>
  );
}
