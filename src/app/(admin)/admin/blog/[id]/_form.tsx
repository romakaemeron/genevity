"use client";
import { useRef, useState } from "react";
import { savePost, deletePost } from "../_actions";

interface Props {
  post: any | null;
  categories: { id: string; title_uk: string }[];
  doctors: { id: string; name_uk: string }[];
  isNew: boolean;
}

const WORDS_PER_MIN = 200;

function calcReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MIN));
}

const inputCls = "w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-main outline-none";
const labelCls = "block text-xs font-semibold text-black-50 uppercase tracking-wider mb-1";

export default function BlogPostForm({ post, categories, doctors, isNew }: Props) {
  const p = post || {};
  const readTimeRef = useRef<HTMLInputElement>(null);
  const [bodyUk, setBodyUk] = useState(p.body_uk || '');
  const [bodyRu, setBodyRu] = useState(p.body_ru || '');
  const [bodyEn, setBodyEn] = useState(p.body_en || '');

  function handleBodyChange(lang: 'Uk' | 'Ru' | 'En', val: string) {
    if (lang === 'Uk') setBodyUk(val);
    if (lang === 'Ru') setBodyRu(val);
    if (lang === 'En') setBodyEn(val);
    if (readTimeRef.current) {
      const primaryBody = lang === 'Uk' ? val : lang === 'Ru' ? val : val;
      readTimeRef.current.value = String(calcReadTime(primaryBody));
    }
  }

  const bodyValues = { Uk: bodyUk, Ru: bodyRu, En: bodyEn };

  return (
    <div className="p-6 lg:p-8 max-w-5xl flex flex-col gap-6">
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

        {/* Status bar */}
        <div className="flex flex-wrap gap-4 items-center bg-champagne-dark rounded-xl p-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="isDraft" value="false" defaultChecked={!p.is_draft} /> Published
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="isDraft" value="true" defaultChecked={p.is_draft !== false} /> Draft
          </label>
          <input
            type="datetime-local"
            name="publishedAt"
            defaultValue={p.published_at ? new Date(p.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
            className="ml-auto bg-white border border-line rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {/* Slug + Category + Doctor author */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Slug *</label>
            <input name="slug" defaultValue={p.slug || ''} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select name="categoryId" defaultValue={p.category_id || ''} className={inputCls}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.title_uk}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Doctor Author</label>
            <select name="authorId" defaultValue={p.author_id || ''} className={inputCls}>
              <option value="">— Custom / None —</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name_uk}</option>)}
            </select>
          </div>
        </div>

        {/* Custom author (shown when no doctor selected) */}
        <div className="bg-champagne-dark rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-black-50 uppercase tracking-wider">Custom Author <span className="font-normal normal-case">(overrides doctor if filled)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Author Name</label>
              <input name="authorName" defaultValue={p.author_name || ''} placeholder="e.g. Dr. Іванова Марія" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Author Avatar URL</label>
              <input name="authorAvatar" defaultValue={p.author_avatar || ''} placeholder="https://..." className={inputCls} />
            </div>
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['Uk', 'Ru', 'En'] as const).map(lang => (
            <div key={lang}>
              <label className={labelCls}>Title {lang}</label>
              <input name={`title${lang}`} defaultValue={p[`title_${lang.toLowerCase()}`] || ''} className={inputCls} />
            </div>
          ))}
        </div>

        {/* Cover image + read time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Cover Image URL</label>
            <input name="coverImage" defaultValue={p.cover_image || ''} placeholder="https://... (16:9 recommended)" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Read time (min) <span className="font-normal normal-case text-black-40">— auto-updates</span></label>
            <input ref={readTimeRef} type="number" name="readTimeMinutes" defaultValue={p.read_time_minutes || 5} min={1} max={120} className={inputCls} />
          </div>
        </div>

        {/* Excerpts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['Uk', 'Ru', 'En'] as const).map(lang => (
            <div key={lang}>
              <label className={labelCls}>Excerpt {lang}</label>
              <textarea name={`excerpt${lang}`} rows={3} defaultValue={p[`excerpt_${lang.toLowerCase()}`] || ''} className={`${inputCls} resize-y`} placeholder="Short description for listing pages..." />
            </div>
          ))}
        </div>

        {/* Bodies */}
        {(['Uk', 'Ru', 'En'] as const).map(lang => (
          <div key={lang}>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Body {lang} — Markdown</label>
              <span className="text-xs text-black-40">
                {calcReadTime(bodyValues[lang])} min read · {bodyValues[lang].trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <div className="text-xs text-black-40 mb-1.5">
              ## Heading 2 &nbsp;·&nbsp; ### Heading 3 &nbsp;·&nbsp; **bold** &nbsp;·&nbsp; *italic* &nbsp;·&nbsp; [link](url) &nbsp;·&nbsp; ![alt](image-url) &nbsp;·&nbsp; &gt; blockquote &nbsp;·&nbsp; --- (divider)
            </div>
            <textarea
              name={`body${lang}`}
              rows={18}
              value={bodyValues[lang]}
              onChange={e => handleBodyChange(lang, e.target.value)}
              className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
              placeholder={"## Introduction\n\nWrite your article here...\n\n### Key Points\n\n- Point 1\n- Point 2\n\n![Image alt](https://...)"}
            />
          </div>
        ))}

        {/* Tags */}
        <div>
          <label className={labelCls}>Tags (comma-separated)</label>
          <input name="tags" defaultValue={(p.tags || []).join(', ')} placeholder="ботокс, контурна пластика, омолодження" className={inputCls} />
        </div>

        {/* SEO */}
        <details className="bg-champagne-dark rounded-xl p-4">
          <summary className="text-sm font-semibold cursor-pointer">SEO fields</summary>
          <div className="mt-4 flex flex-col gap-3">
            {(['Uk', 'Ru', 'En'] as const).map(lang => (
              <div key={lang} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>SEO Title {lang}</label>
                  <input name={`seoTitle${lang}`} defaultValue={p[`seo_title_${lang.toLowerCase()}`] || ''} className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line" />
                </div>
                <div>
                  <label className={labelCls}>SEO Description {lang}</label>
                  <input name={`seoDesc${lang}`} defaultValue={p[`seo_desc_${lang.toLowerCase()}`] || ''} className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line" />
                </div>
              </div>
            ))}
          </div>
        </details>

        <button type="submit" className="self-start bg-main text-champagne px-8 py-3 rounded-[var(--radius-button)] text-sm font-medium hover:bg-main/90 transition-colors">
          {isNew ? 'Create Post' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
