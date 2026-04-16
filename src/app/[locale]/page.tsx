import { getHomepageData } from "@/sanity/queries";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Equipment from "@/components/home/Equipment";
import Advantages from "@/components/home/Advantages";
import Doctors from "@/components/home/Doctors";
import HomeFaq from "@/components/home/HomeFaq";
import Contacts from "@/components/home/Contacts";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

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
