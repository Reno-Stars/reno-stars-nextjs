/**
 * Refresh the Google Reviews fallback cache file.
 *
 * Usage: pnpm reviews:cache
 *
 * This fetches live reviews from the Google Places API and writes them to
 * lib/google-reviews-cache.json. Run before deploys or periodically in CI
 * to ensure the fallback cache stays fresh.
 *
 * Requires GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID env vars.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface RawReview {
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  publishTime?: string;
  relativePublishTimeDescription?: string;
}

interface GoogleReview {
  authorName: string;
  authorUri: string;
  authorPhotoUri: string;
  rating: number;
  text: string;
  languageCode: string;
  publishTime: string;
  relativePublishTime: string;
}

interface GooglePlaceRating {
  rating: number;
  userRatingCount: number;
  reviews: GoogleReview[];
}

function mapReview(r: RawReview): GoogleReview {
  return {
    authorName: r.authorAttribution?.displayName ?? '',
    authorUri: r.authorAttribution?.uri ?? '',
    authorPhotoUri: r.authorAttribution?.photoUri ?? '',
    rating: r.rating ?? 0,
    text: r.text?.text ?? r.originalText?.text ?? '',
    languageCode: r.text?.languageCode ?? r.originalText?.languageCode ?? 'en',
    publishTime: r.publishTime ?? '',
    relativePublishTime: r.relativePublishTimeDescription ?? '',
  };
}

async function fetchReviews(
  placeId: string,
  apiKey: string,
  sort: 'MOST_RELEVANT' | 'NEWEST',
): Promise<{ rating: number; userRatingCount: number; reviews: RawReview[] }> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
        'X-Goog-Reviews-Sort': sort,
      },
    },
  );
  if (!res.ok) {
    throw new Error(`Places API ${sort} request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    console.error('Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID env vars.');
    process.exit(1);
  }

  console.log('Fetching Google Reviews...');
  const [relevant, newest] = await Promise.all([
    fetchReviews(placeId, apiKey, 'MOST_RELEVANT'),
    fetchReviews(placeId, apiKey, 'NEWEST'),
  ]);

  // Deduplicate by authorUri, fall back to authorName
  const seen = new Set<string>();
  const allReviews: GoogleReview[] = [];
  for (const r of [...(relevant.reviews ?? []), ...(newest.reviews ?? [])]) {
    const mapped = mapReview(r);
    const dedupeKey = mapped.authorUri || mapped.authorName;
    if (dedupeKey && !seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      allReviews.push(mapped);
    }
  }

  const fiveStarReviews = allReviews.filter((r) => r.rating === 5);

  const result: GooglePlaceRating = {
    rating: relevant.rating ?? 0,
    userRatingCount: relevant.userRatingCount ?? 0,
    reviews: fiveStarReviews,
  };

  const outPath = join(process.cwd(), 'lib/google-reviews-cache.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');

  console.log(`Cached ${fiveStarReviews.length} five-star reviews (${allReviews.length} total, ${result.rating}/5 rating, ${result.userRatingCount} total reviews).`);
  console.log(`Written to ${outPath}`);
}

main().catch((err) => {
  console.error('Failed to update reviews cache:', err);
  process.exit(1);
});
