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

export type ReviewsSummary = {
  count: number;
  average: number;
  /** Link to the clinic's Google profile — "Переглянути всі відгуки". Null
   *  until the Places refresh job has run at least once. */
  profileUrl: string | null;
};

/** Place-level aggregate cached from Places API (New). */
async function getPlaceStats(): Promise<{
  rating: number | null;
  count: number | null;
  mapsUri: string | null;
}> {
  try {
    const rows = await sql`
      SELECT rating, user_rating_count, maps_uri FROM google_place_stats WHERE id = 1
    `;
    const r = rows[0];
    if (!r) return { rating: null, count: null, mapsUri: null };
    return {
      rating: r.rating === null ? null : Number(r.rating),
      count: r.user_rating_count === null ? null : Number(r.user_rating_count),
      mapsUri: (r.maps_uri as string | null) || null,
    };
  } catch {
    // Table not migrated yet — fall back to the cached-review aggregate.
    return { rating: null, count: null, mapsUri: null };
  }
}

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

/**
 * Clinic-wide Google rating.
 *
 * Prefers the place-level aggregate (the true totals across every review
 * Google holds) and only falls back to averaging the cached rows — Places API
 * (New) hands us at most 5 of them, so that fallback would badly understate
 * the count.
 */
export async function getReviewsSummary(): Promise<ReviewsSummary> {
  const [rows, place] = await Promise.all([
    sql`
      SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS average
      FROM google_reviews WHERE hidden = false
    `,
    getPlaceStats(),
  ]);
  const r = rows[0] || { count: 0, average: 0 };
  const average = place.rating ?? r.average;
  const count = place.count ?? r.count;
  return {
    count,
    average: Math.round(average * 10) / 10,
    profileUrl: place.mapsUri,
  };
}
