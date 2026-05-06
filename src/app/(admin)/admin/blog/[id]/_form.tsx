"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { savePost, deletePost } from "../_actions";
import MediaPicker from "../../_components/media-picker";
import ImageUpload from "../../_components/image-upload";
import { Search, AlertTriangle, ImageIcon, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import faviconSrc from "@/app/android-chrome-192x192.png";

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

const MARKDOWN_GUIDE = [
  { syntax: "## Heading 2", desc: "Section title (appears in Table of Contents)" },
  { syntax: "### Heading 3", desc: "Subsection (also in TOC, indented)" },
  { syntax: "**bold text**", desc: "Bold" },
  { syntax: "*italic text*", desc: "Italic" },
  { syntax: "[Link text](https://...)", desc: "Hyperlink" },
  { syntax: "![Alt text](https://image-url)", desc: "Inline image (use 'Pick image' button)" },
  { syntax: "> Blockquote text", desc: "Highlighted callout / quote" },
  { syntax: "- Item 1\\n- Item 2", desc: "Bullet list" },
  { syntax: "1. First\\n2. Second", desc: "Numbered list" },
  { syntax: "---", desc: "Horizontal divider line" },
  { syntax: "`inline code`", desc: "Inline monospace code" },
];

// SEO Preview component
function SeoPreview({ title, desc, slug }: { title: string; desc: string; slug: string }) {
  const previewTitle = title || "Blog post title…";
  const previewDesc = desc || "";
  const url = `https://genevity.com.ua/blog/${slug || "post-slug"}`;
  const titleLen = title.length;
  const descLen = desc.length;

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Google SERP */}
      <div className="bg-white rounded-2xl border border-line p-5">
        <div className="flex items-center gap-1.5 mb-3 text-[11px] font-medium text-black-40 uppercase tracking-wider">
          <Search size={11} /> Google search preview
        </div>
        <div className="max-w-[580px]">
          <div className="flex items-center gap-2 text-xs text-[#202124]">
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-champagne-dark">
              <Image src={faviconSrc} alt="" width={20} height={20} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[#202124] font-medium">GENEVITY</span>
              <span className="text-[11px] text-[#5f6368] truncate max-w-[400px]">{url}</span>
            </div>
          </div>
          <p className={`mt-1.5 text-[19px] leading-[24px] font-normal hover:underline cursor-default truncate ${titleLen > 60 ? "text-red-600" : "text-[#1a0dab]"}`}>
            {previewTitle}
          </p>
          <p className="mt-1 text-[13px] leading-[20px] text-[#4d5156] line-clamp-2">
            {previewDesc || <span className="italic text-[#9aa0a6]">(no description — add one above)</span>}
          </p>
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-black-40 border-t border-champagne-dark pt-3">
          <span className={titleLen > 60 ? "text-red-500 font-medium" : ""}>Title: {titleLen}/60 chars{titleLen > 60 ? " ⚠️ too long" : ""}</span>
          <span className={descLen > 155 ? "text-red-500 font-medium" : ""}>Description: {descLen}/155 chars{descLen > 155 ? " ⚠️ too long" : ""}</span>
        </div>
      </div>

      {/* Warning if empty */}
      {(!title || !desc) && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm">
          <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
          <span className="text-amber-700">
            {!title && !desc ? "Both SEO title and description are empty — Google will auto-generate them from content." :
             !title ? "SEO title is empty — Google will use the post title." :
             "SEO description is empty — Google will pull a snippet from the article."}
          </span>
        </div>
      )}
    </div>
  );
}

// Body image picker — inserts markdown at cursor
function BodyImageButton({ onInsert }: { onInsert: (md: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-main hover:opacity-75 transition-opacity"
      >
        <ImageIcon size={12} /> Insert image
      </button>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(url) => {
          onInsert(`![Image description](${url})`);
          setOpen(false);
        }}
        preferredFolder="blog"
      />
    </>
  );
}

