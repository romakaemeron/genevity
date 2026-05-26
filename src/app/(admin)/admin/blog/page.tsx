import { requireSession } from "../_actions/auth";
import { AdminPageHeader, AdminPrimaryButton } from "../_components/admin-list";
import { adminGetAllPosts } from "@/lib/db/queries/blog";
import Link from "next/link";
import { Plus, FileText, Eye, EyeOff } from "lucide-react";
import { getAdminStrings } from "../_i18n/server";

export default async function AdminBlogPage() {
  await requireSession();
  const [posts, t] = await Promise.all([adminGetAllPosts(), getAdminStrings()]);

  return (
    <div className="p-8 flex flex-col gap-8">
      <AdminPageHeader
        title={t.blogPage.title}
        subtitle={t.blogPage.subtitle(posts.length)}
        actions={
          <AdminPrimaryButton href="/admin/blog/new">
            <Plus size={16} /> {t.blogPage.newPost}
          </AdminPrimaryButton>
        }
      />
      <div className="flex flex-col gap-2">
        {posts.length === 0 && (
          <div className="bg-champagne-dark rounded-2xl p-12 text-center text-muted">
            {t.blogPage.noPosts}
          </div>
        )}
        {posts.map((post: any) => (
          <Link
            key={post.id}
            href={`/admin/blog/${post.id}`}
            className="flex items-center gap-4 bg-champagne-dark hover:bg-champagne-darker rounded-xl p-4 transition-colors"
          >
            <FileText size={16} className="text-main shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="body-strong text-black truncate">{post.title_uk}</p>
              <p className="body-s text-black-40">
                {post.cat_title || 'No category'} · {post.author_name || 'No author'} · {post.published_at ? new Date(post.published_at).toLocaleDateString('uk-UA') : 'Draft'}
              </p>
            </div>
            {post.is_draft ? <EyeOff size={16} className="text-black-30 shrink-0" /> : <Eye size={16} className="text-main shrink-0" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
