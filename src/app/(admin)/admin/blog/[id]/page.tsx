import { requireSession } from "../../_actions/auth";
import { adminGetPostById } from "@/lib/db/queries/blog";
import { sql } from "@/lib/db/client";
import BlogPostForm from "./_form";

export default async function AdminBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const isNew = id === 'new';
  const post = isNew ? null : await adminGetPostById(id);
  const [categories, doctors] = await Promise.all([
    sql`SELECT id, title_uk FROM blog_categories ORDER BY sort_order`,
    sql`SELECT id, name_uk FROM doctors ORDER BY sort_order`,
  ]);
  return <BlogPostForm post={post} categories={categories as any[]} doctors={doctors as any[]} isNew={isNew} />;
}
