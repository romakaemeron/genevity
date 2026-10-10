"use client";

/**
 * ТЗ #16 §1.2 — "Акції / Спеціальні пропозиції" on the homepage.
 *
 * A responsive card grid: badge, title, short description, optional end date
 * and fine print. A card either links to a page (`ctaHref`, always
 * site-internal) or opens the booking modal, so every offer has exactly one
 * obvious next step.
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import BookingCTA from "@/components/ui/BookingCTA";
import type { PromotionView } from "@/lib/db/queries/promotions";
import { useScrollReveal } from "@/lib/useReveal";

const COPY = {
  ua: {
    title: "Акції та спеціальні пропозиції",
    subtitle: "Актуальні пропозиції центру GENEVITY. Кількість місць за акційною ціною обмежена.",
    until: "Діє до",
    book: "Записатися",
    details: "Детальніше",
  },
  ru: {
    title: "Акции и специальные предложения",
    subtitle: "Актуальные предложения центра GENEVITY. Количество мест по акционной цене ограничено.",
    until: "Действует до",
    book: "Записаться",
    details: "Подробнее",
  },
  en: {
    title: "Offers & special pricing",
    subtitle: "Current GENEVITY offers. Places at the promotional price are limited.",
    until: "Valid until",
    book: "Book now",
    details: "Learn more",
  },
} as const;

/** Locale-appropriate "15 березня 2026" style date for the offer deadline. */
function formatDate(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const tag = locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uk-UA";
  return d.toLocaleDateString(tag, { day: "numeric", month: "long", year: "numeric" });
}

export default function Promotions({
  promotions, locale,
}: { promotions: PromotionView[]; locale: string }) {
  const t = COPY[locale as keyof typeof COPY] ?? COPY.ua;
  const { ref, visible } = useScrollReveal();

  if (!promotions.length) return null;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="promotions"
      className={`scroll-mt-28 ${visible ? "revealed" : ""}`}
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="reveal flex flex-col gap-2 mb-8">
          <h2 className="heading-2 text-black">{t.title}</h2>
          <p className="body-l text-black-60 max-w-[600px]">{t.subtitle}</p>
        </div>

        <ul className="reveal d1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((p) => (
            <li
              key={p.id}
              className="flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-champagne-dark"
            >
              {p.imageUrl && (
                <div className="relative aspect-[16/10] w-full bg-champagne-darker">
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    title={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                    className="object-cover"
                    style={{ objectPosition: p.imageFocalPoint }}
                  />
                  {p.badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-main px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-champagne shadow-sm">
                      {p.badge}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col gap-3 p-6">
                {p.badge && !p.imageUrl && (
                  <span className="self-start rounded-full bg-main px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-champagne">
                    {p.badge}
                  </span>
                )}
                <h3 className="heading-3 text-black">{p.title}</h3>
                {p.description && (
                  <p className="body-m text-black-70 leading-relaxed">{p.description}</p>
                )}

                <div className="mt-auto flex flex-col gap-3 pt-2">
                  {p.validUntil && (
                    <p className="body-s text-black-50">
                      {t.until}&nbsp;{formatDate(p.validUntil, locale)}
                    </p>
                  )}
                  {p.ctaHref ? (
                    <Link
                      href={p.ctaHref}
                      className="group inline-flex items-center gap-1.5 self-start body-strong text-main transition-colors hover:text-main-dark"
                    >
                      {p.ctaLabel || t.details}
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <BookingCTA
                      ctaKey="homepagePromotions"
                      variant="primary"
                      size="sm"
                      initialInterest={undefined}
                      className="self-start"
                    >
                      {p.ctaLabel || t.book}
                    </BookingCTA>
                  )}
                  {p.terms && <p className="body-s text-black-40 leading-relaxed">{p.terms}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
