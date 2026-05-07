/**
 * One-time seed: import the legacy `google-reviews-cache.json` file into
 * the `google_reviews_cache` Postgres row.
 *
 * Usage: pnpm tsx scripts/seed-google-reviews-cache.ts
 *
 * Run this once after `pnpm db:push` to preserve the existing Chinese
 * translations (otherwise the next `pnpm reviews:cache` run will burn
 * OpenAI tokens to re-translate all reviews).
 *
 * Idempotent: re-running just overwrites the row with whatever is currently
 * in the JSON file. Safe to delete the script (and the JSON file) once the
 * row is populated.
 *
 * Requires DATABASE_URL.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../lib/db';
import { googleReviewsCache } from '../lib/db/schema';
import type { GooglePlaceRating } from '../lib/types';

const CACHE_KEY = 'default';
const JSON_PATH = join(process.cwd(), 'google-reviews-cache.json');

async function main() {
  if (!existsSync(JSON_PATH)) {
    console.error(`Legacy cache file not found at ${JSON_PATH}.`);
    console.error('Nothing to seed. Run `pnpm reviews:cache` to populate from the live API instead.');
    process.exit(1);
  }

  const raw = readFileSync(JSON_PATH, 'utf-8');
  const payload = JSON.parse(raw) as GooglePlaceRating;

  if (!Array.isArray(payload.reviews)) {
    console.error('Legacy cache file is malformed: missing reviews[].');
    process.exit(1);
  }

  await db
    .insert(googleReviewsCache)
    .values({ cacheKey: CACHE_KEY, payload, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: googleReviewsCache.cacheKey,
      set: { payload, updatedAt: new Date() },
    });

  console.log(
    `Seeded google_reviews_cache from ${JSON_PATH}: ` +
      `${payload.reviews.length} reviews, ${payload.rating}/5 (${payload.userRatingCount} total).`,
  );
}

main().catch((err) => {
  console.error('Failed to seed google_reviews_cache:', err);
  process.exit(1);
});
