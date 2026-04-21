import { getUiStringsData, getAllDoctors, getAboutData } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import AboutPageComponent from "@/components/pages/AboutPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: locale === "ru" ? "О центре — эстетическая медицина в Днепре" : locale === "en" ? "About — Aesthetic Medicine in Dnipro" : "Про центр — естетична медицина у Дніпрі",
    description: locale === "ru" ? "Центр эстетической медицины и долголетия GENEVITY в Днепре. Команда экспертов, передовое оборудование, доказательная медицина." : locale === "en" ? "GENEVITY aesthetic medicine and longevity center in Dnipro. Expert team, advanced equipment, evidence-based medicine." : "Центр естетичної медицини та довголіття GENEVITY у Дніпрі. Команда експертів, передове обладнання, доказова медицина.",
    locale: locale as Locale,
    path: "/about",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [about, uiStrings, doctors] = await Promise.all([
    getAboutData(locale),
    getUiStringsData(locale),
    getAllDoctors(locale),
  ]);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <AboutPageComponent
        about={about}
        locale={locale as Locale}
        doctors={doctors}
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
      />
    </>
  );
}
