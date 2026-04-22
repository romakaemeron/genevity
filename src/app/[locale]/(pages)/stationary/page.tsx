import { notFound } from "next/navigation";
import { getStaticPage, getUiStringsData, getAllDoctors, getGalleryItems, getStaticPageSeo } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import StationaryPageComponent from "@/components/pages/StationaryPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seo = await getStaticPageSeo(locale, "stationary");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords,
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/stationary",
  });
}

export default async function StationaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [data, uiStrings, doctors, gallery] = await Promise.all([
    getStaticPage(locale, "stationary"),
    getUiStringsData(locale),
    getAllDoctors(locale),
    getGalleryItems("stationary", locale),
  ]);
  if (!data) notFound();

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="static-hero-sentinel" />
      <StationaryPageComponent
        data={data}
        locale={locale as Locale}
        doctors={doctors.slice(0, 4)}
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
        gallery={gallery}
      />
    </>
  );
}
