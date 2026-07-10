/**
 * Pure merge/dedupe logic for the /reviews hub.
 *
 * The hub merges three review sources:
 *  1. project_reviews rows (verified, optionally linked to a case study),
 *  2. the live google_reviews_cache payload (recent Google reviews),
 *  3. legacy testimonials rows.
 *
 * The same client sometimes appears in more than one source (and a
 * project-spanning review is stored as one project_reviews row PER project),
 * so everything is deduped before render: same author + similar text = one
 * review, preferring the project_reviews copy because it links to a case
 * study. Kept as a plain module (no DB, no React) so the dedupe rules are
 * unit-testable.
 */

import type { GoogleReview } from '@/lib/types';

/** Where a hub review came from. Lower priority number wins dedupe ties. */
export type HubReviewKind = 'project' | 'google' | 'testimonial';

const KIND_PRIORITY: Record<HubReviewKind, number> = {
  project: 0,
  google: 1,
  testimonial: 2,
};

/** Normalized review shape shared by all three hub sources. */
export interface HubReview {
  kind: HubReviewKind;
  /** Author name exactly as written on the source review. */
  authorName: string;
  rating: number;
  /** Original (source-language) review text — used for dedupe comparison. */
  body: string;
  /** Language of `body`: 'en' | 'zh'. */
  bodyLang: string;
  /** ISO 'YYYY-MM-DD' (month precision) or null when unknown. */
  reviewDate: string | null;
  sourceUrl: string | null;
  /** Slug of the linked published case study, when one exists. */
  projectSlug: string | null;
  /** English city name (matches service_areas.name_en), when known. */
  city: string | null;
  /** Optional per-locale translations (google cache / testimonials only). */
  translations?: Partial<Record<string, string>>;
  /** Index into the source google reviews array (google kind only). */
  googleIndex?: number;
}

/** "Richmond, BC" → "Richmond" (testimonial `location` values carry ", BC"). */
export function stripProvince(location: string): string {
  return location.replace(/,\s*(BC|B\.C\.|British Columbia)\s*$/i, '').trim();
}

function normalizeAuthor(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Word-set Jaccard similarity in [0, 1]. Word-level (not char-level) so a
 * trimmed/expanded copy of the same review still scores high, while two
 * different reviews by the same person score low.
 */
export function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeWords(a));
  const wordsB = new Set(normalizeWords(b));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) if (wordsB.has(w)) intersection++;
  return intersection / (wordsA.size + wordsB.size - intersection);
}

const SIMILARITY_THRESHOLD = 0.6;

/**
 * Two reviews are duplicates when the author matches AND the texts are
 * similar (identical, one contains the other, or high word overlap).
 */
export function isDuplicateReview(
  a: Pick<HubReview, 'authorName' | 'body'>,
  b: Pick<HubReview, 'authorName' | 'body'>,
): boolean {
  if (normalizeAuthor(a.authorName) !== normalizeAuthor(b.authorName)) return false;
  const bodyA = a.body.trim().toLowerCase();
  const bodyB = b.body.trim().toLowerCase();
  if (bodyA === bodyB) return true;
  if (bodyA.length > 40 && bodyB.length > 40 && (bodyA.includes(bodyB) || bodyB.includes(bodyA))) {
    return true;
  }
  return textSimilarity(a.body, b.body) >= SIMILARITY_THRESHOLD;
}

/**
 * Dedupe merged hub reviews. Candidates are ranked project > google >
 * testimonial (the project copy links to a case study), then newest first;
 * the first survivor of each duplicate cluster wins.
 */
export function dedupeHubReviews(reviews: HubReview[]): HubReview[] {
  const ranked = [...reviews].sort((a, b) => {
    const byKind = KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
    if (byKind !== 0) return byKind;
    return (b.reviewDate ?? '').localeCompare(a.reviewDate ?? '');
  });
  const kept: HubReview[] = [];
  for (const candidate of ranked) {
    if (!kept.some((existing) => isDuplicateReview(existing, candidate))) {
      kept.push(candidate);
    }
  }
  return kept;
}

