import BookingCTA from "@/components/ui/BookingCTA";
import type { SectionPriceTeaser } from "@/sanity/types";

export default function PriceTeaserSection({ heading, intro, ctaLabel }: SectionPriceTeaser) {
  return (
    <section className="bg-champagne-dark rounded-[var(--radius-card)] p-8 lg:p-12">
      {heading && <h2 className="heading-3 text-black mb-3">{heading}</h2>}
      {intro && <p className="body-l text-muted mb-6">{intro}</p>}
      {ctaLabel && (
        <BookingCTA variant="primary" size="lg">
          {ctaLabel}
        </BookingCTA>
      )}
    </section>
  );
}
