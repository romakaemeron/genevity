import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Equipment from "@/components/home/Equipment";
import Doctors from "@/components/home/Doctors";
import Contacts from "@/components/home/Contacts";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 lg:gap-[120px]">
      <Hero />
      <div id="about"><About /></div>
      <div id="equipment"><Equipment /></div>
      {/* <CTAForm /> */}
      <div id="doctors"><Doctors /></div>
      {/* <CTAForm variant="alt" /> */}
      <div id="contacts"><Contacts /></div>
    </div>
  );
}
