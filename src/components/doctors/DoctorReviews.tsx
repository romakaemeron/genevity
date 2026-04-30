"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import BookingCTA from "@/components/ui/BookingCTA";
import type { DoctorReview } from "@/lib/db/types";

interface Props {
  reviews: DoctorReview[];
  locale: string;
  doctorSlug: string;
}

const L = {
  uk: { title: "Відгуки пацієнтів", write: "Поділитися враженням" },
  ru: { title: "Отзывы пациентов", write: "Оставить отзыв" },
  en: { title: "Patient Reviews", write: "Share Your Experience" },
};
const l = (locale: string) => L[locale as keyof typeof L] ?? L.uk;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5 text-main" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= n ? "currentColor" : "none"} stroke={i <= n ? "currentColor" : "#d1c7bb"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, locale }: { review: DoctorReview; locale: string }) {
  const { reviewerName, procedureTag, rating, reviewText, reviewedAt } = review;
  const initial = reviewerName.charAt(0).toUpperCase();
  const dateStr = new Date(reviewedAt).toLocaleDateString(
    locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US",
    { year: "numeric", month: "long" },
  );

  return (
    <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6 flex flex-col gap-4 h-full">
      {/* Quote + stars */}
      <div className="flex items-start justify-between gap-3">
        <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true" className="text-rosegold shrink-0 mt-0.5 opacity-60">
          <path d="M0 18V11C0 4.5 3.5 1 10.5 0L12 2C8 3 5.5 5.5 5 9h5V18H0zM13 18V11C13 4.5 16.5 1 23.5 0L25 2C21 3 18.5 5.5 18 9h5V18H13z" fill="currentColor" />
        </svg>
        <Stars n={rating} />
      </div>

      {/* Text */}
      <p className="body-m text-black-70 leading-relaxed flex-1">{reviewText}</p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-black/[0.06]">
        <div className="w-9 h-9 rounded-full bg-main/10 text-main flex items-center justify-center font-semibold text-sm shrink-0 select-none">
          {initial}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="body-strong text-black text-sm leading-none">{reviewerName}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {procedureTag && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-champagne border border-champagne-darker text-black-50">
                {procedureTag}
              </span>
            )}
            <span className="body-s text-black-40">{dateStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorReviews({ reviews, locale, doctorSlug }: Props) {
  if (!reviews.length) return null;

  const labels = l(locale);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    setHasOverflow(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    if (!cards.length) return;
    const scrollPad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const currentScroll = el.scrollLeft;
    let currentIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const dist = Math.abs(cards[i].offsetLeft - scrollPad - currentScroll);
      if (dist < minDist) { minDist = dist; currentIdx = i; }
    }
    const nextIdx = Math.max(0, Math.min(cards.length - 1, currentIdx + (dir === "left" ? -1 : 1)));
    el.scrollTo({ left: cards[nextIdx].offsetLeft - scrollPad, behavior: "smooth" });
  };

  return (
    <section className="bg-champagne py-12 lg:py-16">
      {/* Header: title + write review button + arrows */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex flex-col gap-2 mb-8"
      >
        <motion.div variants={fadeInUp} className="flex items-center justify-between gap-4">
          <h2 className="heading-2 text-black">{labels.title}</h2>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`flex gap-2 ${hasOverflow ? "" : "hidden"}`}>
              <Button variant="secondary" icon size="sm" onClick={() => scroll("left")} disabled={!canScrollLeft}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="secondary" icon size="sm" onClick={() => scroll("right")} disabled={!canScrollRight}>
                <ChevronRight size={16} />
              </Button>
            </div>
            <BookingCTA
              ctaKey="writeReview"
              variant="secondary"
              size="sm"
              initialInterest={`review:${doctorSlug}`}
            >
              {labels.write}
            </BookingCTA>
          </div>
        </motion.div>
      </motion.div>

      {/* Scrollable cards */}
      <div ref={scrollerRef} className="doctors-scroller scrollbar-hide">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="shrink-0"
            style={{ width: "min(320px, 80vw)", scrollSnapAlign: "start" }}
          >
            <ReviewCard review={review} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}
