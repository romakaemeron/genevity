import { getUiStringsData, getSiteSettingsData, getStaticPageSeo } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import ContactsPageComponent from "@/components/pages/ContactsPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const seo = await getStaticPageSeo(locale, "contacts");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords,
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/contacts",
  });
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [settings, uiStrings] = await Promise.all([
    getSiteSettingsData(locale),
    getUiStringsData(locale),
  ]);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <ContactsPageComponent
        settings={settings}
        locale={locale as Locale}
        contactsUi={uiStrings.contacts}
      />
    </>
  );
}
