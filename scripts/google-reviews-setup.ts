/**
 * Helper for wiring up real Google reviews (TZ #10 §1).
 *
 * The site never calls Google on a page view — `refreshGoogleReviews()` fills
 * the `google_reviews` / `google_place_stats` cache from a daily Vercel cron
 * (vercel.json → /api/cron/refresh-reviews), and pages read the cache. This
 * script is the one-off setup aid: it finds the clinic's Place ID and shows
 * exactly what Google returns, so you can confirm the credentials before
 * putting them in Vercel.
 *
 * Two providers are supported by src/lib/reviews/google.ts:
 *
 *   A. Places API (New)  — no approval needed, returns rating +
 *      userRatingCount + the 5 most recent reviews. This is what the TZ asks
 *      for. Needs: GOOGLE_MAPS_API_KEY, GOOGLE_PLACE_ID.
 *
 *   B. Business Profile API — returns ALL reviews and owner replies, but
 *      Google must approve your quota request first. Needs: GOOGLE_BP_*.
 *      If B is configured it wins over A.
 *
 * Usage
 *   # 1. Find the Place ID (needs GOOGLE_MAPS_API_KEY in .env.local)
 *   npx tsx scripts/google-reviews-setup.ts find "GENEVITY Дніпро"
 *
 *   # 2. Verify what Places returns for that ID (needs GOOGLE_PLACE_ID too)
 *   npx tsx scripts/google-reviews-setup.ts check
 *
 *   # 3. Pull them into the DB cache for real
 *   npx tsx scripts/google-reviews-setup.ts refresh
 */
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});
// src/lib/reviews/google.ts reads process.env directly.
for (const [k, v] of Object.entries(env)) process.env[k] ??= v;

/** Only the fields this script prints — the API returns far more. */
interface PlaceSummary {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}
interface PlaceDetails extends PlaceSummary {
  reviews?: {
    rating?: number;
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string };
  }[];
}

const KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

function requireKey(): string {
  if (!KEY) {
    console.error(
      "✗ GOOGLE_MAPS_API_KEY is not set in .env.local.\n" +
      "  Create one at https://console.cloud.google.com/apis/credentials\n" +
      "  and enable “Places API (New)” for the project (billing must be on).",
    );
    process.exit(1);
  }
  return KEY;
}

/** Text Search (New) — resolves a human query to Place IDs. */
async function find(query: string) {
  const key = requireKey();
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "uk" }),
  });
  if (!res.ok) {
    console.error(`✗ searchText failed: ${res.status}\n${await res.text()}`);
    process.exit(1);
  }
  const json = (await res.json()) as { places?: PlaceSummary[] };
  const places = json.places ?? [];
  if (!places.length) {
    console.log("No places matched. Try a more specific query.");
    return;
  }
  for (const p of places) {
    console.log(
      `\n${p.displayName?.text ?? "—"}\n` +
      `  ${p.formattedAddress ?? "—"}\n` +
      `  rating: ${p.rating ?? "—"}  ratings: ${p.userRatingCount ?? "—"}\n` +
      `  GOOGLE_PLACE_ID=${p.id}\n` +
      `  ${p.googleMapsUri ?? ""}`,
    );
  }
}

/** Place Details (New) — exactly the call refreshGoogleReviews() makes. */
async function check() {
  const key = requireKey();
  if (!PLACE_ID) {
    console.error("✗ GOOGLE_PLACE_ID is not set — run the `find` command first.");
    process.exit(1);
  }
  const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,googleMapsUri,reviews",
    },
  });
  if (!res.ok) {
    console.error(`✗ Place Details failed: ${res.status}\n${await res.text()}`);
    process.exit(1);
  }
  const json = (await res.json()) as PlaceDetails;
  console.log(`\n${json.displayName?.text ?? "—"}`);
  console.log(`rating: ${json.rating}   userRatingCount: ${json.userRatingCount}`);
  console.log(`googleMapsUri: ${json.googleMapsUri}`);
  console.log(`\nreviews returned: ${(json.reviews ?? []).length} (Places API caps this at 5)\n`);
  for (const r of json.reviews ?? []) {
    console.log(
      `  ★${r.rating}  ${r.authorAttribution?.displayName ?? "—"}  ${r.publishTime ?? "—"}\n` +
      `    ${(r.originalText?.text ?? r.text?.text ?? "").slice(0, 140).replace(/\s+/g, " ")}…`,
    );
  }
}

/** Run the real refresh so the cache is populated immediately. */
async function refresh() {
  const { refreshGoogleReviews } = await import("../src/lib/reviews/google");
  const result = await refreshGoogleReviews();
  console.log(`✓ provider=${result.provider} upserted=${result.upserted}`);
  if (result.provider === "none") {
    console.log(
      "  Neither provider is configured. Set GOOGLE_MAPS_API_KEY + GOOGLE_PLACE_ID\n" +
      "  (Places), or the five GOOGLE_BP_* variables (Business Profile).",
    );
  }
  process.exit(0);
}

const [command, ...rest] = process.argv.slice(2);
const run =
  command === "find" ? find(rest.join(" ") || "GENEVITY Дніпро")
  : command === "check" ? check()
  : command === "refresh" ? refresh()
  : Promise.resolve(console.log("Usage: find <query> | check | refresh"));

run.catch((e) => { console.error(e); process.exit(1); });
