import { notFound } from "next/navigation";
import { getCategoryBySlug, getServicesByCategory, getAllCategorySlugs } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import CategoryHubTemplate from "@/components/templates/CategoryHubTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getAllCategorySlugs();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category: slug } = await params;
  const cat = await getCategoryBySlug(locale, slug);
  if (!cat) return {};
  return generatePageMetadata({
    title: `${cat.title} — GENEVITY`,
    description: cat.summary || `${cat.title} у центрі GENEVITY, Дніпро`,
    locale: locale as Locale,
    path: `/services/${slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category: slug } = await params;
  const [category, services] = await Promise.all([
    getCategoryBySlug(locale, slug),
    getServicesByCategory(locale, slug),
  ]);

  if (!category) notFound();

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <CategoryHubTemplate
        category={category}
        services={services}
        locale={locale as Locale}
      />
    </>
  );
}
