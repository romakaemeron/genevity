import { notFound } from "next/navigation";
import { getServiceBySlug, getAllServiceSlugs, getUiStringsData } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

/** Default photos for service pages when no specific images exist */
const DEFAULT_SERVICE_PHOTOS = [
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/semi1737-hdr.webp",
];

/** Category-level default images for services */
const defaultServiceImages: Record<string, string[]> = {
  "injectable-cosmetology": ["/services/injectable-cosmetology-hero.webp", "/clinic/semi1287-hdr.webp", "/clinic/semi1256-hdr.webp"],
  "apparatus-cosmetology": ["/clinic/semi1737-hdr.webp", "/clinic/acupulse.webp", "/clinic/hydrafacial.webp"],
  "laser-hair-removal": ["/clinic/semi1256-hdr.webp", "/clinic/semi1737-hdr.webp"],
  "longevity": ["/clinic/hydrafacial.webp", "/clinic/semi1287-hdr.webp"],
};

/** Service-specific images (override category defaults) */
const serviceImages: Record<string, string[]> = {
  "botulinum-therapy": ["/services/injectable-cosmetology-hero.webp", "/clinic/semi1287-hdr.webp"],
};

export const revalidate = 60;

export async function generateStaticParams() {
  const services = await getAllServiceSlugs();
  return services.map((s) => ({ category: s.categorySlug, slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  const data = await getServiceBySlug(locale, category, slug);
  if (!data) return {};
  return generatePageMetadata({
    title: data.seoTitle || data.h1 || data.title,
    description: data.seoDescription || data.summary || `${data.title} у центрі GENEVITY, Дніпро`,
    locale: locale as Locale,
    path: `/services/${category}/${slug}`,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  const [data, uiStrings] = await Promise.all([
    getServiceBySlug(locale, category, slug),
    getUiStringsData(locale),
  ]);

  if (!data) notFound();

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <ServiceDetailTemplate
        data={data}
        locale={locale as Locale}
        doctorsUi={uiStrings.doctors}
        detailsLabel={uiStrings.equipment.details}
        images={serviceImages[slug] || defaultServiceImages[category] || DEFAULT_SERVICE_PHOTOS}
      />
    </>
  );
}
