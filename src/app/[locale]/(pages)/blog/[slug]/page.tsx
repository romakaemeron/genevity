import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/db/queries/blog";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import ArticleBody, { parseMarkdown } from "@/components/blog/ArticleBody";
import TableOfContents from "@/components/blog/TableOfContents";
import BlogTocBar from "@/components/blog/BlogTocBar";
import BlogCard from "@/components/blog/BlogCard";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import Image from "next/image";

export const revalidate = 60;

export async function generateStaticParams() {
  const { getAllBlogSlugs } = await import("@/lib/db/queries/blog");
  const slugs = await getAllBlogSlugs();
  return slugs.flatMap(slug => [
    { locale: "ua", slug },
    { locale: "ru", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(locale, slug);
  if (!post) return {};
  return generatePageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt || "",
    ogImage: post.ogImage || post.coverImage || undefined,
    locale: locale as Locale,
    path: `/blog/${slug}`,
  });
}

const L = {
  ua: { toc: "Зміст", back: "До блогу", related: "Читайте також", read: "хв читання", by: "Автор" },
  ru: { toc: "Содержание", back: "К блогу", related: "Читайте также", read: "мин чтения", by: "Автор" },
  en: { toc: "Contents", back: "Back to blog", related: "Read also", read: "min read", by: "Author" },
};

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(locale, slug);
  if (!post) notFound();

  const l = L[locale as keyof typeof L] ?? L.ua;
  const related = await getRelatedBlogPosts(locale, post._id, post.categorySlug ?? null, 3);
  const html = post.body ? parseMarkdown(post.body) : "";
  const localePrefix = locale === "ua" ? "" : `/${locale}`;
  const articleUrl = `https://genevity.com.ua${localePrefix}/blog/${slug}`;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(
        locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      )
    : "";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    url: articleUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    ...(post.coverImage ? { image: post.coverImage.startsWith("http") ? post.coverImage : `https://genevity.com.ua${post.coverImage}` } : {}),
    author: post.authorName
      ? { "@type": "Person", name: post.authorName, ...(post.authorSlug ? { url: `https://genevity.com.ua${localePrefix}/doctors/${post.authorSlug}` } : {}) }
      : { "@type": "Organization", name: "GENEVITY" },
    publisher: { "@type": "Organization", name: "GENEVITY", logo: { "@type": "ImageObject", url: "https://genevity.com.ua/brand/LogoFullDark.svg" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  return (
    <>
      <JsonLd data={articleSchema as Record<string, unknown>} />
      <JsonLdBreadcrumbList items={[
        { name: "GENEVITY", url: "https://genevity.com.ua/" },
        { name: "Блог", url: `https://genevity.com.ua${localePrefix}/blog` },
        { name: post.title, url: articleUrl },
      ]} />
      <MegaMenuHeader variant="solid" position="fixed" />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      {post.coverImage ? (
        /* Cover image: full-width stripe with gradient overlay + title */
        <div className="relative w-full h-[60vh] min-h-[380px] max-h-[620px] overflow-hidden">
          <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
          {/* Back link */}
          <div className="absolute top-0 left-0 right-0 pt-28 px-4 sm:px-6 lg:px-12 max-w-[var(--container-max)] mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> {l.back}
            </Link>
          </div>
          {/* Title + meta */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-12 pb-10 max-w-[var(--container-max)] mx-auto">
            {post.categoryTitle && (
              <Link href={`/blog?category=${post.categorySlug}`} className="text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white mb-3 block transition-colors">
                {post.categoryTitle}
              </Link>
            )}
            <h1 className="heading-1 text-white mb-5 max-w-3xl text-balance">{post.title}</h1>
            <PostMeta post={post} locale={localePrefix} formattedDate={formattedDate} readLabel={l.read} light />
          </div>
        </div>
      ) : (
        /* No cover: champagne header with title */
        <div className="bg-champagne pt-28 pb-10 border-b border-black-10">
          <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-black-40 hover:text-main transition-colors text-sm mb-6">
              <ArrowLeft className="w-3.5 h-3.5" /> {l.back}
            </Link>
            {post.categoryTitle && (
              <Link href={`/blog?category=${post.categorySlug}`} className="text-xs font-semibold uppercase tracking-widest text-main mb-3 block">
                {post.categoryTitle}
              </Link>
            )}
            <h1 className="heading-1 text-black mb-6 max-w-3xl text-balance">{post.title}</h1>
            <PostMeta post={post} locale={localePrefix} formattedDate={formattedDate} readLabel={l.read} />
          </div>
        </div>
      )}

      {/* ─── MOBILE TOC BAR ────────────────────────────────────────────── */}
      {html && <BlogTocBar html={html} label={l.toc} />}

      {/* ─── ARTICLE + DESKTOP TOC SIDEBAR ─────────────────────────────── */}
      <div className="bg-champagne py-12 lg:py-16">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 lg:gap-16 items-start">

            {/* Article */}
            <article className="min-w-0">
              {post.excerpt && (
                <p className="body-l text-black-60 leading-relaxed mb-10 pb-10 border-b border-black-10">{post.excerpt}</p>
              )}
              {html && <ArticleBody html={html} />}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-black-10">
                  <Tag className="w-3.5 h-3.5 text-black-40 mt-0.5 shrink-0" />
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-champagne-dark text-black-60 border border-champagne-darker">{tag}</span>
                  ))}
                </div>
              )}

              {/* Author card */}
              {post.authorName && (
                <div className="mt-10 pt-8 border-t border-black-10">
                  <AuthorCard name={post.authorName} slug={post.authorSlug} avatar={post.authorAvatar} locale={localePrefix} label={l.by} />
                </div>
              )}
            </article>

            {/* Desktop TOC sidebar */}
            <aside className="hidden lg:block sticky top-28 self-start">
              {html && <TableOfContents html={html} labels={{ title: l.toc }} />}
            </aside>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mt-20 pt-10 border-t border-black-10">
              <h2 className="heading-3 text-black mb-8">{l.related}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(p => <BlogCard key={p._id} post={p} locale={locale} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

/* ── shared sub-components ─────────────────────────────────────────────── */

function PostMeta({ post, locale, formattedDate, readLabel, light }: {
  post: { authorName: string | null; authorSlug: string | null; authorAvatar: string | null; publishedAt: string; readTimeMinutes: number };
  locale: string; formattedDate: string; readLabel: string; light?: boolean;
}) {
  const text = light ? "text-white/70 hover:text-white" : "text-black-50 hover:text-main";
  return (
    <div className="flex flex-wrap items-center gap-4">
      {post.authorName && (
        <span className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${light ? "text-white/80" : "text-black-70"}`}>
          <AvatarCircle name={post.authorName} avatar={post.authorAvatar} size={7} />
          {post.authorSlug
            ? <Link href={`${locale}/doctors/${post.authorSlug}`} className={light ? "hover:text-white" : "hover:text-main"}>{post.authorName}</Link>
            : post.authorName}
        </span>
      )}
      <span className={`flex items-center gap-1.5 text-sm ${light ? "text-white/60" : "text-black-40"}`}>
        <Calendar className="w-3.5 h-3.5" />{formattedDate}
      </span>
      <span className={`flex items-center gap-1.5 text-sm ${light ? "text-white/60" : "text-black-40"}`}>
        <Clock className="w-3.5 h-3.5" />{post.readTimeMinutes} {readLabel}
      </span>
    </div>
  );
}

function AvatarCircle({ name, avatar, size = 7 }: { name: string; avatar: string | null; size?: number }) {
  const s = `w-${size} h-${size}`;
  if (avatar) return <span className={`${s} rounded-full overflow-hidden shrink-0`}><img src={avatar} alt={name} className="w-full h-full object-cover" /></span>;
  return <span className={`${s} rounded-full bg-main/15 flex items-center justify-center text-xs font-semibold text-main shrink-0`}>{name.charAt(0).toUpperCase()}</span>;
}

function AuthorCard({ name, slug, avatar, locale, label }: { name: string; slug: string | null; avatar: string | null; locale: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <AvatarCircle name={name} avatar={avatar} size={12} />
      <div>
        <p className="text-xs text-black-40 mb-0.5">{label}</p>
        {slug
          ? <Link href={`${locale}/doctors/${slug}`} className="body-strong text-black hover:text-main transition-colors">{name}</Link>
          : <p className="body-strong text-black">{name}</p>}
      </div>
    </div>
  );
}
