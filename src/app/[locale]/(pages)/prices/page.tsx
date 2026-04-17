import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import PricesPageComponent from "@/components/pages/PricesPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: locale === "ru" ? "Цены на услуги" : locale === "en" ? "Prices" : "Ціни на послуги",
    description: locale === "ru" ? "Цены на услуги GENEVITY в Днепре: косметология, аппаратные процедуры, лазерная эпиляция, диагностика. ☎ +380 73 000 0150" : locale === "en" ? "GENEVITY prices in Dnipro: cosmetology, apparatus procedures, laser hair removal, diagnostics. ☎ +380 73 000 0150" : "Ціни на послуги GENEVITY у Дніпрі: косметологія, апаратні процедури, лазерна епіляція, діагностика. ☎ +380 73 000 0150",
    locale: locale as Locale,
    path: "/prices",
  });
}

export default async function PricesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <PricesPageComponent locale={locale as Locale} />
    </>
  );
}
