import { generatePageMetadata } from "@/lib/seo";
import { getPriceCategoriesWithItems, getStaticPageSeo } from "@/lib/db/queries";
import type { Locale } from "@/i18n/routing";
import PricesPageComponent from "@/components/pages/PricesPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { sql } from "@/lib/db/client";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seo = await getStaticPageSeo(locale, "prices");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/prices",
  });
}

export default async function PricesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [categories, settingsRows] = await Promise.all([
    getPriceCategoriesWithItems(locale),
    sql`SELECT pricelist_pdf FROM site_settings WHERE id = 1`,
  ]);
  const pricelistPdf = (settingsRows[0]?.pricelist_pdf as string | null) ?? null;

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <PricesPageComponent locale={locale as Locale} categories={categories} pricelistPdf={pricelistPdf} />
    </>
  );
}
