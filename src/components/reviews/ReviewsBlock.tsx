import Image from "next/image";
import type { GoogleReview, ReviewsSummary } from "@/lib/db/queries/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} / 5`} className="text-main">
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function ReviewsBlock({
  reviews,
  summary,
  heading,
  countLabel,
}: {
  reviews: GoogleReview[];
  summary: ReviewsSummary;
  heading: string;
  countLabel: string;
}) {
  if (!reviews.length) return null;
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-block">
      <div className="mb-8">
        <h2 className="heading-2 text-black">{heading}</h2>
        <p className="body-m text-muted mt-2">
          <span className="body-strong text-main">{summary.average.toFixed(1)}</span>{" "}
          <Stars rating={summary.average} /> · {countLabel.replace("{n}", String(summary.count))}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
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
                  className="rounded-full w-10 h-10 object-cover"
                  unoptimized
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-champagne-darker inline-flex items-center justify-center body-strong text-main">
                  {r.authorName.charAt(0) || "G"}
                </span>
              )}
              <div>
                <p className="body-strong text-black text-sm">{r.authorName}</p>
                <Stars rating={r.rating} />
              </div>
            </div>
            {r.text && <p className="body-m text-muted line-clamp-6">{r.text}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
