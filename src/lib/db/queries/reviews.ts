import { sql } from "../client";

export type GoogleReview = {
  id: string;
  source: "gbp" | "places";
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  replyText: string | null;
  reviewTime: string | null;
};

export type ReviewsSummary = { count: number; average: number };

export async function getClinicReviews(limit = 12): Promise<GoogleReview[]> {
  const rows = await sql`
    SELECT id, source, author_name, author_photo, rating, text, reply_text, review_time
    FROM google_reviews
    WHERE hidden = false
    ORDER BY review_time DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    authorName: r.author_name || "",
    authorPhoto: r.author_photo || null,
    rating: Number(r.rating),
    text: r.text || "",
    replyText: r.reply_text || null,
    reviewTime: r.review_time ? new Date(r.review_time).toISOString() : null,
  }));
}

export async function getReviewsSummary(): Promise<ReviewsSummary> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS average
    FROM google_reviews WHERE hidden = false
  `;
  const r = rows[0] || { count: 0, average: 0 };
  return { count: r.count, average: Math.round(r.average * 10) / 10 };
}
