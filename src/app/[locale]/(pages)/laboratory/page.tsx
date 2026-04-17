import { notFound } from "next/navigation";
import { getStaticPage, getUiStringsData, getAllDoctors } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import LaboratoryPageComponent from "@/components/pages/LaboratoryPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getStaticPage(locale, "laboratory");
  if (!data) return {};
  return generatePageMetadata({
    title: data.title,
    description: data.summary || "Лабораторія GENEVITY",
    locale: locale as Locale,
    path: "/laboratory",
  });
}

export default async function LaboratoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [data, uiStrings, doctors] = await Promise.all([
    getStaticPage(locale, "laboratory"),
    getUiStringsData(locale),
    getAllDoctors(locale),
  ]);
  if (!data) notFound();

  // Diagnostic doctors
  const diagDoctors = doctors.filter((d) => ["doctor-4", "doctor-5"].includes(d._id));

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="static-hero-sentinel" />
      <LaboratoryPageComponent
        data={data}
        locale={locale as Locale}
        doctors={diagDoctors.length > 0 ? diagDoctors : doctors.slice(0, 3)}
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
      />
    </>
  );
}
