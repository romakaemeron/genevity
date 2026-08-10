import { getFaqPage, getUiStringsData, getStaticPageSeo } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import FaqPageComponent from "@/components/pages/FaqPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // SEO copy lives on the `faq` static_pages row so admins can edit it at
  // /admin/pages/faq; the UI strings stay as the fallback.
  const [seo, uiStrings] = await Promise.all([
    getStaticPageSeo(locale, "faq"),
    getUiStringsData(locale),
  ]);
  return generatePageMetadata({
    title: seo?.title || uiStrings.faq.title || "",
    description: seo?.description || uiStrings.faq.subtitle || "",
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/faq",
  });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [groups, uiStrings] = await Promise.all([
    getFaqPage(locale),
    getUiStringsData(locale),
  ]);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <FaqPageComponent
        groups={groups}
        faqUi={uiStrings.faq}
        disclaimer={uiStrings.eeat?.disclaimer}
        locale={locale as Locale}
      />
    </>
  );
}
