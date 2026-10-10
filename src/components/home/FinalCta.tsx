"use client";

/**
 * ТЗ #16 §1.3 — the closing call-to-action above the footer on the homepage.
 *
 * A visitor who has read the whole page (services, doctors, reviews, FAQ) has
 * no obvious next step at the bottom, so this block pairs the offer copy with
 * the booking form rendered inline — no extra click to open a modal.
 *
 * All copy comes from `homepage_cta` so the offer ("…та отримайте діагностику
 * у подарунок") stays the client's to write and change.
 */

import Image from "next/image";
import { Check } from "lucide-react";
import BookingForm from "@/components/ui/BookingForm";
import type { HomepageCtaData } from "@/lib/db/queries/homepage-cta";
import { useScrollReveal } from "@/lib/useReveal";

export default function FinalCta({ data }: { data: HomepageCtaData }) {
  const { ref, visible } = useScrollReveal();

  if (!data.isEnabled) return null;

  const hasImage = Boolean(data.bgImage);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="final-cta"
      className={`scroll-mt-28 ${visible ? "revealed" : ""}`}
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="reveal relative overflow-hidden rounded-[var(--radius-card)] bg-main">
          {hasImage && (
            <>
              <Image
                src={data.bgImage!}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: data.bgFocalPoint }}
              />
              {/* Keeps the copy legible over any photo the editor uploads. */}
              <div className="absolute inset-0 bg-black/55" />
            </>
          )}

          <div className="relative grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
            <div className="flex flex-col gap-4">
              {data.eyebrow && (
                <span className="self-start rounded-full bg-champagne/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-champagne">
                  {data.eyebrow}
                </span>
              )}
              <h2 className="heading-2 text-champagne">{data.heading}</h2>
              {data.subtitle && (
                <p className="body-l text-champagne/70 max-w-[520px] leading-relaxed">{data.subtitle}</p>
              )}
              {data.benefits.length > 0 && (
                <ul className="mt-2 flex flex-col gap-2.5">
                  {data.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-champagne/20 text-champagne">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="body-m text-champagne/90">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {data.note && <p className="body-s text-champagne/50 mt-2 leading-relaxed">{data.note}</p>}
            </div>

            {/* Inline booking form — champagne card so the inputs keep their
                normal contrast instead of fighting the taupe background. */}
            <div className="rounded-[var(--radius-card)] bg-champagne p-5 sm:p-7">
              <BookingForm ctaKey="homepageFinal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
