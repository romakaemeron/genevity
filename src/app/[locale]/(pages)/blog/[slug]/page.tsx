import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/db/queries/blog";
import { getServicesBySlugs } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import ArticleBody, { processBody, parseTocItems } from "@/components/blog/ArticleBody";
import TableOfContents from "@/components/blog/TableOfContents";
import BlogTocBar from "@/components/blog/BlogTocBar";
import BlogCard from "@/components/blog/BlogCard";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { ArrowLeft, Clock, Calendar, Tag, ChevronRight } from "lucide-react";
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
  const [related, relatedServices] = await Promise.all([
    getRelatedBlogPosts(locale, post._id, post.categorySlug ?? null, 3),
    getServicesBySlugs(locale, post.relatedServiceSlugs),
  ]);
  const html = post.body ? processBody(post.body) : "";
  const tocItems = parseTocItems(html);
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

      {/* ─── ARTICLE HEADER (always visible, champagne bg) ────────────── */}
      <div className="bg-champagne pt-28 pb-8">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-black-40 hover:text-main transition-colors text-sm mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> {l.back}
          </Link>
          {post.categoryTitle && (
            <Link href={`/blog?category=${post.categorySlug}`} className="text-xs font-semibold uppercase tracking-widest text-main mb-3 block">
              {post.categoryTitle}
            </Link>
          )}
          <h1 className="heading-1 text-black mb-4 max-w-3xl text-balance">{post.title}</h1>
          {post.excerpt && (
            <p className="body-l text-black-50 leading-relaxed max-w-2xl mb-6">{post.excerpt}</p>
          )}
          <PostMeta post={post} locale={localePrefix} formattedDate={formattedDate} readLabel={l.read} />
        </div>
      </div>

      {/* ─── COVER IMAGE (contained, rounded) ──────────────────────────── */}
      {post.coverImage && (
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pb-2">
          <div className="relative w-full aspect-[16/9] max-h-[480px] overflow-hidden rounded-[var(--radius-card)] bg-champagne-dark">
            <Image
              src={post.coverImage}
              alt={post.title}
              title={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>
      )}

      {/* ─── MOBILE TOC BAR ────────────────────────────────────────────── */}
      {tocItems.length >= 2 && <BlogTocBar items={tocItems} label={l.toc} />}

      {/* ─── ARTICLE + DESKTOP TOC SIDEBAR ─────────────────────────────── */}
      <div className="bg-champagne py-12 lg:py-16">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 lg:gap-16 items-start">

            {/* Article */}
            <article className="min-w-0">
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

              {/* Related services block */}
              {relatedServices.length > 0 && (
                <div className="mt-10 pt-8 border-t border-black-10">
                  <p className="body-strong text-black mb-4">
                    {locale === "ru" ? "Записаться на процедуру" : locale === "en" ? "Book a procedure" : "Записатись на процедуру"}
                  </p>
                  <div className="flex flex-col gap-3">
                    {relatedServices.map(svc => (
                      <Link
                        key={svc._id}
                        href={`/services/${svc.categorySlug}/${svc.slug}`}
                        className="flex items-center gap-4 p-4 rounded-[var(--radius-card)] bg-champagne-dark hover:bg-champagne-darker transition-colors group"
                      >
                        {svc.heroImage && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-champagne-darker">
                            <Image src={svc.heroImage} alt={svc.title} fill className="object-cover" sizes="64px" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="body-strong text-black group-hover:text-main transition-colors truncate">{svc.title}</p>
                          {svc.priceFrom && <p className="body-s text-black-40 mt-0.5">{locale === "ru" ? "от" : locale === "en" ? "from" : "від"} {svc.priceFrom}</p>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-black-30 group-hover:text-main transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author card */}
              {post.authorName && (
                <div className="mt-10 pt-8 border-t border-black-10">
                  <AuthorCard name={post.authorName} slug={post.authorSlug} avatar={post.authorAvatar} focalPoint={post.authorFocalPoint} scale={post.authorScale} locale={localePrefix} label={l.by} />
                </div>
              )}
            </article>

            {/* Desktop TOC sidebar */}
            <aside className="hidden lg:block sticky top-28 self-start">
              {tocItems.length >= 2 && <TableOfContents items={tocItems} labels={{ title: l.toc }} />}
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
  post: { authorName: string | null; authorSlug: string | null; authorAvatar: string | null; authorFocalPoint: string | null; authorScale: number | null; publishedAt: string; readTimeMinutes: number };
  locale: string; formattedDate: string; readLabel: string; light?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {post.authorName && (
        <span className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${light ? "text-white/80" : "text-black-70"}`}>
          <AvatarCircle name={post.authorName} avatar={post.authorAvatar} focalPoint={post.authorFocalPoint} scale={post.authorScale} size={7} />
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

function AvatarCircle({ name, avatar, focalPoint, scale, size = 7 }: { name: string; avatar: string | null; focalPoint?: string | null; scale?: number | null; size?: number }) {
  const px = size * 4;
  const fp = focalPoint || "50% 50%";
  const sc = scale && scale > 0 ? scale : 1;
  if (avatar) {
    return (
      <span className="relative rounded-full overflow-hidden shrink-0 bg-champagne-dark" style={{ width: px, height: px }}>
        <span className="absolute inset-0" style={{ transform: `scale(${sc})`, transformOrigin: fp }}>
          <Image src={avatar} alt={name} fill sizes="256px" quality={92} className="object-cover" style={{ objectPosition: fp }} />
        </span>
      </span>
    );
  }
  return <span className="rounded-full bg-main/15 flex items-center justify-center text-xs font-semibold text-main shrink-0" style={{ width: px, height: px }}>{name.charAt(0).toUpperCase()}</span>;
}

function AuthorCard({ name, slug, avatar, focalPoint, scale, locale, label }: { name: string; slug: string | null; avatar: string | null; focalPoint: string | null; scale: number | null; locale: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <AvatarCircle name={name} avatar={avatar} focalPoint={focalPoint} scale={scale} size={12} />
      <div>
        <p className="text-xs text-black-40 mb-0.5">{label}</p>
        {slug
          ? <Link href={`${locale}/doctors/${slug}`} className="body-strong text-black hover:text-main transition-colors">{name}</Link>
          : <p className="body-strong text-black">{name}</p>}
      </div>
    </div>
  );
}
