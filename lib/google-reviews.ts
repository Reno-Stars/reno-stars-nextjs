import { writeFileSync } from 'fs';
import { join } from 'path';
import type { GoogleReview, GooglePlaceRating } from './types';
import fallbackCache from '../google-reviews-cache.json';

const REVALIDATE_24H = 86400;
const CACHE_PATH = join(process.cwd(), 'google-reviews-cache.json');

const EMPTY_RESULT: GooglePlaceRating = { rating: 0, userRatingCount: 0, reviews: [] } as const satisfies GooglePlaceRating;

interface RawReview {
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  publishTime?: string;
  relativePublishTimeDescription?: string;
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
      next: { revalidate: REVALIDATE_24H },
    },
  );
  if (!res.ok) {
    console.warn(`[getGoogleReviews] Places API ${sort} request failed: ${res.status} ${res.statusText}`);
    return { rating: 0, userRatingCount: 0, reviews: [] };
  }
  return res.json();
}

/** Write successful result to cache file (dev auto-updates, prod via script). */
function updateCache(data: GooglePlaceRating): void {
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2) + '\n');
  } catch {
    // Read-only filesystem (Vercel) — expected, silently ignore
  }
}

/** Return fallback cache if it has reviews. */
function getFallback(): GooglePlaceRating {
  const data = fallbackCache as GooglePlaceRating;
  if (data.reviews?.length > 0) {
    console.warn('[getGoogleReviews] Using fallback cache');
    return data;
  }
  return EMPTY_RESULT;
}

/**
 * Fetch Google Reviews via the Places API (New, v1).
 * Makes two requests (relevance + newest) to get up to 10 reviews,
 * deduplicates, and filters to 5-star only.
 * Uses Next.js fetch caching with 24h revalidation.
 * Falls back to a static cache file when the API is unavailable.
 */
export async function getGoogleReviews(): Promise<GooglePlaceRating> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return getFallback();

  try {
    const [relevant, newest] = await Promise.all([
      fetchReviews(placeId, apiKey, 'MOST_RELEVANT'),
      fetchReviews(placeId, apiKey, 'NEWEST'),
    ]);

    // Deduplicate by authorUri (unique per Google user), fall back to authorName
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

    // Only 5-star reviews
    const fiveStarReviews = allReviews.filter((r) => r.rating === 5);

    // If API returned no usable reviews, fall back to cache
    if (fiveStarReviews.length === 0 && relevant.rating === 0) {
      return getFallback();
    }

    const result: GooglePlaceRating = {
      rating: relevant.rating ?? 0,
      userRatingCount: relevant.userRatingCount ?? 0,
      reviews: fiveStarReviews,
    };

    updateCache(result);
    return result;
  } catch (error) {
    console.error('[getGoogleReviews] Failed to fetch reviews:', error);
    return getFallback();
  }
}
