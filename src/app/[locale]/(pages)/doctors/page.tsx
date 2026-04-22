import { getAllDoctors, getUiStringsData, getStaticPageSeo } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import DoctorsPageComponent from "@/components/pages/DoctorsPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seo = await getStaticPageSeo(locale, "doctors");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords,
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/doctors",
  });
}

export default async function DoctorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [doctors, uiStrings] = await Promise.all([
    getAllDoctors(locale),
    getUiStringsData(locale),
  ]);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <DoctorsPageComponent
        doctors={doctors}
        locale={locale as Locale}
        doctorsUi={uiStrings.doctors}
        detailsLabel={uiStrings.equipment.details}
      />
    </>
  );
}
