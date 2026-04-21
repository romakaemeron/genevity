import { requireSession } from "../_actions/auth";

export default async function BlogPage() {
  await requireSession();
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="heading-2 text-ink mb-2">Blog</h1>
      <p className="body-m text-muted mb-8">Blog management coming in v2</p>
      <div className="bg-white rounded-2xl border border-line p-12 text-center">
        <p className="text-muted">Blog posts, categories, and SEO settings will be available here.</p>
      </div>
    </div>
  );
}
