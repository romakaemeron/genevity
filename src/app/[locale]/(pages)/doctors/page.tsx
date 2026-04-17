import { notFound } from "next/navigation";
import { getStaticPage } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import StaticPageTemplate from "@/components/templates/StaticPageTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "doctors");
  if (!data) return {};
  return generatePageMetadata({
    title: data.title,
    description: data.summary || "Лікарі GENEVITY",
    locale: locale as Locale,
    path: "/doctors",
  });
}

export default async function DoctorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "doctors");
  if (!data) notFound();
  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <StaticPageTemplate data={data} locale={locale as Locale} />
    </>
  );
}
