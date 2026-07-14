import { requireSession } from "../../_actions/auth";
import { adminGetPostById } from "@/lib/db/queries/blog";
import { getDoctorOptions } from "@/lib/db/queries/doctors";
import { sql } from "@/lib/db/client";
import BlogPostForm from "./_form";

export default async function AdminBlogPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireSession();
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === 'new';
  const post = isNew ? null : await adminGetPostById(id);
  const [categories, doctors, services, doctorOptions] = await Promise.all([
    sql`SELECT id, title_uk FROM blog_categories ORDER BY sort_order`,
    sql`SELECT id, name_uk FROM doctors ORDER BY sort_order`,
    sql`SELECT s.slug, s.title_uk, c.title_uk AS cat_title
        FROM services s JOIN service_categories c ON s.category_id = c.id
        ORDER BY c.sort_order, s.sort_order`,
    getDoctorOptions("uk"),
  ]);
  return (
    <BlogPostForm
      post={post}
      categories={categories as any[]}
      doctors={doctors as any[]}
      doctorOptions={doctorOptions}
      services={services as any[]}
      isNew={isNew}
      justSaved={saved === "1"}
    />
  );
}
