import { notFound } from "next/navigation";
import { getCategoryBySlug, getServicesByCategory, getAllCategorySlugs } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import CategoryHubTemplate from "@/components/templates/CategoryHubTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

/** Category-specific hero images. Vertical images get special treatment in the template. */
const categoryHeroImages: Record<string, { src: string; position?: string; flip?: boolean; scale?: number }> = {
  "injectable-cosmetology": { src: "/services/injectable-cosmetology-hero.webp", position: "center", flip: true },
};

/** Hero variant per category: "light" = light photo/dark text, "dark" = dark photo/light text */
const categoryHeroVariants: Record<string, "light" | "dark"> = {
  "injectable-cosmetology": "light",
};

/** Category-specific clinic/procedure gallery images */
const categoryImages: Record<string, string[]> = {
  "injectable-cosmetology": [
    "/services/injectable-cosmetology-hero.webp",
    "/clinic/semi1737-hdr.webp",
    "/clinic/semi1287-hdr.webp",
    "/clinic/hydrafacial.webp",
    "/clinic/acupulse.webp",
  ],
};

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
      {/* Sticky solid header — slides in after hero scrolls past */}
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="category-hero-sentinel" />
      <CategoryHubTemplate
        category={category}
        services={services}
        locale={locale as Locale}
        heroImage={categoryHeroImages[slug] || undefined}
        heroVariant={categoryHeroVariants[slug] || "dark"}
        images={categoryImages[slug] || undefined}
      />
    </>
  );
}
