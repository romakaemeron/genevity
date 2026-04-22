import { getUiStringsData, getAllDoctors, getAboutData, getGalleryItems, getStaticPageSeo, getStaticPage } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import AboutPageComponent from "@/components/pages/AboutPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seo = await getStaticPageSeo(locale, "about");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords,
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/about",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [about, uiStrings, doctors, gallery, staticPage] = await Promise.all([
    getAboutData(locale),
    getUiStringsData(locale),
    getAllDoctors(locale),
    getGalleryItems("about", locale),
    getStaticPage(locale, "about"),
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
        gallery={gallery}
        breadcrumbLabel={staticPage?.title || about.title}
      />
    </>
  );
}
