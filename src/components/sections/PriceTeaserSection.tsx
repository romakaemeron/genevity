"use client";

import { useScrollReveal } from "@/lib/useReveal";
import BookingCTA from "@/components/ui/BookingCTA";
import type { SectionPriceTeaser } from "@/lib/db/types";

export default function PriceTeaserSection({ heading, intro, ctaLabel }: SectionPriceTeaser) {
  const { ref, visible } = useScrollReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`reveal rounded-[var(--radius-card)] bg-gradient-to-br from-champagne-dark to-champagne-darker p-8 lg:p-12 ${visible ? "revealed" : ""}`}>
      <div className="flex flex-col gap-6">
        {heading && <h2 className="heading-3 text-black">{heading}</h2>}
        {intro && <p className="body-l text-muted max-w-2xl">{intro}</p>}
        {ctaLabel && <BookingCTA ctaKey="priceTeaser" variant="primary" size="lg" className="self-start">{ctaLabel}</BookingCTA>}
      </div>
    </section>
  );
}