export default function BlogPostForm({ post, categories, doctors, isNew }: Props) {
  const p = post || {};
  const readTimeRef = useRef<HTMLInputElement>(null);
  const bodyRefs = { Uk: useRef<HTMLTextAreaElement>(null), Ru: useRef<HTMLTextAreaElement>(null), En: useRef<HTMLTextAreaElement>(null) };

  const [bodyUk, setBodyUk] = useState(p.body_uk || "");
  const [bodyRu, setBodyRu] = useState(p.body_ru || "");
  const [bodyEn, setBodyEn] = useState(p.body_en || "");
  const [coverUrl, setCoverUrl] = useState<string | null>(p.cover_image || null);
  const [seoTitleUk, setSeoTitleUk] = useState(p.seo_title_uk || "");
  const [seoDescUk, setSeoDescUk] = useState(p.seo_desc_uk || "");
  const [slug, setSlug] = useState(p.slug || "");
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);

  const bodyValues = { Uk: bodyUk, Ru: bodyRu, En: bodyEn };
  const bodySetters = { Uk: setBodyUk, Ru: setBodyRu, En: setBodyEn };

  function handleBodyChange(lang: "Uk" | "Ru" | "En", val: string) {
    bodySetters[lang](val);
    if (readTimeRef.current) {
      readTimeRef.current.value = String(calcReadTime(val));
    }
  }

  function insertImageIntoBody(lang: "Uk" | "Ru" | "En", md: string) {
    const ta = bodyRefs[lang].current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const newVal = ta.value.slice(0, start) + "\n\n" + md + "\n\n" + ta.value.slice(end);
    handleBodyChange(lang, newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + md.length + 4, start + md.length + 4); }, 10);
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{isNew ? "New Post" : "Edit Post"}</h1>
        {!isNew && (
          <button type="button" onClick={() => { if (confirm("Delete this post?")) deletePost(p.id); }} className="text-sm text-red-500 hover:text-red-600">
            Delete
          </button>
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

        {/* Slug + Category + Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Slug *</label>
            <input name="slug" value={slug} onChange={e => setSlug(e.target.value)} required className={inputCls} placeholder="my-article-title" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select name="categoryId" defaultValue={p.category_id || ""} className={inputCls}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.title_uk}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Doctor Author</label>
            <select name="authorId" defaultValue={p.author_id || ""} className={inputCls}>
              <option value="">— Custom / None —</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name_uk}</option>)}
            </select>
          </div>
        </div>

        {/* Custom author */}
        <div className="bg-champagne-dark rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-black-50 uppercase tracking-wider">
            Custom Author <span className="font-normal normal-case text-black-40">(overrides doctor selection when filled)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Author Name</label>
              <input name="authorName" defaultValue={p.author_name || ""} placeholder="e.g. Dr. Іванова Марія" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Author Avatar URL</label>
              <input name="authorAvatar" defaultValue={p.author_avatar || ""} placeholder="https://..." className={inputCls} />
            </div>
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["Uk", "Ru", "En"] as const).map(lang => (
            <div key={lang}>
              <label className={labelCls}>Title {lang}</label>
              <input name={`title${lang}`} defaultValue={p[`title_${lang.toLowerCase()}`] || ""} className={inputCls} />
            </div>
          ))}
        </div>

        {/* Cover image + read time */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-6 items-start">
          <div>
            <label className={labelCls}>Cover Image <span className="font-normal normal-case text-black-40">— 16:9 recommended, shown as full-width hero</span></label>
            <ImageUpload
              name="coverImage"
              label="Cover image"
              currentUrl={coverUrl}
              aspect="aspect-[16/9]"
              onUrlChange={setCoverUrl}
              pickerFolder="blog"
              clientMaxDim={2400}
            />
            {/* Fallback hidden URL input so server knows current if no new file */}
            {coverUrl && !coverUrl.startsWith("blob:") && (
              <input type="hidden" name="coverImage_current" value={coverUrl} />
            )}
          </div>
          <div>
            <label className={labelCls}>Read time (min) <span className="font-normal normal-case text-black-40">auto-updates</span></label>
            <input ref={readTimeRef} type="number" name="readTimeMinutes" defaultValue={p.read_time_minutes || 5} min={1} max={120} className={inputCls} />
          </div>
        </div>

        {/* Excerpts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["Uk", "Ru", "En"] as const).map(lang => (
            <div key={lang}>
              <label className={labelCls}>Excerpt {lang} <span className="font-normal normal-case text-black-40">— shown on listing page</span></label>
              <textarea name={`excerpt${lang}`} rows={3} defaultValue={p[`excerpt_${lang.toLowerCase()}`] || ""} className={`${inputCls} resize-y`} placeholder="Short description, 1–2 sentences…" />
            </div>
          ))}
        </div>

        {/* Markdown guide toggle */}
        <button type="button" onClick={() => setShowMarkdownGuide(v => !v)} className="flex items-center gap-2 text-sm text-black-50 hover:text-black transition-colors self-start">
          <HelpCircle size={14} />
          Markdown formatting guide
          {showMarkdownGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {showMarkdownGuide && (
          <div className="bg-champagne-dark rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MARKDOWN_GUIDE.map(({ syntax, desc }) => (
              <div key={syntax} className="flex gap-3 items-start py-1.5 border-b border-black-10 last:border-0 sm:last:border-0">
                <code className="text-xs font-mono bg-white/70 px-2 py-1 rounded shrink-0 text-main">{syntax}</code>
                <span className="text-xs text-black-50 mt-1">{desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bodies */}
        {(["Uk", "Ru", "En"] as const).map(lang => (
          <div key={lang}>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls}>Article body {lang} — Markdown</label>
              <div className="flex items-center gap-4">
                <BodyImageButton onInsert={(md) => insertImageIntoBody(lang, md)} />
                <span className="text-xs text-black-40">
                  {calcReadTime(bodyValues[lang])} min · {bodyValues[lang].trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
            <textarea
              ref={bodyRefs[lang]}
              name={`body${lang}`}
              rows={20}
              value={bodyValues[lang]}
              onChange={e => handleBodyChange(lang, e.target.value)}
              className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
              placeholder={"## Introduction\n\nStart your article here. Use ## for section headings which will appear in the Table of Contents.\n\n### A subsection\n\nRegular paragraph text.\n\n> A callout or quote looks like this\n\n- Bullet point one\n- Bullet point two\n\nUse the 'Insert image' button above to embed photos in the article."}
            />
          </div>
        ))}

        {/* Tags */}
        <div>
          <label className={labelCls}>Tags <span className="font-normal normal-case text-black-40">comma-separated</span></label>
          <input name="tags" defaultValue={(p.tags || []).join(", ")} placeholder="ботокс, контурна пластика, омолодження" className={inputCls} />
        </div>

        {/* SEO */}
        <details className="bg-champagne-dark rounded-xl p-5">
          <summary className="text-sm font-semibold cursor-pointer flex items-center gap-2">
            <Search size={14} /> SEO — title, description & Google preview
          </summary>
          <div className="mt-5 flex flex-col gap-5">
            {(["Uk", "Ru", "En"] as const).map(lang => (
              <div key={lang} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>SEO Title {lang}</label>
                  <input
                    name={`seoTitle${lang}`}
                    defaultValue={p[`seo_title_${lang.toLowerCase()}`] || ""}
                    onChange={lang === "Uk" ? e => setSeoTitleUk(e.target.value) : undefined}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line focus:ring-1 focus:ring-main outline-none"
                    placeholder="60 chars max"
                  />
                </div>
                <div>
                  <label className={labelCls}>SEO Description {lang}</label>
                  <textarea
                    name={`seoDesc${lang}`}
                    rows={2}
                    defaultValue={p[`seo_desc_${lang.toLowerCase()}`] || ""}
                    onChange={lang === "Uk" ? e => setSeoDescUk(e.target.value) : undefined}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line focus:ring-1 focus:ring-main outline-none resize-none"
                    placeholder="155 chars max — what appears below the title in Google"
                  />
                </div>
              </div>
            ))}

            {/* Live SEO preview (UA locale) */}
            <SeoPreview title={seoTitleUk} desc={seoDescUk} slug={slug} />
          </div>
        </details>

        <button type="submit" className="self-start bg-main text-champagne px-8 py-3 rounded-[var(--radius-button)] text-sm font-medium hover:bg-main/90 transition-colors">
          {isNew ? "Create Post" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
