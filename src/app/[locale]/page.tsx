import Hero from "@/components/sections/Hero";
import Concerns from "@/components/sections/Concerns";
import Services from "@/components/sections/Services";
import Technology from "@/components/sections/Technology";
import CTAForm from "@/components/sections/CTAForm";
import Experts from "@/components/sections/Experts";
import Stats from "@/components/sections/Stats";
import FAQ from "@/components/sections/FAQ";
import BeforeAfter from "@/components/sections/BeforeAfter";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-[var(--spacing-section)]">
      <Hero />
      <Concerns />
      <Services />
      <Technology />
      <CTAForm />
      <Experts />
      <Stats />
      <FAQ />
      <BeforeAfter />
      <CTAForm variant="alt" />
    </div>
  );
}
