import { getUiStringsData, getSiteSettingsData } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import ContactsPageComponent from "@/components/pages/ContactsPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: locale === "ru" ? "Контакты — адрес, телефон, график" : locale === "en" ? "Contacts — Address, Phone, Hours" : "Контакти — адреса, телефон, графік",
    description: locale === "ru" ? "Контакты клиники GENEVITY в Днепре: адрес, телефон, график работы. ☎ +380 73 000 0150" : locale === "en" ? "GENEVITY clinic contacts in Dnipro: address, phone, working hours. ☎ +380 73 000 0150" : "Контакти клініки GENEVITY у Дніпрі: адреса, телефон, графік роботи. ☎ +380 73 000 0150",
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
