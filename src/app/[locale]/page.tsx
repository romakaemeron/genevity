import { getHomepageData } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Equipment from "@/components/home/Equipment";
import Advantages from "@/components/home/Advantages";
import Doctors from "@/components/home/Doctors";
import HomeFaq from "@/components/home/HomeFaq";
import Contacts from "@/components/home/Contacts";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    ua: "Центр естетичної медицини та довголіття у Дніпрі",
    ru: "Центр эстетической медицины и долголетия в Днепре",
    en: "Aesthetic Medicine & Longevity Center in Dnipro",
  };
  const descriptions: Record<string, string> = {
    ua: "GENEVITY — центр естетичної медицини у Дніпрі. Косметологія, апаратні процедури, longevity-програми. ☎ +380 73 000 0150",
    ru: "GENEVITY — центр эстетической медицины в Днепре. Косметология, аппаратные процедуры, longevity-программы. ☎ +380 73 000 0150",
    en: "GENEVITY — aesthetic medicine center in Dnipro. Cosmetology, apparatus procedures, longevity programs. ☎ +380 73 000 0150",
  };
  return generatePageMetadata({
    title: titles[locale] || titles.ua,
    description: descriptions[locale] || descriptions.ua,
    locale: locale as Locale,
    path: "/",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await getHomepageData(locale);

  return (
    <>
      {/* Sticky solid header — slides in once the hero scrolls past */}
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="hero-end-sentinel" />
      <div className="flex flex-col gap-16 lg:gap-[120px]">
        <Hero data={data.hero} />
      <div id="about"><About data={data.about} /></div>
      <div id="equipment">
        <Equipment items={data.equipment} ui={data.ui.equipment} />
      </div>
      <div id="advantages">
        <Advantages locale={locale} />
      </div>
      <div id="doctors">
        <Doctors doctors={data.doctors} ui={data.ui.doctors} detailsLabel={data.ui.equipment.details} />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 mt-6">
          <Link href="/doctors">
            <Button variant="outline" size="sm">
              Всі лікарі
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
      <div id="faq">
        <HomeFaq locale={locale} />
      </div>
        <div id="contacts">
          <Contacts data={{ settings: data.settings, ui: data.ui.contacts }} />
        </div>
      </div>
    </>
  );
}
