import { getAllDoctors, getUiStringsData, getStaticPageSeo } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import DoctorsPageComponent from "@/components/pages/DoctorsPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seo = await getStaticPageSeo(locale, "doctors");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
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

  const localePrefix = locale === "ua" ? "" : `/${locale}`;
  const doctorsLabel = locale === "ru" ? "Врачи" : locale === "en" ? "Doctors" : "Лікарі";

  return (
    <>
      <JsonLdBreadcrumbList items={[
        { name: "GENEVITY", url: "https://genevity.com.ua/" },
        { name: doctorsLabel, url: `https://genevity.com.ua${localePrefix}/doctors` },
      ]} />
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
