import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import PricesPageComponent from "@/components/pages/PricesPage";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: locale === "ru" ? "Цены на услуги" : locale === "en" ? "Prices" : "Ціни на послуги",
    description: locale === "ru" ? "Цены на все услуги центра GENEVITY в Днепре. Консультации, аппаратная и инъекционная косметология, лазерная эпиляция, диагностика." : locale === "en" ? "Prices for all GENEVITY services in Dnipro. Consultations, apparatus and injectable cosmetology, laser hair removal, diagnostics." : "Ціни на всі послуги центру GENEVITY у Дніпрі. Консультації, апаратна та ін'єкційна косметологія, лазерна епіляція, діагностика.",
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
