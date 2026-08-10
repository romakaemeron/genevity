import { notFound } from "next/navigation";
import { getServiceBySlug, getUiStringsData } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { setRequestLocale } from "next-intl/server";
import { getAllServiceSlugs } from "@/lib/db/queries";
import { routing } from "@/i18n/routing";
import { getPriceRange } from "@/lib/price-range";

export const revalidate = 86400;

export async function generateStaticParams() {
  const services = await getAllServiceSlugs();
  return routing.locales.flatMap((locale) =>
    services.map(({ slug, categorySlug }) => ({ locale, category: categorySlug, slug }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  const data = await getServiceBySlug(locale, category, slug);
  if (!data) return {};
  return generatePageMetadata({
    title: data.seoTitle || data.h1 || data.title,
    description:
      data.seoDescription || data.summary || `${data.title} у центрі GENEVITY, Дніпро`,
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

  // §1.16.5 ImageObject schema — use hero image or fall back to clinic photo
  const FALLBACK_IMG = "https://genevity.com.ua/clinic/semi1737-hdr.webp";
  const heroUrl = data.heroImage
    ? data.heroImage.startsWith("http") ? data.heroImage : `https://genevity.com.ua${data.heroImage}`
    : FALLBACK_IMG;

  const localePrefix = locale === "ua" ? "" : `/${locale}`;
  const servicesLabel = locale === "ru" ? "Услуги" : locale === "en" ? "Services" : "Послуги";
  const serviceUrl = `https://genevity.com.ua${localePrefix}/services/${category}/${slug}`;

  // SEO TZ #11 §6 — "Діапазон цін". Only pages that actually show a price
  // block get the AggregateOffer; the range is read straight from those rows.
  const priceRange = getPriceRange(data.sections || []);
  const metaDescription =
    data.seoDescription || data.summary || `${data.title} у центрі GENEVITY, Дніпро`;

  return (
    <>
      <JsonLdBreadcrumbList items={[
        { name: "GENEVITY", url: "https://genevity.com.ua/" },
        { name: servicesLabel, url: `https://genevity.com.ua${localePrefix}/services` },
        { name: data.category.title, url: `https://genevity.com.ua${localePrefix}/services/${category}` },
        { name: data.title, url: serviceUrl },
      ]} />
      <JsonLd data={{
        "@context": "https://schema.org/",
        "@type": "ImageObject",
        contentUrl: heroUrl,
        creditText: "GENEVITY",
        caption: data.title,
        creator: { "@type": "Organization", name: "GENEVITY" },
      }} />
      {priceRange && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: data.seoTitle || data.h1 || data.title,
          description: metaDescription,
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: priceRange.currency,
            lowPrice: priceRange.lowPrice,
            highPrice: priceRange.highPrice,
            offerCount: priceRange.offerCount,
            url: serviceUrl,
          },
        }} />
      )}
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
        eeatUi={uiStrings?.eeat}
      />
    </>
  );
}
