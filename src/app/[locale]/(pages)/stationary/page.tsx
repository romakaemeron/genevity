import { notFound } from "next/navigation";
import { getStaticPage, getUiStringsData, getAllDoctors, getGalleryItems, getStaticPageSeo } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import StationaryPageComponent from "@/components/pages/StationaryPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seo = await getStaticPageSeo(locale, "stationary");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/stationary",
  });
}

export default async function StationaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [data, uiStrings, doctors, gallery, comfortBgItems, ctaBgItems] = await Promise.all([
    getStaticPage(locale, "stationary"),
    getUiStringsData(locale),
    getAllDoctors(locale),
    getGalleryItems("stationary", locale),
    getGalleryItems("stationary_comfort_bg", locale),
    getGalleryItems("stationary_cta_bg", locale),
  ]);
  if (!data) notFound();

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <StationaryPageComponent
        data={data}
        locale={locale as Locale}
        doctors={doctors.slice(0, 4)}
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
        gallery={gallery}
        comfortBg={comfortBgItems[0] ?? null}
        ctaBg={ctaBgItems[0] ?? null}
      />
    </>
  );
}