/** One rendered city section on the hub. `city` null = no known city. */
export interface HubCityGroup {
  city: string | null;
  reviews: HubReview[];
}

/**
 * Group non-google survivors by city, biggest group first (ties: city name),
 * with the unknown-city group (if any) always last. Reviews inside a group
 * stay newest-first.
 */
export function groupReviewsByCity(reviews: HubReview[]): HubCityGroup[] {
  const byCity = new Map<string | null, HubReview[]>();
  for (const review of reviews) {
    const key = review.city ?? null;
    const bucket = byCity.get(key) ?? [];
    bucket.push(review);
    byCity.set(key, bucket);
  }
  const groups = Array.from(byCity.entries()).map(([city, groupReviews]) => ({
    city,
    reviews: [...groupReviews].sort((a, b) => (b.reviewDate ?? '').localeCompare(a.reviewDate ?? '')),
  }));
  return groups.sort((a, b) => {
    if (a.city === null) return 1;
    if (b.city === null) return -1;
    if (b.reviews.length !== a.reviews.length) return b.reviews.length - a.reviews.length;
    return a.city.localeCompare(b.city);
  });
}

/** project_reviews row (joined with its project) as fetched for the hub. */
export interface HubProjectReviewRow {
  authorName: string;
  rating: number;
  body: string;
  bodyLang: string;
  reviewDate: string;
  sourceUrl: string | null;
  /** Slug of the linked PUBLISHED project (null when unlinked/unpublished). */
  projectSlug: string | null;
  /** projects.location_city of the linked project. */
  city: string | null;
}

/** testimonials row as fetched for the hub. */
export interface HubTestimonialRow {
  name: string;
  rating: number;
  textEn: string;
  location: string | null;
  /** Per-locale translations assembled from text_zh + localizations jsonb. */
  translations: Partial<Record<string, string>>;
}

export interface ReviewsHub {
  /** Indices into the input google reviews array that survived dedupe. */
  googleIndices: number[];
  /** Non-google survivors grouped by city (project + testimonial reviews). */
  cityGroups: HubCityGroup[];
  /** Total unique reviews on the hub (google survivors + city groups). */
  uniqueCount: number;
}

/** Merge + dedupe + group the three hub sources. Pure — no DB access. */
export function buildReviewsHub(input: {
  projectReviews: HubProjectReviewRow[];
  googleReviews: GoogleReview[];
  testimonials: HubTestimonialRow[];
}): ReviewsHub {
  const merged: HubReview[] = [
    ...input.projectReviews.map((row): HubReview => ({
      kind: 'project',
      authorName: row.authorName,
      rating: row.rating,
      body: row.body,
      bodyLang: row.bodyLang,
      reviewDate: row.reviewDate,
      sourceUrl: row.sourceUrl,
      projectSlug: row.projectSlug,
      city: row.city,
    })),
    ...input.googleReviews.map((review, index): HubReview => ({
      kind: 'google',
      authorName: review.authorName,
      rating: review.rating,
      body: review.text,
      bodyLang: review.languageCode || 'en',
      reviewDate: review.publishTime ? review.publishTime.slice(0, 10) : null,
      sourceUrl: review.authorUri || null,
      projectSlug: null,
      city: null,
      googleIndex: index,
    })),
    ...input.testimonials.map((row): HubReview => ({
      kind: 'testimonial',
      authorName: row.name,
      rating: row.rating,
      body: row.textEn,
      bodyLang: 'en',
      reviewDate: null,
      sourceUrl: null,
      projectSlug: null,
      city: row.location ? stripProvince(row.location) : null,
      translations: row.translations,
    })),
  ];

  const survivors = dedupeHubReviews(merged);
  const googleIndices = survivors
    .filter((r) => r.kind === 'google' && r.googleIndex !== undefined)
    .map((r) => r.googleIndex as number)
    .sort((a, b) => a - b);
  const cityGroups = groupReviewsByCity(survivors.filter((r) => r.kind !== 'google'));

  return { googleIndices, cityGroups, uniqueCount: survivors.length };
}
