import { redirect, permanentRedirect } from "next/navigation";
import { getBlogCategories, getBlogPosts } from "@/lib/db/queries/blog";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import BlogCard from "@/components/blog/BlogCard";
import { Link } from "@/i18n/navigation";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";

// Blog is visible on dev/preview only — hidden on production until launch
const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  if (IS_PRODUCTION) return {};
  const { locale } = await params;
  const titles: Record<string, string> = {
    ua: "Блог GENEVITY — статті про довголіття, діагностику та естетичну медицину",
    ru: "Блог GENEVITY — статьи о долголетии, диагностике и эстетической медицине",
    en: "GENEVITY Blog — Articles on Longevity, Diagnostics and Aesthetic Medicine",
  };
  const descs: Record<string, string> = {
    ua: "Корисні статті про довголіття, діагностику та естетичну медицину від лікарів GENEVITY.",
    ru: "Полезные статьи о долголетии, диагностике и эстетической медицине от врачей GENEVITY.",
    en: "Useful articles on longevity, diagnostics and aesthetic medicine from GENEVITY doctors.",
  };
  return generatePageMetadata({ title: titles[locale] || titles.ua, description: descs[locale] || descs.ua, locale: locale as Locale, path: "/blog" });
}

const h1Labels: Record<string, string> = {
  ua: "Статті про здоров'я та довголіття",
  ru: "Статьи о здоровье и долголетии",
  en: "Articles on Health and Longevity",
};
const allLabel: Record<string, string> = { ua: "Всі статті", ru: "Все статьи", en: "All articles" };

export default async function BlogIndexPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  if (IS_PRODUCTION) permanentRedirect("/");

  const { locale } = await params;
  const { category } = await searchParams;
  const [categories, posts] = await Promise.all([
    getBlogCategories(locale),
    getBlogPosts(locale, category),
  ]);

  const localePrefix = locale === "ua" ? "" : `/${locale}`;

  return (
    <>
      <JsonLdBreadcrumbList items={[
        { name: "GENEVITY", url: "https://genevity.com.ua/" },
        { name: h1Labels[locale] || h1Labels.ua, url: `https://genevity.com.ua${localePrefix}/blog` },
      ]} />
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="pt-32 pb-24 bg-champagne min-h-screen">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
          <h1 className="heading-2 text-black mb-4">{h1Labels[locale] || h1Labels.ua}</h1>

          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!category ? "bg-main text-champagne" : "bg-champagne-dark text-black-60 hover:bg-champagne-darker"}`}
            >
              {allLabel[locale] || allLabel.ua}
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/blog?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat.slug ? "bg-main text-champagne" : "bg-champagne-dark text-black-60 hover:bg-champagne-darker"}`}
              >
                {cat.title}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-24 text-black-40 body-l">
              {locale === "ru" ? "Статьи скоро появятся" : locale === "en" ? "Articles coming soon" : "Статті незабаром з'являться"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => <BlogCard key={post._id} post={post} locale={locale} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
