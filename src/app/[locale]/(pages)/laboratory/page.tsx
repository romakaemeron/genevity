import { notFound } from "next/navigation";
import { getStaticPage, getUiStringsData, getAllDoctors } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import StaticPageTemplate from "@/components/templates/StaticPageTemplate";
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

  // Filter diagnostic doctors (УЗД specialists)
  const diagDoctors = doctors.filter((d) =>
    ["doctor-4", "doctor-5"].includes(d._id)
  );

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="static-hero-sentinel" />
      <StaticPageTemplate
        data={data}
        locale={locale as Locale}
        heroImage="/clinic/semi1256-hdr.webp"
        heroVariant="light"
        images={["/clinic/semi1737-hdr.webp", "/clinic/hydrafacial.webp"]}
        doctors={diagDoctors.length > 0 ? diagDoctors : doctors.slice(0, 3)}
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
      />
    </>
  );
}
