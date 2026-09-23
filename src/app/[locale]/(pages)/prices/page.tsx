import { generatePageMetadata } from "@/lib/seo";
import { getPriceCategoriesWithItems, getStaticPageSeo } from "@/lib/db/queries";
import type { Locale } from "@/i18n/routing";
import PricesPageComponent from "@/components/pages/PricesPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { sql } from "@/lib/db/client";
import { setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";

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

  const offerCatalog = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "GENEVITY",
    itemListElement: categories.map((cat) => ({
      "@type": "OfferCatalog",
      name: cat.label,
      // Items filed directly under a category keep their bare name. Items
      // filed under a subcategory get their name qualified with the
      // subcategory label — otherwise, e.g. within "Лазерна епіляція" or
      // "Апаратні процедури", multiple subcategories reuse the same item
      // name ("Щоки", "Шия"...) at different prices (different device/
      // area), and the flattened catalog would assert contradictory prices
      // for a Service with the same name.
      itemListElement: [
        ...cat.items.map((item) => ({ item, name: item.name })),
        ...cat.subcategories.flatMap((s) =>
          s.items.map((item) => ({ item, name: `${s.label} — ${item.name}` }))
        ),
      ]
        .filter(({ item }) => item.priceNumeric !== null)
        .map(({ item, name }) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
          price: item.priceNumeric,
          priceCurrency: "UAH",
        })),
    })),
  };

  return (
    <>
      <JsonLd data={offerCatalog} />
      <MegaMenuHeader variant="solid" position="fixed" />
      <PricesPageComponent locale={locale as Locale} categories={categories} pricelistPdf={pricelistPdf} />
    </>
  );
}
