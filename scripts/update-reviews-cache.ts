/**
 * Refresh the Google Reviews fallback cache file.
 *
 * Usage: pnpm reviews:cache
 *
 * This fetches live reviews from the Google Places API, translates them
 * to Chinese using OpenAI, and writes the result to google-reviews-cache.json.
 * Run before deploys or periodically in CI to ensure the cache stays fresh.
 *
 * Requires GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID env vars.
 * Optional: OPENAI_API_KEY for Chinese translation (skipped if not set).
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { GoogleReview, GooglePlaceRating } from '../lib/types';
import type { RawReview } from '../lib/google-reviews';
import { mapReview } from '../lib/google-reviews';
import { AI_CONFIG, parseJsonResponse } from '../lib/ai/openai';

const CACHE_PATH = join(process.cwd(), 'google-reviews-cache.json');

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

/**
 * Translate review texts to Chinese using OpenAI.
 * Sends all reviews in a single batch request for efficiency.
 */
async function translateReviews(reviews: GoogleReview[]): Promise<void> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.warn('[translate] OPENAI_API_KEY not set, skipping Chinese translation.');
    return;
  }

  // Load existing cache to reuse translations for unchanged reviews
  const existingTranslations = new Map<string, string>();
  if (existsSync(CACHE_PATH)) {
    try {
      const cached = JSON.parse(readFileSync(CACHE_PATH, 'utf-8')) as GooglePlaceRating;
      for (const r of cached.reviews ?? []) {
        if (r.textZh) {
          existingTranslations.set(r.text, r.textZh);
        }
      }
    } catch { /* ignore parse errors */ }
  }

  // Only translate reviews that don't already have a cached translation
  const needsTranslation = reviews.filter((r) => !existingTranslations.has(r.text));

  // Apply existing translations
  for (const r of reviews) {
    const cached = existingTranslations.get(r.text);
    if (cached) r.textZh = cached;
  }

  if (needsTranslation.length === 0) {
    console.log('[translate] All reviews already have cached translations.');
    return;
  }

  console.log(`[translate] Translating ${needsTranslation.length} review(s) to Chinese...`);

  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: openaiKey });

  // Batch all texts into a single API call
  const textsToTranslate = needsTranslation.map((r, i) => `[${i}] ${r.text}`).join('\n---\n');

  const response = await client.chat.completions.create({
    model: AI_CONFIG.model,
    temperature: AI_CONFIG.temperature,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional translator. Translate the following customer reviews from English to Simplified Chinese. ' +
          'Keep the tone natural and conversational. Preserve any proper nouns (company names, person names). ' +
          'Return a JSON array of translated strings in the same order. Only return the JSON array, no other text.',
      },
      { role: 'user', content: textsToTranslate },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim() ?? '';
  try {
    const translations = parseJsonResponse<string[]>(content);
    if (translations.length !== needsTranslation.length) {
      console.warn(`[translate] Expected ${needsTranslation.length} translations, got ${translations.length}`);
    }
    for (let i = 0; i < Math.min(translations.length, needsTranslation.length); i++) {
      needsTranslation[i].textZh = translations[i];
    }
    console.log(`[translate] Successfully translated ${Math.min(translations.length, needsTranslation.length)} review(s).`);
  } catch (err) {
    console.error('[translate] Failed to parse translation response:', err);
    console.error('[translate] Raw response:', content.slice(0, 200));
  }
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

  // Translate reviews to Chinese
  await translateReviews(fiveStarReviews);

  const result: GooglePlaceRating = {
    rating: relevant.rating ?? 0,
    userRatingCount: relevant.userRatingCount ?? 0,
    reviews: fiveStarReviews,
  };

  writeFileSync(CACHE_PATH, JSON.stringify(result, null, 2) + '\n');

  console.log(`Cached ${fiveStarReviews.length} five-star reviews (${allReviews.length} total, ${result.rating}/5 rating, ${result.userRatingCount} total reviews).`);
  console.log(`Written to ${CACHE_PATH}`);
}

main().catch((err) => {
  console.error('Failed to update reviews cache:', err);
  process.exit(1);
});
