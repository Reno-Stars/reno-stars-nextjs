/**
 * Refresh the Google Reviews fallback cache row in Postgres.
 *
 * Usage: pnpm reviews:cache
 *
 * This fetches live reviews from the Google Places API, translates them
 * to Chinese using OpenAI, and upserts the result into the
 * `google_reviews_cache` table (single row keyed by `cache_key='default'`).
 *
 * Replaces the old write-to-`google-reviews-cache.json` flow that was
 * triggering a fresh Vercel auto-deploy on every dev-server refresh.
 *
 * Run before deploys or periodically in CI to ensure the cache stays fresh.
 *
 * Requires GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID, and DATABASE_URL env vars.
 * Optional: OPENAI_API_KEY for Chinese translation (skipped if not set).
 */

import { eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { googleReviewsCache } from '../lib/db/schema';
import type { GoogleReview, GooglePlaceRating } from '../lib/types';
import type { RawReview } from '../lib/google-reviews';
import { mapReview } from '../lib/google-reviews';
import { AI_CONFIG, parseJsonResponse } from '../lib/ai/openai';

const CACHE_KEY = 'default';

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

/** Read the existing cached payload, or null on miss/error. */
async function readExistingCache(): Promise<GooglePlaceRating | null> {
  try {
    const rows = await db
      .select({ payload: googleReviewsCache.payload })
      .from(googleReviewsCache)
      .where(eq(googleReviewsCache.cacheKey, CACHE_KEY))
      .limit(1);
    return (rows[0]?.payload as GooglePlaceRating | undefined) ?? null;
  } catch (err) {
    console.warn('[reviews:cache] Failed to read existing cache row:', err);
    return null;
  }
}

/**
 * Per-locale display labels for the translation prompt. Keys are BCP-47 codes
 * matching the site's locale set in i18n/config.ts (minus `en` which is the
 * source). Order matches roughly priority for cost-bounded incremental
 * backfills: zh first because it's the largest non-EN market segment.
 *
 * If a tenant deploys a different locale set, update this map AND the
 * Locale union in i18n/config.ts in the same change.
 */
const TRANSLATION_TARGETS: Array<{ locale: import('../i18n/config').Locale; languageLabel: string }> = [
  { locale: 'zh', languageLabel: 'Simplified Chinese' },
  { locale: 'zh-Hant', languageLabel: 'Traditional Chinese (Taiwan variant)' },
  { locale: 'ja', languageLabel: 'Japanese' },
  { locale: 'ko', languageLabel: 'Korean' },
  { locale: 'es', languageLabel: 'Spanish (Latin American)' },
  { locale: 'fr', languageLabel: 'French (Canadian)' },
  { locale: 'ru', languageLabel: 'Russian' },
  { locale: 'tl', languageLabel: 'Tagalog' },
  { locale: 'vi', languageLabel: 'Vietnamese' },
  { locale: 'pa', languageLabel: 'Punjabi (Gurmukhi script)' },
  { locale: 'fa', languageLabel: 'Persian/Farsi' },
  { locale: 'ar', languageLabel: 'Arabic (Modern Standard)' },
  { locale: 'hi', languageLabel: 'Hindi (Devanagari script)' },
];

/**
 * Translate review texts into all configured locales using OpenAI.
 *
 * Per-review × per-locale write-once: if a review already has a translation
 * cached for a locale, we skip that pair. Each missing pair becomes one
 * batched API call (batched per LOCALE — we translate all reviews to zh in
 * one call, then all to ja in one call, etc.).
 *
 * Backward compat: continues to populate `review.textZh` from
 * `review.translations.zh` so older client code (`TestimonialsSection`'s
 * current zh-only filter) keeps working until the read-path PR drops it.
 *
 * Authorization for the LLM spend was granted by Hongming 2026-05-28 in
 * response to the cross-locale-parity audit (delegation 3cb8548f). Estimate:
 * ~$0.14 one-time for the initial backfill of ~10 reviews × 13 target locales
 * at gpt-4o-mini pricing; ~$0.01 per new review at steady state.
 */
async function translateReviews(reviews: GoogleReview[]): Promise<void> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.warn('[translate] OPENAI_API_KEY not set, skipping translation pass.');
    return;
  }

  // Reuse translations from the existing DB cache row for unchanged reviews.
  // Key by review.text + locale; value is the cached translated string.
  const existing = await readExistingCache();
  const existingTranslations = new Map<string, string>();
  for (const r of existing?.reviews ?? []) {
    if (r.translations) {
      for (const [locale, translated] of Object.entries(r.translations)) {
        if (translated) existingTranslations.set(`${r.text}|${locale}`, translated);
      }
    }
    // Migration path: previous cache rows used only textZh. Treat it as
    // translations.zh for the resume-from-cache logic.
    if (r.textZh && !existingTranslations.has(`${r.text}|zh`)) {
      existingTranslations.set(`${r.text}|zh`, r.textZh);
    }
  }

  // Apply existing cached translations to the in-memory reviews list.
  for (const r of reviews) {
    r.translations = r.translations ?? {};
    for (const { locale } of TRANSLATION_TARGETS) {
      const cached = existingTranslations.get(`${r.text}|${locale}`);
      if (cached) r.translations[locale] = cached;
    }
    // Keep textZh in sync for the deprecated read path (dropped in a follow-up PR).
    if (r.translations.zh) r.textZh = r.translations.zh;
  }

  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: openaiKey });

  for (const target of TRANSLATION_TARGETS) {
    const needs = reviews.filter((r) => !r.translations?.[target.locale]);
    if (needs.length === 0) {
      console.log(`[translate:${target.locale}] all reviews already have cached translations.`);
      continue;
    }
    console.log(`[translate:${target.locale}] translating ${needs.length} review(s) to ${target.languageLabel}…`);

    const textsToTranslate = needs.map((r, i) => `[${i}] ${r.text}`).join('\n---\n');
    let response;
    try {
      response = await client.chat.completions.create({
        model: AI_CONFIG.model,
        temperature: AI_CONFIG.temperature,
        messages: [
          {
            role: 'system',
            content:
              `You are a professional translator. Translate the following customer reviews from English to ${target.languageLabel}. ` +
              'Keep the tone natural and conversational. Preserve any proper nouns (company names, person names). ' +
              'Return a JSON array of translated strings in the same order. Only return the JSON array, no other text.',
          },
          { role: 'user', content: textsToTranslate },
        ],
      });
    } catch (err) {
      // One locale failing should NOT block the others — partial-success is
      // valuable (e.g. all 14 locales get translations except `pa` because of
      // a transient API error).
      console.error(`[translate:${target.locale}] API call failed:`, err);
      continue;
    }

    const content = response.choices[0]?.message?.content?.trim() ?? '';
    try {
      const translations = parseJsonResponse<string[]>(content);
      if (translations.length !== needs.length) {
        console.warn(`[translate:${target.locale}] expected ${needs.length} translations, got ${translations.length}`);
      }
      for (let i = 0; i < Math.min(translations.length, needs.length); i++) {
        needs[i].translations = needs[i].translations ?? {};
        needs[i].translations![target.locale] = translations[i];
        // Mirror to deprecated textZh for the transitional period.
        if (target.locale === 'zh') needs[i].textZh = translations[i];
      }
      console.log(`[translate:${target.locale}] ${Math.min(translations.length, needs.length)} review(s) translated.`);
    } catch (err) {
      console.error(`[translate:${target.locale}] failed to parse response:`, err);
      console.error(`[translate:${target.locale}] raw response (first 200 chars):`, content.slice(0, 200));
      // Don't propagate — continue to next locale.
    }
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

  await db
    .insert(googleReviewsCache)
    .values({ cacheKey: CACHE_KEY, payload: result, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: googleReviewsCache.cacheKey,
      set: { payload: result, updatedAt: new Date() },
    });

  console.log(
    `Cached ${fiveStarReviews.length} five-star reviews (${allReviews.length} total, ${result.rating}/5 rating, ${result.userRatingCount} total reviews).`,
  );
  console.log(`Upserted to google_reviews_cache (cache_key='${CACHE_KEY}').`);
}

main().catch((err) => {
  console.error('Failed to update reviews cache:', err);
  process.exit(1);
});
