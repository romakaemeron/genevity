import { notFound } from "next/navigation";
import { getStaticPage } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import StaticPageTemplate from "@/components/templates/StaticPageTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "about");
  if (!data) return {};
  return generatePageMetadata({
    title: data.title,
    description: data.summary || "Про центр GENEVITY",
    locale: locale as Locale,
    path: "/about",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "about");
  if (!data) notFound();
  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <StaticPageTemplate data={data} locale={locale as Locale} />
    </>
  );
}
