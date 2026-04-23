import { notFound } from "next/navigation";
import { getServiceBySlug, getUiStringsData } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  const data = await getServiceBySlug(locale, category, slug);
  if (!data) return {};
  return generatePageMetadata({
    title: data.seoTitle || data.h1 || data.title,
    description: data.seoDescription || data.summary || `${data.title} у центрі GENEVITY, Дніпро`,
    locale: locale as Locale,
    path: `/services/${category}/${slug}`,
    keywords: data.seoKeywords,
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
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
        equipmentUi={uiStrings?.equipment ? {
          title: uiStrings.equipment.title,
          details: uiStrings.equipment.details,
          suitsTitle: uiStrings.equipment.suitsTitle,
          resultsTitle: uiStrings.equipment.resultsTitle,
        } : undefined}
      />
    </>
  );
}
