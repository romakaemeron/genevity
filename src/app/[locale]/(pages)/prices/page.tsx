import { generatePageMetadata } from "@/lib/seo";
import { getPriceCategoriesWithItems, getStaticPageSeo } from "@/lib/db/queries";
import type { Locale } from "@/i18n/routing";
import PricesPageComponent from "@/components/pages/PricesPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seo = await getStaticPageSeo(locale, "prices");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords,
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/prices",
  });
}

export default async function PricesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const categories = await getPriceCategoriesWithItems(locale);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <PricesPageComponent locale={locale as Locale} categories={categories} />
    </>
  );
}
