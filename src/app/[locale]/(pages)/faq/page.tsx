import { getFaqPage, getUiStringsData } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import FaqPageComponent from "@/components/pages/FaqPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const uiStrings = await getUiStringsData(locale);
  return generatePageMetadata({
    title: uiStrings.faq.title || "",
    description: uiStrings.faq.subtitle || "",
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
