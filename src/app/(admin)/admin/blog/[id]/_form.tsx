"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { savePost, deletePost } from "../_actions";
import MediaPicker from "../../_components/media-picker";
import { Search, AlertTriangle, ImageIcon, HelpCircle, ChevronDown, ChevronUp, Upload, X } from "lucide-react";
import faviconSrc from "@/app/android-chrome-192x192.png";

interface Props {
  post: any | null;
  categories: { id: string; title_uk: string }[];
  doctors: { id: string; name_uk: string }[];
  isNew: boolean;
}

const WORDS_PER_MIN = 200;
function calcReadTime(text: string) {
  return Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / WORDS_PER_MIN));
}

const inputCls = "w-full bg-champagne-dark rounded-lg px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-main outline-none";
const labelCls = "block text-xs font-semibold text-black-50 uppercase tracking-wider mb-1";

const MARKDOWN_GUIDE = [
  { syntax: "## Heading 2", desc: "Section title — appears in Table of Contents" },
  { syntax: "### Heading 3", desc: "Subsection — also in TOC, indented" },
  { syntax: "**bold**", desc: "Bold text" },
  { syntax: "*italic*", desc: "Italic text" },
  { syntax: "[Text](https://url)", desc: "Hyperlink" },
  { syntax: "![Alt](https://img-url)", desc: "Inline image — use 'Insert image' button" },
  { syntax: "> Callout text", desc: "Highlighted blockquote / tip" },
  { syntax: "- Item\\n- Item 2", desc: "Bullet list" },
  { syntax: "1. First\\n2. Second", desc: "Numbered list" },
  { syntax: "---", desc: "Horizontal divider — must be on its own empty line" },
];

// Inline SEO preview (Google SERP)
function SeoPreview({ title, desc, slug }: { title: string; desc: string; slug: string }) {
  const titleLen = title.length;
  const descLen = desc.length;
  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="bg-white rounded-2xl border border-line p-5">
        <div className="flex items-center gap-1.5 mb-3 text-[11px] font-medium text-black-40 uppercase tracking-wider">
          <Search size={11} /> Google search preview
        </div>
        <div className="max-w-[580px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-champagne-dark">
              <Image src={faviconSrc} alt="" width={20} height={20} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-[12px] text-[#202124] font-medium leading-none">GENEVITY</div>
              <div className="text-[11px] text-[#5f6368]">genevity.com.ua/blog/{slug || "post-slug"}</div>
            </div>
          </div>
          <p className={`text-[19px] leading-[24px] font-normal truncate ${titleLen > 60 ? "text-red-600" : "text-[#1a0dab]"}`}>
            {title || "Post title will appear here…"}
          </p>
          <p className="mt-1 text-[13px] leading-[20px] text-[#4d5156] line-clamp-2">
            {desc || <span className="italic text-[#9aa0a6]">No description — add one above</span>}
          </p>
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-black-40 border-t border-champagne-dark pt-3">
          <span className={titleLen > 60 ? "text-red-500 font-medium" : ""}>Title: {titleLen}/60{titleLen > 60 ? " ⚠️" : ""}</span>
          <span className={descLen > 155 ? "text-red-500 font-medium" : ""}>Desc: {descLen}/155{descLen > 155 ? " ⚠️" : ""}</span>
        </div>
      </div>
      {(!title || !desc) && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <span className="text-amber-700">{!title && !desc ? "Both title and description are empty." : !title ? "Title empty — Google will use the post title." : "Description empty — Google will auto-generate."}</span>
        </div>
      )}
    </div>
  );
}

