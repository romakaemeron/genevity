import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/db/queries/blog";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import ArticleBody, { parseMarkdown } from "@/components/blog/ArticleBody";
import TableOfContents from "@/components/blog/TableOfContents";
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
    { locale: 'ua', slug },
    { locale: 'ru', slug },
    { locale: 'en', slug },
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(locale, slug);
  if (!post) return {};
  return generatePageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt || '',
    ogImage: post.ogImage || post.coverImage || undefined,
    locale: locale as Locale,
    path: `/blog/${slug}`,
  });
}

const L = {
  ua: { toc: 'Зміст', back: 'До блогу', related: 'Читайте також', read: 'хв читання', by: 'Автор' },
  ru: { toc: 'Содержание', back: 'К блогу', related: 'Читайте также', read: 'мин чтения', by: 'Автор' },
  en: { toc: 'Contents', back: 'Back to blog', related: 'Read also', read: 'min read', by: 'Author' },
};

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(locale, slug);
  if (!post) notFound();

  const l = L[locale as keyof typeof L] ?? L.ua;
  const related = await getRelatedBlogPosts(locale, post._id, post.categorySlug ? post.categorySlug : null, 3);
  const html = post.body ? parseMarkdown(post.body) : '';
  const localePrefix = locale === 'ua' ? '' : `/${locale}`;
  const articleUrl = `https://genevity.com.ua${localePrefix}/blog/${slug}`;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(
        locale === 'ua' ? 'uk-UA' : locale === 'ru' ? 'ru-RU' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : '';

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || '',
    url: articleUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    ...(post.coverImage ? { image: post.coverImage.startsWith('http') ? post.coverImage : `https://genevity.com.ua${post.coverImage}` } : {}),
    author: post.authorName ? {
      "@type": "Person",
      name: post.authorName,
      ...(post.authorSlug ? { url: `https://genevity.com.ua${localePrefix}/doctors/${post.authorSlug}` } : {}),
    } : { "@type": "Organization", name: "GENEVITY" },
    publisher: {
      "@type": "Organization",
      name: "GENEVITY",
      logo: { "@type": "ImageObject", url: "https://genevity.com.ua/brand/LogoFullDark.svg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  return (
    <>
      <JsonLd data={articleSchema as Record<string, unknown>} />
      <JsonLdBreadcrumbList items={[
        { name: 'GENEVITY', url: 'https://genevity.com.ua/' },
        { name: 'Блог', url: `https://genevity.com.ua${localePrefix}/blog` },
        { name: post.title, url: articleUrl },
      ]} />
      <MegaMenuHeader variant="solid" position="fixed" />

      {/* Hero stripe — full-width cover with gradient overlay */}
      {post.coverImage ? (
        <div className="relative w-full h-[56vh] min-h-[360px] max-h-[600px] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
          {/* Breadcrumb / back link on image */}
          <div className="absolute top-0 left-0 right-0 pt-28 px-4 sm:px-6 lg:px-12 max-w-[var(--container-max)] mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> {l.back}
            </Link>
          </div>
          {/* Title + meta on image */}
          <div className="absolute bottom-0 left-0 right-0 pb-10 px-4 sm:px-6 lg:px-12">
            <div className="max-w-3xl mx-auto">
              {post.categoryTitle && (
                <Link href={`/blog?category=${post.categorySlug}`} className="inline-block text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white mb-3 transition-colors">
                  {post.categoryTitle}
                </Link>
              )}
              <h1 className="heading-1 text-white mb-4 text-balance">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {post.authorName && (
                  <AuthorChip name={post.authorName} slug={post.authorSlug} avatar={post.authorAvatar} locale={localePrefix} />
                )}
                <span className="flex items-center gap-1.5 text-white/60 text-sm"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
                <span className="flex items-center gap-1.5 text-white/60 text-sm"><Clock className="w-3.5 h-3.5" />{post.readTimeMinutes} {l.read}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No cover — plain champagne header */
        <div className="bg-champagne pt-32 pb-12 px-4 sm:px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-black-40 hover:text-main transition-colors text-sm mb-8">
              <ArrowLeft className="w-3.5 h-3.5" /> {l.back}
            </Link>
            {post.categoryTitle && (
              <Link href={`/blog?category=${post.categorySlug}`} className="inline-block text-xs font-semibold uppercase tracking-widest text-main mb-3 transition-colors">
                {post.categoryTitle}
              </Link>
            )}
            <h1 className="heading-1 text-black mb-6 text-balance">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-black-10">
              {post.authorName && (
                <AuthorChip name={post.authorName} slug={post.authorSlug} avatar={post.authorAvatar} locale={localePrefix} dark />
              )}
              <span className="flex items-center gap-1.5 text-black-40 text-sm"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
              <span className="flex items-center gap-1.5 text-black-40 text-sm"><Clock className="w-3.5 h-3.5" />{post.readTimeMinutes} {l.read}</span>
            </div>
          </div>
        </div>
      )}

      {/* Article content */}
      <div className="bg-champagne py-12 lg:py-16">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
          {/* Back link (when hero cover shows it inline) */}
          {post.coverImage && (
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-black-40 hover:text-main transition-colors text-sm mb-10 lg:hidden">
              <ArrowLeft className="w-3.5 h-3.5" /> {l.back}
            </Link>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-14 items-start">
            {/* Main article */}
            <article>
              {/* Excerpt lead */}
              {post.excerpt && (
                <p className="body-l text-black-60 leading-relaxed mb-10 max-w-2xl">{post.excerpt}</p>
              )}

              {/* Body */}
              {html && <ArticleBody html={html} />}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-black-10">
                  <Tag className="w-3.5 h-3.5 text-black-40 mt-0.5 shrink-0" />
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-champagne-dark text-black-60 border border-champagne-darker">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author card (desktop: below article; shown always) */}
              {post.authorName && (
                <div className="mt-10 pt-8 border-t border-black-10">
                  <AuthorCard name={post.authorName} slug={post.authorSlug} avatar={post.authorAvatar} locale={localePrefix} label={l.by} />
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block sticky top-28">
              {html && <TableOfContents html={html} labels={{ title: l.toc }} />}
            </aside>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mt-20 lg:mt-24 pt-10 border-t border-black-10">
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

function AuthorChip({ name, slug, avatar, locale, dark }: { name: string; slug: string | null; avatar: string | null; locale: string; dark?: boolean }) {
  const textCls = dark ? "text-black-70 hover:text-main" : "text-white/80 hover:text-white";
  const inner = (
    <span className={`inline-flex items-center gap-2 transition-colors ${slug ? textCls : dark ? "text-black-70" : "text-white/80"}`}>
      {avatar ? (
        <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-champagne-dark">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </span>
      ) : (
        <span className="w-7 h-7 rounded-full bg-main/20 flex items-center justify-center text-xs font-semibold text-main shrink-0">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-sm font-medium">{name}</span>
    </span>
  );
  return slug ? <Link href={`${locale}/doctors/${slug}`}>{inner}</Link> : <>{inner}</>;
}

function AuthorCard({ name, slug, avatar, locale, label }: { name: string; slug: string | null; avatar: string | null; locale: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      {avatar ? (
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-champagne-dark">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-main/10 flex items-center justify-center text-lg font-semibold text-main shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-xs text-black-40 mb-0.5">{label}</p>
        {slug ? (
          <Link href={`${locale}/doctors/${slug}`} className="body-strong text-black hover:text-main transition-colors">{name}</Link>
        ) : (
          <p className="body-strong text-black">{name}</p>
        )}
      </div>
    </div>
  );
}
