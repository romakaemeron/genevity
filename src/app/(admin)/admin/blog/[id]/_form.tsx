"use client";
import { savePost, deletePost } from "../_actions";

interface Props {
  post: any | null;
  categories: { id: string; title_uk: string }[];
  doctors: { id: string; name_uk: string }[];
  isNew: boolean;
}

export default function BlogPostForm({ post, categories, doctors, isNew }: Props) {
  const p = post || {};

  return (
    <div className="p-8 max-w-4xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{isNew ? 'New Post' : 'Edit Post'}</h1>
        {!isNew && (
          <button
            type="button"
            onClick={() => { if (confirm('Delete this post?')) deletePost(p.id); }}
            className="text-sm text-red-500 hover:text-red-600"
          >Delete</button>
        )}
      </div>

      <form action={savePost} className="flex flex-col gap-6">
        {!isNew && <input type="hidden" name="id" value={p.id} />}

        {/* Status */}
        <div className="flex gap-4 items-center bg-champagne-dark rounded-xl p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="isDraft" value="false" defaultChecked={!p.is_draft} /> Published
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="isDraft" value="true" defaultChecked={p.is_draft !== false} /> Draft
          </label>
          <input
            type="datetime-local"
            name="publishedAt"
            defaultValue={p.published_at ? new Date(p.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
            className="ml-auto bg-white border border-line rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {/* Slug + Category + Author */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input name="slug" defaultValue={p.slug || ''} required className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-main" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="categoryId" defaultValue={p.category_id || ''} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0">
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.title_uk}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author (Doctor)</label>
            <select name="authorId" defaultValue={p.author_id || ''} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0">
              <option value="">None</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name_uk}</option>)}
            </select>
          </div>
        </div>

        {/* Titles */}
        {(['Uk', 'Ru', 'En'] as const).map(lang => (
          <div key={lang}>
            <label className="block text-sm font-medium mb-1">Title {lang}</label>
            <input name={`title${lang}`} defaultValue={p[`title_${lang.toLowerCase()}`] || ''} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0" />
          </div>
        ))}

        {/* Cover image + read time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image URL</label>
            <input name="coverImage" defaultValue={p.cover_image || ''} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Read time (min)</label>
            <input type="number" name="readTimeMinutes" defaultValue={p.read_time_minutes || 5} min={1} max={60} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0" />
          </div>
        </div>

        {/* Excerpts */}
        {(['Uk', 'Ru', 'En'] as const).map(lang => (
          <div key={lang}>
            <label className="block text-sm font-medium mb-1">Excerpt {lang}</label>
            <textarea name={`excerpt${lang}`} rows={2} defaultValue={p[`excerpt_${lang.toLowerCase()}`] || ''} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0 resize-y" />
          </div>
        ))}

        {/* Bodies (markdown) */}
        {(['Uk', 'Ru', 'En'] as const).map(lang => (
          <div key={lang}>
            <label className="block text-sm font-medium mb-1">Body {lang} (Markdown)</label>
            <textarea name={`body${lang}`} rows={12} defaultValue={p[`body_${lang.toLowerCase()}`] || ''} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0 resize-y font-mono" />
          </div>
        ))}

        {/* SEO */}
        <details className="bg-champagne-dark rounded-xl p-4">
          <summary className="text-sm font-medium cursor-pointer">SEO</summary>
          <div className="mt-4 flex flex-col gap-3">
            {(['Uk', 'Ru', 'En'] as const).map(lang => (
              <div key={lang} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name={`seoTitle${lang}`} placeholder={`SEO Title ${lang}`} defaultValue={p[`seo_title_${lang.toLowerCase()}`] || ''} className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line" />
                <input name={`seoDesc${lang}`} placeholder={`SEO Desc ${lang}`} defaultValue={p[`seo_desc_${lang.toLowerCase()}`] || ''} className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line" />
              </div>
            ))}
          </div>
        </details>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
          <input name="tags" defaultValue={(p.tags || []).join(', ')} className="w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0" />
        </div>

        <button type="submit" className="self-start bg-main text-champagne px-6 py-2.5 rounded-[var(--radius-button)] text-sm font-medium hover:bg-main/90 transition-colors">
          {isNew ? 'Create Post' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
