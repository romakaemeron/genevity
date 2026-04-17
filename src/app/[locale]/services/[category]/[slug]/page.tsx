import { notFound } from "next/navigation";
import { getServiceBySlug, getAllServiceSlugs } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

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
    title: data.h1 || data.title,
    description: data.summary || `${data.title} у центрі GENEVITY, Дніпро`,
    locale: locale as Locale,
    path: `/services/${category}/${slug}`,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  const data = await getServiceBySlug(locale, category, slug);

  if (!data) notFound();

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <ServiceDetailTemplate data={data} locale={locale as Locale} />
    </>
  );
}
