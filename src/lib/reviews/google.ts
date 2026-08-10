import { sql } from "@/lib/db/client";

type NormalizedReview = {
  source: "gbp" | "places";
  externalId: string;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  replyText: string | null;
  reviewTime: string | null; // ISO
};

function hasGbp() {
  return Boolean(
    process.env.GOOGLE_BP_CLIENT_ID && process.env.GOOGLE_BP_CLIENT_SECRET &&
    process.env.GOOGLE_BP_REFRESH_TOKEN && process.env.GOOGLE_BP_ACCOUNT_ID &&
    process.env.GOOGLE_BP_LOCATION_ID,
  );
}
function hasPlaces() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_PLACE_ID);
}

const STAR_WORD: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

async function gbpAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_BP_CLIENT_ID!,
      client_secret: process.env.GOOGLE_BP_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_BP_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`GBP token refresh failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

interface GbpReview {
  reviewId: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string };
  starRating?: string;
  comment?: string;
  reviewReply?: { comment?: string };
  createTime?: string;
}

interface GbpReviewsResponse {
  reviews?: GbpReview[];
  nextPageToken?: string;
}

async function fetchGbp(): Promise<NormalizedReview[]> {
  const token = await gbpAccessToken();
  const url = `https://mybusiness.googleapis.com/v4/accounts/${process.env.GOOGLE_BP_ACCOUNT_ID}/locations/${process.env.GOOGLE_BP_LOCATION_ID}/reviews`;
  const out: NormalizedReview[] = [];
  let pageToken: string | undefined;
  do {
    const res = await fetch(pageToken ? `${url}?pageToken=${encodeURIComponent(pageToken)}` : url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`GBP reviews fetch failed: ${res.status}`);
    const json = (await res.json()) as GbpReviewsResponse;
    for (const rv of json.reviews ?? []) {
      out.push({
        source: "gbp",
        externalId: `gbp:${rv.reviewId}`,
        authorName: rv.reviewer?.displayName ?? "",
        authorPhoto: rv.reviewer?.profilePhotoUrl ?? null,
        rating: STAR_WORD[rv.starRating ?? ""] ?? 0,
        text: rv.comment ?? "",
        replyText: rv.reviewReply?.comment ?? null,
        reviewTime: rv.createTime ?? null,
      });
    }
    pageToken = json.nextPageToken;
  } while (pageToken);
  return out.filter((r) => r.rating >= 1);
}

// Places API (New) — Review resource shape per
// https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places#Review
interface PlacesReview {
  name?: string;
  rating?: number;
  /** Google's translation into the request language. */
  text?: { text?: string; languageCode?: string };
  /** Exactly what the reviewer wrote, in the language they wrote it. */
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  publishTime?: string;
}

interface PlacesReviewsResponse {
  reviews?: PlacesReview[];
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

// NOTE: Places API (New) returns at most 5 reviews per place and has no
// paging, unlike GBP (which pages all reviews). So the *aggregate* must come
// from the place-level `rating` / `userRatingCount` fields rather than from
// the cached review rows — those are persisted into google_place_stats here
// and read back by getReviewsSummary.
async function fetchPlaces(): Promise<NormalizedReview[]> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${process.env.GOOGLE_PLACE_ID}`,
    {
      headers: {
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount,googleMapsUri",
      },
    },
  );
  if (!res.ok) throw new Error(`Places fetch failed: ${res.status}`);
  const json = (await res.json()) as PlacesReviewsResponse;

  await savePlaceStats({
    rating: typeof json.rating === "number" ? json.rating : null,
    userRatingCount: typeof json.userRatingCount === "number" ? json.userRatingCount : null,
    mapsUri: json.googleMapsUri ?? null,
  });

  return (json.reviews ?? [])
    .map((rv, i): NormalizedReview => ({
      source: "places",
      externalId: `places:${rv.name ?? i}`,
      authorName: rv.authorAttribution?.displayName ?? "",
      authorPhoto: rv.authorAttribution?.photoUri ?? null,
      rating: Number(rv.rating ?? 0),
      // Prefer the review as written. Google auto-translates `text` (our
      // reviewers write Ukrainian, and it was coming back as English), which
      // reads as fake on a Ukrainian clinic's site.
      text: rv.originalText?.text ?? rv.text?.text ?? "",
      replyText: null,
      reviewTime: rv.publishTime ?? null,
    }))
    .filter((r) => r.rating >= 1);
}

/** Persist the place-level aggregate into the single-row stats table. Null
 *  fields are left untouched so a partial API response never wipes a good
 *  cached value. */
async function savePlaceStats(stats: {
  rating: number | null;
  userRatingCount: number | null;
  mapsUri: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO google_place_stats (id, rating, user_rating_count, maps_uri, updated_at)
    VALUES (1, ${stats.rating}, ${stats.userRatingCount}, ${stats.mapsUri}, now())
    ON CONFLICT (id) DO UPDATE SET
      rating            = COALESCE(EXCLUDED.rating, google_place_stats.rating),
      user_rating_count = COALESCE(EXCLUDED.user_rating_count, google_place_stats.user_rating_count),
      maps_uri          = COALESCE(EXCLUDED.maps_uri, google_place_stats.maps_uri),
      updated_at        = now()
  `;
}

async function upsert(reviews: NormalizedReview[]): Promise<number> {
  for (const r of reviews) {
    await sql`
      INSERT INTO google_reviews (source, external_id, author_name, author_photo, rating, text, reply_text, review_time, fetched_at)
      VALUES (${r.source}, ${r.externalId}, ${r.authorName}, ${r.authorPhoto}, ${r.rating}, ${r.text}, ${r.replyText}, ${r.reviewTime}, now())
      ON CONFLICT (external_id) DO UPDATE SET
        author_name = EXCLUDED.author_name, author_photo = EXCLUDED.author_photo,
        rating = EXCLUDED.rating, text = EXCLUDED.text, reply_text = EXCLUDED.reply_text,
        review_time = EXCLUDED.review_time, fetched_at = now()
    `;
  }
  return reviews.length;
}

export async function refreshGoogleReviews(): Promise<{ provider: "gbp" | "places" | "none"; upserted: number }> {
  if (hasGbp()) return { provider: "gbp", upserted: await upsert(await fetchGbp()) };
  if (hasPlaces()) return { provider: "places", upserted: await upsert(await fetchPlaces()) };
  return { provider: "none", upserted: 0 };
}
