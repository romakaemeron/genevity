import { sql } from "@/lib/db/client";
import { requireSession } from "../../_actions/auth";
import NewServiceForm from "./_new-service-form";

/**
 * "Add Service" is a minimal two-field form — Ukrainian title + category.
 * After creation the server action redirects to /admin/pages/services/<id>,
 * the full page editor (Content, SEO, Sections, FAQ, Relations). Everything
 * else gets filled in there.
 */
export default async function NewServicePage() {
  await requireSession();
  const categories = await sql`SELECT id, title_uk, slug FROM service_categories ORDER BY sort_order`;
  return <NewServiceForm categories={categories as any} />;
}
