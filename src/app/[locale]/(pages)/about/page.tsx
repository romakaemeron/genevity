import { getUiStringsData, getAllDoctors } from "@/sanity/queries";
import { sanityClient } from "@/sanity/client";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { AboutData } from "@/sanity/types";
import AboutPageComponent from "@/components/pages/AboutPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

function lang(locale: string) {
  return locale === "ua" ? "uk" : locale;
}

async function getAbout(locale: string): Promise<AboutData> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "about"][0] {
      "title": coalesce(title.${l}, title.uk),
      "text1": coalesce(text1.${l}, text1.uk),
      "text2": coalesce(text2.${l}, text2.uk),
      "diagnostics": coalesce(diagnostics.${l}, diagnostics.uk),
    }
  `);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: locale === "ru" ? "О центре" : locale === "en" ? "About" : "Про центр",
    description: locale === "ru" ? "Центр эстетической медицины и долголетия GENEVITY в Днепре. Команда экспертов, передовое оборудование, доказательная медицина." : locale === "en" ? "GENEVITY aesthetic medicine and longevity center in Dnipro. Expert team, advanced equipment, evidence-based medicine." : "Центр естетичної медицини та довголіття GENEVITY у Дніпрі. Команда експертів, передове обладнання, доказова медицина.",
    locale: locale as Locale,
    path: "/about",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [about, uiStrings, doctors] = await Promise.all([
    getAbout(locale),
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
