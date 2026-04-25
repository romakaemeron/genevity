import { notFound } from "next/navigation";
import {
  getStaticPage, getUiStringsData, getAllDoctors,
  getLabServices, getLabPrepSteps, getGalleryItems, getStaticPageSeo,
} from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import LaboratoryPageComponent from "@/components/pages/LaboratoryPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seo = await getStaticPageSeo(locale, "laboratory");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords,
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/laboratory",
  });
}

export default async function LaboratoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [data, uiStrings, doctors, services, prepSteps, gallery] = await Promise.all([
    getStaticPage(locale, "laboratory"),
    getUiStringsData(locale),
    getAllDoctors(locale),
    getLabServices(locale),
    getLabPrepSteps(locale),
    getGalleryItems("laboratory", locale),
  ]);
  if (!data) notFound();

  const diagDoctors = doctors.filter((d) =>
    d.role?.toLowerCase().includes("узд") ||
    d.role?.toLowerCase().includes("гастро") ||
    d.role?.toLowerCase().includes("gastro") ||
    d.role?.toLowerCase().includes("ultrasound")
  );

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="static-hero-sentinel" />
      <LaboratoryPageComponent
        data={data}
        locale={locale as Locale}
        doctors={diagDoctors.length > 0 ? diagDoctors : doctors.slice(0, 3)}
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
        services={services}
        prepSteps={prepSteps}
        gallery={gallery}
      />
    </>
  );
}
