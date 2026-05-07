import { eq } from 'drizzle-orm';
import { db } from './db';
import { googleReviewsCache } from './db/schema';
import type { GoogleReview, GooglePlaceRating } from './types';

const REVALIDATE_24H = 86400;
const CACHE_KEY = 'default';

const EMPTY_RESULT: GooglePlaceRating = { rating: 0, userRatingCount: 0, reviews: [] } as const satisfies GooglePlaceRating;

export interface RawReview {
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  publishTime?: string;
  relativePublishTimeDescription?: string;
}

export function mapReview(r: RawReview): GoogleReview {
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

/** Read the cached fallback row from the database. Returns null on miss/error. */
async function readCacheRow(): Promise<GooglePlaceRating | null> {
  try {
    const rows = await db
      .select({ payload: googleReviewsCache.payload })
      .from(googleReviewsCache)
      .where(eq(googleReviewsCache.cacheKey, CACHE_KEY))
      .limit(1);
    const payload = rows[0]?.payload as GooglePlaceRating | undefined;
    return payload ?? null;
  } catch (error) {
    console.warn('[getGoogleReviews] Failed to read cache row:', error);
    return null;
  }
}

/** Upsert the cache row with a successful API result. Silently ignores errors. */
async function updateCache(data: GooglePlaceRating): Promise<void> {
  try {
    await db
      .insert(googleReviewsCache)
      .values({ cacheKey: CACHE_KEY, payload: data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: googleReviewsCache.cacheKey,
        set: { payload: data, updatedAt: new Date() },
      });
  } catch (error) {
    // DB unreachable / read-only — expected in some environments, don't block render.
    console.warn('[getGoogleReviews] Failed to update cache row:', error);
  }
}

/**
 * Fetch Google Reviews via the Places API (New, v1).
 * Makes two requests (relevance + newest) to get up to 10 reviews,
 * deduplicates, and filters to 5-star only.
 * Uses Next.js fetch caching with 24h revalidation.
 * Falls back to a Postgres-stored cache row when the API is unavailable;
 * the row is also the source of AI-generated Chinese translations.
 */
export async function getGoogleReviews(): Promise<GooglePlaceRating> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Cached row is the source of Chinese translations even when the API succeeds.
  const cached = await readCacheRow();

  if (!apiKey || !placeId) {
    if (cached && cached.reviews?.length > 0) {
      console.warn('[getGoogleReviews] Using cached fallback (no API credentials)');
      return cached;
    }
    return EMPTY_RESULT;
  }

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
      if (cached && cached.reviews?.length > 0) {
        console.warn('[getGoogleReviews] Using cached fallback (empty API response)');
        return cached;
      }
      return EMPTY_RESULT;
    }

    // Merge cached Chinese translations into fresh reviews
    const cachedTranslations = new Map<string, string>();
    for (const r of cached?.reviews ?? []) {
      if (r.textZh) {
        const key = r.authorUri || r.authorName;
        if (key) cachedTranslations.set(key, r.textZh);
      }
    }
    for (const r of fiveStarReviews) {
      const key = r.authorUri || r.authorName;
      if (key && cachedTranslations.has(key)) {
        r.textZh = cachedTranslations.get(key);
      }
    }

    const result: GooglePlaceRating = {
      rating: relevant.rating ?? 0,
      userRatingCount: relevant.userRatingCount ?? 0,
      reviews: fiveStarReviews,
    };

    await updateCache(result);
    return result;
  } catch (error) {
    console.error('[getGoogleReviews] Failed to fetch reviews:', error);
    if (cached && cached.reviews?.length > 0) {
      console.warn('[getGoogleReviews] Using cached fallback (fetch error)');
      return cached;
    }
    return EMPTY_RESULT;
  }
}
