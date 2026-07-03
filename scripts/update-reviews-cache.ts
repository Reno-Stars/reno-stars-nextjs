/**
 * Manually refresh the Google Reviews cache row (fetch + translate + upsert).
 *
 * Usage: pnpm reviews:cache
 *
 * The same refresh now runs automatically in the background on a ~7-day
 * cadence, triggered lazily by site traffic (see `refreshReviewsCache` in
 * lib/google-reviews.ts). This script is the manual escape hatch — run it to
 * force an immediate refresh (e.g. after adding a new locale, or before a
 * demo). It replaced the local `com.renostars.reviews-cache` launchd cron,
 * which was removed 2026-07 when the refresh moved into the app itself.
 *
 * Requires GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID, and DATABASE_URL env vars.
 * No API key needed for translation — uses the public Google Translate
 * single-segment endpoint (per Reno Stars policy §5.2, 2026-05-29).
 */

import { refreshReviewsCache } from '../lib/google-reviews';

refreshReviewsCache()
  .then((s) => {
    console.log(
      `Cached ${s.reviewCount} five-star reviews (${s.rating}/5 rating, ${s.userRatingCount} total reviews).`,
    );
    console.log("Upserted to google_reviews_cache (cache_key='default').");
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to update reviews cache:', err);
    process.exit(1);
  });
