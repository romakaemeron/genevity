"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useScrollReveal } from "@/lib/useReveal";
import type { GoogleReview, ReviewsSummary } from "@/lib/db/queries/reviews";
import { formatReviewDate } from "@/lib/formatDate";

/**
 * Google-reviews trust block for the homepage (TZ #10 §1).
 *
 * Header carries the clinic's overall Google rating and how many ratings it's
 * based on; the reviews themselves scroll horizontally with arrow controls,
 * matching the Doctors and Media Coverage sliders, and the link out to the
 * Google profile sits below as an outline button.
 *
 * The API data comes from the `google_reviews` / `google_place_stats` cache
 * refreshed by the daily cron — never from Google on a page view. This is a
 * client component for the scrolling only; Next still server-renders it, so
 * the review text ships in the HTML.
 */

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-main" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className={i <= filled ? "" : "opacity-30"}
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewsBlock({
  reviews,
  summary,
  heading,
  countLabel,
  allReviewsLabel,
  locale,
}: {
  reviews: GoogleReview[];
  summary: ReviewsSummary;
  heading: string;
  /** "на основі {n} відгуків Google" — `{n}` is substituted. */
  countLabel: string;
  allReviewsLabel: string;
  locale: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);
  const { ref: headerRef, visible } = useScrollReveal();

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

  if (!reviews.length) return null;
  // The spec asks for the 5 most recent; the query already sorts newest first.
  const latest = reviews.slice(0, 5);

  return (
    <section>
      <div
        ref={headerRef as React.RefObject<HTMLDivElement>}
        className={`max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex flex-col gap-2 mb-10 ${visible ? "revealed" : ""}`}
      >
        <h2 className="reveal heading-2 text-black">{heading}</h2>
        <div className="reveal d1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <p className="body-m text-muted flex flex-wrap items-center gap-x-2 gap-y-1">
            <Stars rating={summary.average} />
            <span className="body-strong text-main">{summary.average.toFixed(1)}</span>
            <span>{countLabel.replace("{n}", String(summary.count))}</span>
          </p>
          <div className={`flex gap-2 shrink-0 ${hasOverflow ? "" : "hidden"}`}>
            <Button variant="secondary" icon size="sm" onClick={() => scroll("left")} disabled={!canScrollLeft}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="secondary" icon size="sm" onClick={() => scroll("right")} disabled={!canScrollRight}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div ref={scrollerRef} className="doctors-scroller scrollbar-hide">
        {latest.map((r) => {
          const date = formatReviewDate(r.reviewTime, locale);
          return (
            <article
              key={r.id}
              className="shrink-0 rounded-[var(--radius-card)] bg-champagne-dark p-6 flex flex-col gap-3"
              style={{ width: "min(360px, 82vw)", scrollSnapAlign: "start" }}
            >
              <div className="flex items-center gap-3">
                {r.authorPhoto ? (
                  <Image
                    src={r.authorPhoto}
                    alt={r.authorName}
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 object-cover shrink-0"
                    unoptimized
                  />
                ) : (
                  <span className="w-10 h-10 shrink-0 rounded-full bg-champagne-darker inline-flex items-center justify-center body-strong text-main">
                    {r.authorName.charAt(0) || "G"}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="body-strong text-black text-sm">{r.authorName}</p>
                  <Stars rating={r.rating} />
                </div>
              </div>
              {r.text && <p className="body-m text-muted line-clamp-6">{r.text}</p>}
              {date && (
                <time dateTime={r.reviewTime ?? undefined} className="body-s text-black-40 mt-auto pt-1">
                  {date}
                </time>
              )}
            </article>
          );
        })}
      </div>

      {summary.profileUrl && (
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] mt-6">
          <Button
            variant="outline"
            size="sm"
            href={summary.profileUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {allReviewsLabel}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </section>
  );
}
