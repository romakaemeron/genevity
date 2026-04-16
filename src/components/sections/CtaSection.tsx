import BookingCTA from "@/components/ui/BookingCTA";
import type { SectionCta } from "@/sanity/types";

export default function CtaSection({ heading, body, ctaLabel }: SectionCta) {
  return (
    <section className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
      {heading && <h2 className="heading-2 text-champagne mb-4">{heading}</h2>}
      {body && <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">{body}</p>}
      {ctaLabel && (
        <BookingCTA
          variant="secondary"
          size="lg"
          className="bg-champagne text-black hover:bg-champagne-dark"
        >
          {ctaLabel}
        </BookingCTA>
      )}
    </section>
  );
}
