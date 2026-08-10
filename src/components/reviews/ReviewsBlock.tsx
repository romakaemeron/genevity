import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { GoogleReview, ReviewsSummary } from "@/lib/db/queries/reviews";
import { formatReviewDate } from "@/lib/formatDate";

/**
 * Compact Google-reviews trust block for the homepage (TZ #10 §1).
 *
 * Top row: the clinic's overall Google rating, how many ratings it's based on,
 * and a link out to the Google profile. Below it, the 5 newest reviews —
 * author, stars, text, publication date and profile photo when Google gives
 * us one.
 *
 * Server-rendered on purpose: the review text ships in the HTML rather than
 * being fetched client-side, and the API data itself comes from the
 * `google_reviews` / `google_place_stats` cache refreshed by the daily cron —
 * never from Google on a page view.
 */

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-0.5 text-main ${className}`} aria-label={`${rating} / 5`}>
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
  if (!reviews.length) return null;
  // The spec asks for the 5 most recent; the query already sorts newest first.
  const latest = reviews.slice(0, 5);

  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-block">
      {/* Overall rating */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="heading-2 text-black">{heading}</h2>
          <p className="body-m text-muted mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Stars rating={summary.average} />
            <span className="body-strong text-main">{summary.average.toFixed(1)}</span>
            <span>{countLabel.replace("{n}", String(summary.count))}</span>
          </p>
        </div>
        {summary.profileUrl && (
          <a
            href={summary.profileUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="body-m text-main hover:text-black transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            {allReviewsLabel}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Latest 5 reviews, newest first */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {latest.map((r) => {
          const date = formatReviewDate(r.reviewTime, locale);
          return (
            <article
              key={r.id}
              className="rounded-[var(--radius-card)] bg-champagne-dark p-6 flex flex-col gap-3"
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
    </section>
  );
}
