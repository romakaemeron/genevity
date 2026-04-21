import { getAllDoctors, getUiStringsData } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import DoctorsPageComponent from "@/components/pages/DoctorsPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const uiStrings = await getUiStringsData(locale);
  return generatePageMetadata({
    title: uiStrings?.doctors?.title || "Лікарі",
    description: locale === "ru" ? "Команда врачей центра GENEVITY в Днепре. Опытные специалисты в эстетической медицине и longevity." : locale === "en" ? "GENEVITY physician team in Dnipro. Experienced specialists in aesthetic medicine and longevity." : "Команда лікарів центру GENEVITY у Дніпрі. Досвідчені спеціалісти в естетичній медицині та longevity.",
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
