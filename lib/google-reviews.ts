import { createHash } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, S3_BUCKET } from './admin/s3';
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
  const text = r.text?.text ?? r.originalText?.text ?? '';
  const original = r.originalText?.text;
  return {
    authorName: r.authorAttribution?.displayName ?? '',
    authorUri: r.authorAttribution?.uri ?? '',
    authorPhotoUri: r.authorAttribution?.photoUri ?? '',
    rating: r.rating ?? 0,
    text,
    // Keep the verbatim original when `text` is an EN machine translation —
    // the reviews-hub dedupe needs it to match the project_reviews copy of
    // the same review (which stores the original-language text verbatim).
    ...(original && original !== text ? { originalText: original } : {}),
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

interface CacheRow {
  payload: GooglePlaceRating;
  /** When the row was last refreshed — drives the lazy self-refresh cadence. */
  updatedAt: Date;
}

/** Read the cached fallback row (payload + freshness) from the DB. Returns null on miss/error. */
async function readCacheRow(): Promise<CacheRow | null> {
  try {
    const rows = await db
      .select({ payload: googleReviewsCache.payload, updatedAt: googleReviewsCache.updatedAt })
      .from(googleReviewsCache)
      .where(eq(googleReviewsCache.cacheKey, CACHE_KEY))
      .limit(1);
    const row = rows[0];
    if (!row?.payload) return null;
    return { payload: row.payload as GooglePlaceRating, updatedAt: row.updatedAt };
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

// ---------------------------------------------------------------------------
// Translation + background self-refresh
//
// The cache row is the source of AI-generated per-locale translations. The
// hot read path (`getGoogleReviews`) only *merges* existing translations onto
// fresh API results — it never translates. Translation happens here, in
// `refreshReviewsCache`, which runs at most once per STALE_MS, triggered
// lazily by site traffic (no external cron). This replaced the local
// `com.renostars.reviews-cache` launchd job (removed 2026-07).
// ---------------------------------------------------------------------------

/** How stale the cache row may get before a visit triggers a background refresh. */
const STALE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Per-locale display labels + Google Translate target-language (`tl`) codes.
 * Keys match the site's locale set in i18n/config.ts (minus `en`, the source).
 * For Chinese variants the `tlCode` differs from the BCP-47 code
 * (zh → zh-CN, zh-Hant → zh-TW). If the locale set changes, update this map
 * AND the Locale union in i18n/config.ts in the same change.
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
 * `translate.googleapis.com/translate_a/single` endpoint (no API key).
 * Returns `null` on HTTP/parse failure so the caller can skip this
 * (review × locale) pair without aborting the whole pass.
 */
async function translateOne(text: string, tlCode: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(tlCode)}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReviewsCacheBot/1.0)' },
    });
    if (!res.ok) {
      console.warn(`[translate:${tlCode}] HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    const data = (await res.json()) as Array<Array<[string, string, ...unknown[]]>>;
    const segments = data?.[0];
    if (!Array.isArray(segments) || segments.length === 0) return null;
    return segments.map((seg) => (Array.isArray(seg) ? seg[0] : '')).join('').trim() || null;
  } catch (err) {
    console.warn(`[translate:${tlCode}] fetch failed:`, err);
    return null;
  }
}

/**
 * Translate review texts into all configured locales via the FREE Google
 * Translate endpoint. Per-review × per-locale write-once: reuses any
 * translation already cached in the DB row for an unchanged (text|locale)
 * pair, so a refresh only issues requests for genuinely new pairs. A single
 * locale failure does NOT abort the pass (partial success is valuable), and
 * requests are lightly throttled (50ms) to avoid the endpoint's burst limit.
 * Keeps the deprecated `textZh` in sync from `translations.zh`.
 */
async function translateReviews(reviews: GoogleReview[]): Promise<void> {
  // Reuse translations from the existing DB cache row for unchanged reviews.
  const existing = await readCacheRow();
  const existingTranslations = new Map<string, string>();
  for (const r of existing?.payload.reviews ?? []) {
    if (r.translations) {
      for (const [locale, translated] of Object.entries(r.translations)) {
        if (translated) existingTranslations.set(`${r.text}|${locale}`, translated);
      }
    }
    // Migration path: previous rows used only textZh — treat it as translations.zh.
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
    if (r.translations.zh) r.textZh = r.translations.zh;
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const target of TRANSLATION_TARGETS) {
    const needs = reviews.filter((r) => !r.translations?.[target.locale]);
    if (needs.length === 0) continue;

    let successCount = 0;
    for (const r of needs) {
      const translated = await translateOne(r.text, target.tlCode);
      if (translated) {
        r.translations = r.translations ?? {};
        r.translations[target.locale] = translated;
        if (target.locale === 'zh') r.textZh = translated;
        successCount++;
      }
      await sleep(50);
    }
    console.log(`[reviews:refresh] ${target.locale}: ${successCount}/${needs.length} translated.`);
  }
}

/**
 * Refresh the cache row: fetch live reviews, translate to all locales, upsert.
 * The single source of the translated payload. Called by the manual
 * `pnpm reviews:cache` script and lazily in the background by
 * `getGoogleReviews` when the row is stale. Throws on missing credentials.
 */
/**
 * Mirror Google review avatars to R2 and rewrite authorPhotoUri to the
 * first-party URL. lh3.googleusercontent.com avatar URLs rotate/expire —
 * that churn shows up as "broken external images" in SEO audits and would
 * eventually break for real visitors too. Keyed by a stable author hash so
 * repeat refreshes overwrite in place. Best-effort: failures keep the
 * original Google URL. Objects are written under BOTH key forms because the
 * public r2.dev domain serves literal object keys and existing site URLs use
 * the `reno-stars/`-prefixed form.
 */
async function mirrorAvatars(reviews: GoogleReview[]): Promise<void> {
  const client = getS3Client();
  const publicBase = process.env.S3_PUBLIC_URL;
  if (!client || !publicBase) return;
  await Promise.all(reviews.map(async (r) => {
    if (!r.authorPhotoUri || !r.authorPhotoUri.includes('googleusercontent.com')) return;
    try {
      const res = await fetch(r.authorPhotoUri, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) return;
      const buf = Buffer.from(await res.arrayBuffer());
      const hash = createHash('sha1').update(r.authorUri || r.authorName).digest('hex').slice(0, 12);
      const suffix = `uploads/reviews/avatar-${hash}.jpg`;
      const contentType = res.headers.get('content-type') ?? 'image/jpeg';
      await Promise.all([
        client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: suffix, Body: buf, ContentType: contentType })),
        client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: `reno-stars/${suffix}`, Body: buf, ContentType: contentType })),
      ]);
      r.authorPhotoUri = `${publicBase}/${suffix}`;
    } catch { /* keep the original URL on failure */ }
  }));
}

export async function refreshReviewsCache(): Promise<{
  reviewCount: number;
  rating: number;
  userRatingCount: number;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    throw new Error('Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID env vars.');
  }

  const [relevant, newest] = await Promise.all([
    fetchReviews(placeId, apiKey, 'MOST_RELEVANT'),
    fetchReviews(placeId, apiKey, 'NEWEST'),
  ]);

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
  await translateReviews(fiveStarReviews);
  await mirrorAvatars(fiveStarReviews);

  const result: GooglePlaceRating = {
    rating: relevant.rating ?? 0,
    userRatingCount: relevant.userRatingCount ?? 0,
    reviews: fiveStarReviews,
  };
  await updateCache(result);

  return {
    reviewCount: fiveStarReviews.length,
    rating: result.rating,
    userRatingCount: result.userRatingCount,
  };
}

// Single-instance in-process guard so concurrent visits don't stampede the
// refresh. On a multi-instance deploy this would need a DB-level claim
// (conditional UPDATE on updatedAt) instead — flagged, not assumed.
let refreshInFlight = false;

/**
 * Fire-and-forget: if the row is missing or older than STALE_MS, refresh it in
 * the background. The current request serves existing data immediately; the
 * fresh payload lands on a later request. Relies on the self-hosted
 * long-running Node process to finish the floating promise (a serverless
 * function would freeze after responding — which is why this is only viable
 * self-hosted).
 */
function maybeTriggerBackgroundRefresh(updatedAt: Date | null): void {
  if (refreshInFlight) return;
  const isStale = !updatedAt || Date.now() - updatedAt.getTime() > STALE_MS;
  if (!isStale) return;
  if (!process.env.GOOGLE_PLACES_API_KEY || !process.env.GOOGLE_PLACE_ID) return;

  refreshInFlight = true;
  void refreshReviewsCache()
    .then((s) => console.log(`[getGoogleReviews] Background refresh: cached ${s.reviewCount} reviews.`))
    .catch((err) => console.warn('[getGoogleReviews] Background refresh failed:', err))
    .finally(() => {
      refreshInFlight = false;
    });
}

/**
 * Fetch Google Reviews via the Places API (New, v1).
 * Makes two requests (relevance + newest) to get up to 10 reviews,
 * deduplicates, and filters to 5-star only.
 * Uses Next.js fetch caching with 24h revalidation.
 * Falls back to a Postgres-stored cache row when the API is unavailable;
 * the row is also the source of AI-generated per-locale translations, which
 * are refreshed lazily in the background on a ~7-day cadence (no cron).
 */

/**
 * Project a reviews payload to a SINGLE locale before passing it into a client
 * component. The cached payload carries every review's text in all 13 non-EN
 * locales (~47KB); a client component renders only the current locale, so the
 * other 12 are dead weight serialized into the RSC stream on every page view.
 * Keeps `translations` pruned to just `[locale]` so consumers' existing
 * `review.translations?.[locale] ?? review.text` logic is unchanged.
 */
export function projectReviewsToLocale(rating: GooglePlaceRating, locale: string): GooglePlaceRating {
  const stripLocales = (r: GoogleReview): GoogleReview => {
    const copy: GoogleReview = { ...r };
    delete copy.translations;
    delete copy.textZh;
    return copy;
  };
  if (locale === 'en') {
    return { ...rating, reviews: rating.reviews.map(stripLocales) };
  }
  return {
    ...rating,
    reviews: rating.reviews.map((r) => {
      const localized = r.translations?.[locale as keyof typeof r.translations];
      const rest = stripLocales(r);
      return localized ? { ...rest, translations: { [locale]: localized } as GoogleReview['translations'] } : rest;
    }),
  };
}

export async function getGoogleReviews(): Promise<GooglePlaceRating> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Cached row is the source of translations even when the API succeeds.
  const cacheRow = await readCacheRow();
  const cached = cacheRow?.payload ?? null;

  // Lazily keep translations fresh — background, never blocks this render.
  maybeTriggerBackgroundRefresh(cacheRow?.updatedAt ?? null);

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

    // Merge cached per-locale translations into fresh reviews. The cached
    // row is the source of AI-generated translations (populated by
    // `pnpm reviews:cache`); a live Google Places API hit returns only the
    // source text. Without this merge, the API path strips translations on
    // every request and the subsequent updateCache() would overwrite the
    // DB row with translations=undefined — a Stage 1 (PR #83) data-plumbing
    // regression. Carries the full translations map (every locale) plus
    // keeps textZh in sync for the transitional deprecated read path.
    type CachedTrans = { translations?: GoogleReview['translations']; textZh?: string; mirroredPhoto?: string };
    const cachedTranslationsByKey = new Map<string, CachedTrans>();
    for (const r of cached?.reviews ?? []) {
      const key = r.authorUri || r.authorName;
      if (!key) continue;
      const entry: CachedTrans = {};
      if (r.translations && Object.keys(r.translations).length > 0) entry.translations = r.translations;
      if (r.textZh) entry.textZh = r.textZh;
      // Mirrored avatar: the cache row holds first-party R2 avatar URLs
      // (mirrorAvatars) — prefer them over the live API's rotating
      // lh3.googleusercontent.com URLs so pages never hotlink Google's CDN.
      if (r.authorPhotoUri && !r.authorPhotoUri.includes('googleusercontent.com')) entry.mirroredPhoto = r.authorPhotoUri;
      if (entry.translations || entry.textZh || entry.mirroredPhoto) cachedTranslationsByKey.set(key, entry);
    }
    for (const r of fiveStarReviews) {
      const key = r.authorUri || r.authorName;
      const cachedEntry = key ? cachedTranslationsByKey.get(key) : undefined;
      if (!cachedEntry) continue;
      if (cachedEntry.translations) r.translations = cachedEntry.translations;
      // textZh backward-compat: prefer translations.zh, fall back to legacy textZh.
      if (cachedEntry.translations?.zh) r.textZh = cachedEntry.translations.zh;
      else if (cachedEntry.textZh) r.textZh = cachedEntry.textZh;
      if (cachedEntry.mirroredPhoto) r.authorPhotoUri = cachedEntry.mirroredPhoto;
    }

    const result: GooglePlaceRating = {
      rating: relevant.rating ?? 0,
      userRatingCount: relevant.userRatingCount ?? 0,
      reviews: fiveStarReviews,
    };

    // Write only when the payload actually changed. fetchReviews is Next-fetch
    // cached (24h), so `result` is byte-stable between refreshes — the old
    // unconditional updateCache() rewrote the same ~47KB row on EVERY page
    // render (thousands of pointless UPSERTs/day, WAL churn on the shared PG).
    if (!cached || JSON.stringify(cached) !== JSON.stringify(result)) {
      await updateCache(result);
    }
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
