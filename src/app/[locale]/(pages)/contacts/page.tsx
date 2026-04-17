import { notFound } from "next/navigation";
import { getStaticPage } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import StaticPageTemplate from "@/components/templates/StaticPageTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "contacts");
  if (!data) return {};
  return generatePageMetadata({
    title: data.title,
    description: data.summary || "Контакти GENEVITY",
    locale: locale as Locale,
    path: "/contacts",
  });
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "contacts");
  if (!data) notFound();
  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <StaticPageTemplate data={data} locale={locale as Locale} />
    </>
  );
}
