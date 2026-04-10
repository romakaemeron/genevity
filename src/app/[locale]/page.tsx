import { getHomepageData } from "@/sanity/queries";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Equipment from "@/components/home/Equipment";
import Doctors from "@/components/home/Doctors";
import FAQ from "@/components/sections/FAQ";
import Contacts from "@/components/home/Contacts";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

// FAQ title per locale (static — rarely changes)
const faqTitles: Record<string, string> = {
  ua: "Часті запитання",
  ru: "Часто задаваемые вопросы",
  en: "Frequently Asked Questions",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await getHomepageData(locale);

  return (
    <div className="flex flex-col gap-16 lg:gap-[120px]">
      <Hero data={data.hero} />
      <div id="about"><About data={data.about} /></div>
      <div id="equipment">
        <Equipment items={data.equipment} ui={data.ui.equipment} />
      </div>
      <div id="doctors">
        <Doctors doctors={data.doctors} ui={data.ui.doctors} />
      </div>
      <FAQ items={data.faq} title={faqTitles[locale] || faqTitles.ua} />
      <div id="contacts">
        <Contacts data={{ settings: data.settings, ui: data.ui.contacts }} />
      </div>
    </div>
  );
}
