import { requireSession } from "../_actions/auth";
import { AdminPageHeader } from "../_components/admin-list";

export default async function BlogPage() {
  await requireSession();
  return (
    <div className="p-8">
      <AdminPageHeader title="Blog" subtitle="Blog management coming in v2" />
      <div className="bg-champagne-dark rounded-2xl p-12 text-center text-muted">
        Blog posts, categories, and SEO settings will be available here.
      </div>
    </div>
  );
}
