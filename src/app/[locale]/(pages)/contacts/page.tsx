import { sanityClient } from "@/sanity/client";
import { getUiStringsData } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { SiteSettingsData } from "@/sanity/types";
import ContactsPageComponent from "@/components/pages/ContactsPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }

async function getSettings(locale: string): Promise<SiteSettingsData> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "siteSettings"][0] {
      phone1, phone2,
      "address": coalesce(address.${l}, address.uk),
      instagram,
      "hours": coalesce(hours.${l}, hours.uk),
    }
  `);
}

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
    getSettings(locale),
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
