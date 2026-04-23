import { notFound } from "next/navigation";
import { getCategoryBySlug, getServicesByCategory, getAllCategorySlugs, getAllDoctors, getUiStringsData } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import CategoryHubTemplate from "@/components/templates/CategoryHubTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

/** Map category slugs to relevant doctor IDs */
const categoryDoctorIds: Record<string, string[]> = {
  "injectable-cosmetology": ["doctor-0", "doctor-1"],
  "apparatus-cosmetology": ["doctor-0", "doctor-1"],
  "intimate-rejuvenation": ["doctor-6", "doctor-0"],
  "laser-hair-removal": ["doctor-1", "doctor-0"],
  "longevity": ["doctor-2", "doctor-3", "doctor-8", "doctor-9"],
};

/** Default hero image when no category-specific one exists */
const DEFAULT_HERO = { src: "/clinic/semi1737-hdr.webp", position: "center" };

/** Category-specific hero images */
const categoryHeroImages: Record<string, { src: string; position?: string; flip?: boolean; scale?: number }> = {
  "injectable-cosmetology": { src: "/services/injectable-cosmetology-hero.webp", position: "center" },
  "apparatus-cosmetology": { src: "/clinic/semi1737-hdr.webp", position: "center" },
  "intimate-rejuvenation": { src: "/clinic/semi1287-hdr.webp", position: "center" },
  "laser-hair-removal": { src: "/clinic/semi1256-hdr.webp", position: "center" },
  "longevity": { src: "/clinic/hydrafacial.webp", position: "center" },
};

/** Default clinic photos used as visual breaks within sections */
const DEFAULT_PHOTOS = [
  "/clinic/semi1737-hdr.webp",
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/hydrafacial.webp",
  "/clinic/acupulse.webp",
];

/** Category-specific clinic/procedure gallery images */
const categoryImages: Record<string, string[]> = {
  "injectable-cosmetology": ["/services/injectable-cosmetology-hero.webp", "/clinic/semi1287-hdr.webp", "/clinic/semi1256-hdr.webp"],
  "apparatus-cosmetology": ["/clinic/semi1737-hdr.webp", "/clinic/acupulse.webp", "/clinic/hydrafacial.webp"],
  "laser-hair-removal": ["/clinic/semi1256-hdr.webp", "/clinic/semi1737-hdr.webp", "/clinic/semi1287-hdr.webp"],
  "intimate-rejuvenation": ["/clinic/semi1287-hdr.webp", "/clinic/semi1256-hdr.webp", "/clinic/semi1737-hdr.webp"],
  "longevity": ["/clinic/hydrafacial.webp", "/clinic/semi1287-hdr.webp", "/clinic/acupulse.webp"],
};

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category: slug } = await params;
  const cat = await getCategoryBySlug(locale, slug);
  if (!cat) return {};
  return generatePageMetadata({
    title: cat.seoTitle || cat.title,
    description: cat.seoDescription || cat.summary || `${cat.title} у центрі GENEVITY, Дніпро`,
    locale: locale as Locale,
    path: `/services/${slug}`,
    keywords: cat.seoKeywords,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category: slug } = await params;
  const [category, services, doctors, uiStrings] = await Promise.all([
    getCategoryBySlug(locale, slug),
    getServicesByCategory(locale, slug),
    getAllDoctors(locale),
    getUiStringsData(locale),
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
        heroImage={categoryHeroImages[slug] || DEFAULT_HERO}
        heroVariant="light"
        images={categoryImages[slug] || DEFAULT_PHOTOS}
        doctors={
          categoryDoctorIds[slug]
            ? doctors.filter((d) => categoryDoctorIds[slug].includes(d._id))
            : doctors.slice(0, 4)
        }
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
      />
    </>
  );
}