export default function BlogPostForm({ post, categories, doctors, isNew }: Props) {
  const p = post || {};
  const readTimeRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const bodyRefUk = useRef<HTMLTextAreaElement>(null);
  const bodyRefRu = useRef<HTMLTextAreaElement>(null);
  const bodyRefEn = useRef<HTMLTextAreaElement>(null);
  const bodyRefs = { Uk: bodyRefUk, Ru: bodyRefRu, En: bodyRefEn };

  const [bodyUk, setBodyUk] = useState(p.body_uk || "");
  const [bodyRu, setBodyRu] = useState(p.body_ru || "");
  const [bodyEn, setBodyEn] = useState(p.body_en || "");
  const [slug, setSlug] = useState(p.slug || "");
  const [seoTitleUk, setSeoTitleUk] = useState(p.seo_title_uk || "");
  const [seoDescUk, setSeoDescUk] = useState(p.seo_desc_uk || "");
  const [coverPreview, setCoverPreview] = useState<string | null>(p.cover_image || null);
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);

  // All picker state lives HERE — avoids child component isolation issues
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [bodyPickerLang, setBodyPickerLang] = useState<"Uk" | "Ru" | "En" | null>(null);

  const bodyValues = { Uk: bodyUk, Ru: bodyRu, En: bodyEn };
  const bodySetters = { Uk: setBodyUk, Ru: setBodyRu, En: setBodyEn };

  function handleBodyChange(lang: "Uk" | "Ru" | "En", val: string) {
    bodySetters[lang](val);
    if (readTimeRef.current) readTimeRef.current.value = String(calcReadTime(val));
  }

  function insertImageAtCursor(lang: "Uk" | "Ru" | "En", md: string) {
    const ta = bodyRefs[lang].current;
    if (!ta) { handleBodyChange(lang, bodyValues[lang] + "\n\n" + md + "\n"); return; }
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const newVal = ta.value.slice(0, start) + "\n\n" + md + "\n\n" + ta.value.slice(end);
    handleBodyChange(lang, newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + md.length + 4, start + md.length + 4); }, 10);
  }

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  function clearCover() {
    setCoverPreview(null);
    if (coverFileRef.current) coverFileRef.current.value = "";
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

        {/* Status */}
        <div className="flex flex-wrap gap-4 items-center bg-champagne-dark rounded-xl p-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="radio" name="isDraft" value="false" defaultChecked={!p.is_draft} /> Published</label>
          <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="radio" name="isDraft" value="true" defaultChecked={p.is_draft !== false} /> Draft</label>
          <input type="datetime-local" name="publishedAt" defaultValue={p.published_at ? new Date(p.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)} className="ml-auto bg-white border border-line rounded-lg px-3 py-1.5 text-sm" />
        </div>

        {/* Slug + Category + Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Slug *</label>
            <input name="slug" value={slug} onChange={e => setSlug(e.target.value)} required className={inputCls} placeholder="my-article-slug" />
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
          <p className="text-xs font-semibold text-black-50 uppercase tracking-wider">Custom Author <span className="font-normal normal-case text-black-40">(overrides doctor when filled)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelCls}>Name</label><input name="authorName" defaultValue={p.author_name || ""} placeholder="Dr. Іванова Марія" className={inputCls} /></div>
            <div><label className={labelCls}>Avatar URL</label><input name="authorAvatar" defaultValue={p.author_avatar || ""} placeholder="https://..." className={inputCls} /></div>
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["Uk", "Ru", "En"] as const).map(lang => (
            <div key={lang}><label className={labelCls}>Title {lang}</label><input name={`title${lang}`} defaultValue={p[`title_${lang.toLowerCase()}`] || ""} className={inputCls} /></div>
          ))}
        </div>

        {/* Cover image */}
        <div>
          <label className={labelCls}>Cover Image <span className="font-normal normal-case text-black-40">— 16:9 recommended, shown as full-width hero stripe</span></label>
          <div className="flex flex-wrap gap-4 items-start">
            {/* Preview */}
            {coverPreview ? (
              <div className="relative w-48 aspect-video rounded-xl overflow-hidden bg-champagne-dark shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                <button type="button" onClick={clearCover} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                  <X size={12} />
                </button>
                {/* Preserve current URL when no new file picked */}
                {!coverPreview.startsWith("blob:") && <input type="hidden" name="coverImage_current" value={coverPreview} />}
              </div>
            ) : (
              <div className="w-48 aspect-video rounded-xl border-2 border-dashed border-line bg-champagne-dark flex items-center justify-center text-black-40 shrink-0">
                <span className="text-xs">No cover</span>
              </div>
            )}
            {/* Actions */}
            <div className="flex flex-col gap-2 mt-1">
              <button type="button" onClick={() => coverFileRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-champagne-dark hover:bg-champagne-darker text-sm transition-colors">
                <Upload size={13} /> Upload file
              </button>
              <button type="button" onClick={() => setCoverPickerOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-champagne-dark hover:bg-champagne-darker text-sm transition-colors">
                <ImageIcon size={13} /> Pick from library
              </button>
              <input ref={coverFileRef} type="file" name="coverImage" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
            </div>
          </div>
        </div>

        {/* Cover picker — state lives in parent form */}
        <MediaPicker
          open={coverPickerOpen}
          onClose={() => setCoverPickerOpen(false)}
          onPick={(url) => { setCoverPreview(url); setCoverPickerOpen(false); }}
          preferredFolder="blog"
        />
        {/* Hidden field so server knows the library URL when no new file */}
        {coverPreview && !coverPreview.startsWith("blob:") && (
          <input type="hidden" name="coverImage_current" value={coverPreview} />
        )}

        {/* Read time */}
        <div className="w-40">
          <label className={labelCls}>Read time (min) <span className="font-normal normal-case text-black-40">auto-updates</span></label>
          <input ref={readTimeRef} type="number" name="readTimeMinutes" defaultValue={p.read_time_minutes || 5} min={1} max={120} className={inputCls} />
        </div>

        {/* Excerpts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["Uk", "Ru", "En"] as const).map(lang => (
            <div key={lang}>
              <label className={labelCls}>Excerpt {lang} <span className="font-normal normal-case text-black-40">listing page</span></label>
              <textarea name={`excerpt${lang}`} rows={3} defaultValue={p[`excerpt_${lang.toLowerCase()}`] || ""} className={`${inputCls} resize-y`} placeholder="1–2 sentence description…" />
            </div>
          ))}
        </div>

        {/* Markdown guide */}
        <button type="button" onClick={() => setShowMarkdownGuide(v => !v)} className="flex items-center gap-2 text-sm text-black-50 hover:text-black transition-colors self-start">
          <HelpCircle size={14} /> Markdown formatting guide {showMarkdownGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {showMarkdownGuide && (
          <div className="bg-champagne-dark rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {MARKDOWN_GUIDE.map(({ syntax, desc }) => (
              <div key={syntax} className="flex gap-3 items-baseline py-1.5 border-b border-black-10 last:border-0">
                <code className="text-xs font-mono bg-white/80 px-2 py-0.5 rounded shrink-0 text-main whitespace-nowrap">{syntax}</code>
                <span className="text-xs text-black-50">{desc}</span>
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
                <button type="button" onClick={() => setBodyPickerLang(lang)} className="inline-flex items-center gap-1.5 text-xs text-main hover:opacity-75 transition-opacity">
                  <ImageIcon size={12} /> Insert image
                </button>
                <span className="text-xs text-black-40">{calcReadTime(bodyValues[lang])} min · {bodyValues[lang].trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
            <textarea
              ref={bodyRefs[lang]}
              name={`body${lang}`}
              rows={20}
              value={bodyValues[lang]}
              onChange={e => handleBodyChange(lang, e.target.value)}
              className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
              placeholder={"## Introduction\n\nStart your article here. ## creates section headings for the Table of Contents.\n\n### Subsection\n\nParagraph text here.\n\n> Tip or callout\n\n- Bullet point\n\nUse the 'Insert image' button to embed photos."}
            />
          </div>
        ))}

        {/* Body image picker — single instance, state in parent */}
        <MediaPicker
          open={bodyPickerLang !== null}
          onClose={() => setBodyPickerLang(null)}
          onPick={(url) => {
            if (bodyPickerLang) insertImageAtCursor(bodyPickerLang, `![Image description](${url})`);
            setBodyPickerLang(null);
          }}
          preferredFolder="blog"
        />

        {/* Tags */}
        <div>
          <label className={labelCls}>Tags <span className="font-normal normal-case text-black-40">comma-separated</span></label>
          <input name="tags" defaultValue={(p.tags || []).join(", ")} placeholder="ботокс, контурна пластика, омолодження" className={inputCls} />
        </div>

        {/* SEO */}
        <details className="bg-champagne-dark rounded-xl p-5">
          <summary className="text-sm font-semibold cursor-pointer flex items-center gap-2">
            <Search size={14} /> SEO — title, description & live Google preview
          </summary>
          <div className="mt-5 flex flex-col gap-4">
            {(["Uk", "Ru", "En"] as const).map(lang => (
              <div key={lang} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>SEO Title {lang} <span className="font-normal normal-case text-black-40">max 60 chars</span></label>
                  <input name={`seoTitle${lang}`} defaultValue={p[`seo_title_${lang.toLowerCase()}`] || ""} onChange={lang === "Uk" ? e => setSeoTitleUk(e.target.value) : undefined} className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line focus:ring-1 focus:ring-main outline-none" placeholder="Shorter than browser tab title…" />
                </div>
                <div>
                  <label className={labelCls}>SEO Description {lang} <span className="font-normal normal-case text-black-40">max 155 chars</span></label>
                  <textarea name={`seoDesc${lang}`} rows={2} defaultValue={p[`seo_desc_${lang.toLowerCase()}`] || ""} onChange={lang === "Uk" ? e => setSeoDescUk(e.target.value) : undefined} className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-line focus:ring-1 focus:ring-main outline-none resize-none" placeholder="What Google shows below the title in search results…" />
                </div>
              </div>
            ))}
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
