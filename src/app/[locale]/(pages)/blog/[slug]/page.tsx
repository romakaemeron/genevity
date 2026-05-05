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
import { ArrowLeft, Clock, Calendar } from "lucide-react";
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

const tocLabel: Record<string, string> = { ua: 'Зміст', ru: 'Содержание', en: 'Contents' };
const backLabel: Record<string, string> = { ua: 'Назад до блогу', ru: 'Назад к блогу', en: 'Back to blog' };
const relatedLabel: Record<string, string> = { ua: 'Інші записи', ru: 'Другие записи', en: 'Other articles' };
const readLabel: Record<string, string> = { ua: 'хв читання', ru: 'мин чтения', en: 'min read' };

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(locale, slug);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(locale, post._id, post.categorySlug ? post.categorySlug : null, 3);
  const html = post.body ? parseMarkdown(post.body) : '';
  const localePrefix = locale === 'ua' ? '' : `/${locale}`;
  const articleUrl = `https://genevity.com.ua${localePrefix}/blog/${slug}`;

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
        { name: locale === 'ru' ? 'Блог' : locale === 'en' ? 'Blog' : 'Блог', url: `https://genevity.com.ua${localePrefix}/blog` },
        { name: post.title, url: articleUrl },
      ]} />
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="pt-32 pb-24 bg-champagne">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-2 body-s text-black-40 hover:text-main transition-colors mb-10">
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel[locale] || backLabel.ua}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-start">
            {/* Main content */}
            <article>
              {/* Category */}
              {post.categoryTitle && (
                <Link href={`/blog?category=${post.categorySlug}`} className="inline-block text-main body-s font-medium mb-4 hover:underline">
                  {post.categoryTitle}
                </Link>
              )}

              {/* Title */}
              <h1 className="heading-2 text-black mb-6 text-balance">{post.title}</h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-black-10">
                {post.authorName && post.authorSlug && (
                  <Link href={`/doctors/${post.authorSlug}`} className="body-s text-main hover:underline font-medium">
                    {post.authorName}
                  </Link>
                )}
                {post.authorName && !post.authorSlug && <span className="body-s text-main font-medium">{post.authorName}</span>}
                <span className="body-s text-black-40 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.publishedAt}</span>
                <span className="body-s text-black-40 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTimeMinutes} {readLabel[locale] || readLabel.ua}</span>
              </div>

              {/* Cover image */}
              {post.coverImage && (
                <div className="relative aspect-[16/9] rounded-[var(--radius-card)] overflow-hidden mb-10 bg-champagne-dark">
                  <Image src={post.coverImage} alt={post.title} title={post.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 70vw" priority />
                </div>
              )}

              {/* Body */}
              {html && <ArticleBody html={html} />}
            </article>

            {/* Sidebar — ToC */}
            {html && (
              <aside className="hidden lg:block">
                <TableOfContents html={html} labels={{ title: tocLabel[locale] || tocLabel.ua }} />
              </aside>
            )}
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="heading-3 text-black mb-8">{relatedLabel[locale] || relatedLabel.ua}</h2>
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
