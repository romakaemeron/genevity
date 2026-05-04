import { requireSession } from "../_actions/auth";
import { listAllReviews, listDoctorsForSelect } from "../_actions/reviews";
import { AdminPageHeader } from "../_components/admin-list";
import ReviewsTable from "./_components/reviews-table";

export default async function ReviewsPage() {
  await requireSession();
  const [rows, doctors] = await Promise.all([listAllReviews(), listDoctorsForSelect()]);
  const pending = rows.filter((r) => !r.isPublished).length;
  const subtitle = pending > 0
    ? `${pending} очікують публікації · ${rows.length} всього`
    : `${rows.length} всього`;

  return (
    <div className="p-8">
      <AdminPageHeader title="Відгуки" subtitle={subtitle} />
      <ReviewsTable rows={rows} doctors={doctors} />
    </div>
  );
}
