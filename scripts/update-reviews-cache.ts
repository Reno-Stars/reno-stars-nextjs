/**
 * Refresh the Google Reviews fallback cache row in Postgres.
 *
 * Usage: pnpm reviews:cache
 *
 * This fetches live reviews from the Google Places API, machine-translates
 * them to all configured locales using the FREE `translate.googleapis.com`
 * unauthenticated endpoint, and upserts the result into the
 * `google_reviews_cache` table (single row keyed by `cache_key='default'`).
 *
 * Replaces the old write-to-`google-reviews-cache.json` flow that was
 * triggering a fresh Vercel auto-deploy on every dev-server refresh.
 *
 * Run before deploys or periodically in CI to ensure the cache stays fresh.
 *
 * Requires GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID, and DATABASE_URL env vars.
 * No API key needed for translation — uses the public Google Translate
 * single-segment endpoint (per Reno Stars policy §5.2 added 2026-05-29:
 * translations are a FREE-TIER capability, not paid).
 */

import { eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { googleReviewsCache } from '../lib/db/schema';
import type { GoogleReview, GooglePlaceRating } from '../lib/types';
import type { RawReview } from '../lib/google-reviews';
import { mapReview } from '../lib/google-reviews';

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
 * Per-locale display labels + Google Translate target-language (tl) codes.
 * Keys are BCP-47 codes matching the site's locale set in i18n/config.ts
 * (minus `en` which is the source). `tlCode` is the value passed in the
 * `&tl=` query param of the translate.googleapis.com endpoint — for
 * Chinese variants this differs from the BCP-47 code (zh → zh-CN,
 * zh-Hant → zh-TW).
 *
 * If a tenant deploys a different locale set, update this map AND the
 * Locale union in i18n/config.ts in the same change.
 */
const TRANSLATION_TARGETS: Array<{
  locale: import('../i18n/config').Locale;
  languageLabel: string;
  tlCode: string;
}> = [
  { locale: 'zh',      languageLabel: 'Simplified Chinese',              tlCode: 'zh-CN' },
  { locale: 'zh-Hant', languageLabel: 'Traditional Chinese (Taiwan)',    tlCode: 'zh-TW' },
  { locale: 'ja',      languageLabel: 'Japanese',                        tlCode: 'ja' },
  { locale: 'ko',      languageLabel: 'Korean',                          tlCode: 'ko' },
  { locale: 'es',      languageLabel: 'Spanish (Latin American)',        tlCode: 'es' },
  { locale: 'fr',      languageLabel: 'French (Canadian)',               tlCode: 'fr' },
  { locale: 'ru',      languageLabel: 'Russian',                         tlCode: 'ru' },
  { locale: 'tl',      languageLabel: 'Tagalog',                         tlCode: 'tl' },
  { locale: 'vi',      languageLabel: 'Vietnamese',                      tlCode: 'vi' },
  { locale: 'pa',      languageLabel: 'Punjabi (Gurmukhi script)',       tlCode: 'pa' },
  { locale: 'fa',      languageLabel: 'Persian/Farsi',                   tlCode: 'fa' },
  { locale: 'ar',      languageLabel: 'Arabic (Modern Standard)',        tlCode: 'ar' },
  { locale: 'hi',      languageLabel: 'Hindi (Devanagari script)',       tlCode: 'hi' },
];

/**
 * Translate one source text into one target language using the FREE
 * `translate.googleapis.com/translate_a/single` endpoint. No API key
 * required. Response is a nested array where `[0]` is a list of
 * `[translated, source, ...]` tuples — we join the translated segments
 * back into a single string to handle long-text segmentation.
 *
 * Returns `null` on HTTP error / parse failure so the caller can decide
 * to skip this (review × locale) pair without aborting the whole pass.
 */
async function translateOne(text: string, tlCode: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(tlCode)}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, {
      // The endpoint is unauthenticated but expects a User-Agent that
      // doesn't look like a script. Use a generic Mozilla string.
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReviewsCacheBot/1.0)' },
    });
    if (!res.ok) {
      console.warn(`[translate:${tlCode}] HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    const data = (await res.json()) as Array<Array<[string, string, ...unknown[]]>>;
    // data[0] = [['translated segment', 'source segment', null, null, ...], ...]
    const segments = data?.[0];
    if (!Array.isArray(segments) || segments.length === 0) return null;
    return segments.map((seg) => (Array.isArray(seg) ? seg[0] : '')).join('').trim() || null;
  } catch (err) {
    console.warn(`[translate:${tlCode}] fetch failed:`, err);
    return null;
  }
}

/**
 * Translate review texts into all configured locales using the FREE
 * `translate.googleapis.com/translate_a/single` endpoint. No API key,
 * no usage cost (per Reno Stars policy §5.2 added 2026-05-29).
 *
 * Per-review × per-locale write-once: if a review already has a translation
 * cached for a (text|locale) pair, we skip that pair. Each missing pair is
 * one unauthenticated HTTPS request to translate.googleapis.com.
 *
 * Backward compat: continues to populate `review.textZh` from
 * `review.translations.zh` so the deprecated read path (still referenced by
 * components/blocks during the transition) keeps working.
 *
 * Resilience: a single locale failure does NOT abort the pass — partial
 * success across 12/13 locales is valuable. We also throttle slightly
 * (50ms between requests) to avoid tripping the endpoint's burst limits.
 */
async function translateReviews(reviews: GoogleReview[]): Promise<void> {
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

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const target of TRANSLATION_TARGETS) {
    const needs = reviews.filter((r) => !r.translations?.[target.locale]);
    if (needs.length === 0) {
      console.log(`[translate:${target.locale}] all reviews already have cached translations.`);
      continue;
    }
    console.log(`[translate:${target.locale}] translating ${needs.length} review(s) to ${target.languageLabel}…`);

    let successCount = 0;
    for (const r of needs) {
      const translated = await translateOne(r.text, target.tlCode);
      if (translated) {
        r.translations = r.translations ?? {};
        r.translations[target.locale] = translated;
        // Mirror to deprecated textZh for the transitional period.
        if (target.locale === 'zh') r.textZh = translated;
        successCount++;
      }
      // Light throttle to avoid burst-limit on the public endpoint.
      await sleep(50);
    }
    console.log(`[translate:${target.locale}] ${successCount}/${needs.length} review(s) translated successfully.`);
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
