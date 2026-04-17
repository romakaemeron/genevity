import { notFound } from "next/navigation";
import { getStaticPage, getUiStringsData, getAllDoctors } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import StaticPageTemplate from "@/components/templates/StaticPageTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "stationary");
  if (!data) return {};
  return generatePageMetadata({
    title: data.title,
    description: data.summary || "Стаціонар GENEVITY",
    locale: locale as Locale,
    path: "/stationary",
  });
}

export default async function StationaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [data, uiStrings, doctors] = await Promise.all([
    getStaticPage(locale, "stationary"),
    getUiStringsData(locale),
    getAllDoctors(locale),
  ]);
  if (!data) notFound();

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="static-hero-sentinel" />
      <StaticPageTemplate
        data={data}
        locale={locale as Locale}
        heroImage="/clinic/semi1287-hdr.webp"
        heroVariant="dark"
        images={["/clinic/semi1737-hdr.webp", "/clinic/semi1256-hdr.webp"]}
        doctors={doctors.slice(0, 4)}
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
      />
    </>
  );
}
