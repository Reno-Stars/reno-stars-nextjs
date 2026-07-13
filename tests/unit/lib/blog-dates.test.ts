import { describe, it, expect } from 'vitest';
import { resolveBlogDates, MIN_MODIFIED_GAP_MS } from '@/lib/blog-dates';

// Background (2026-07-10 bathtub forensics): BlogPosting JSON-LD emitted a
// reset published_at and a bulk-script updated_at as dateModified. These tests
// pin the honest-dates contract: real published_at (fallback created_at), and
// dateModified ONLY from content_updated_at — the write-side signal stamped
// solely by the admin content-save path — when it is a meaningful post-
// publication edit. (2026-07-13 review findings #8/#30/#23/#28 retired the
// read-side ±60-min bulk-touch cluster heuristic that this replaced.)

const PUBLISHED = new Date('2026-04-17T18:31:46.466Z');
const CREATED = new Date('2026-04-01T08:00:00.000Z');
const LATER_EDIT = new Date('2026-05-20T10:00:00.000Z');

describe('resolveBlogDates — datePublished', () => {
  it('uses published_at when present', () => {
    const { datePublished } = resolveBlogDates({ published_at: PUBLISHED });
    expect(datePublished).toBe(PUBLISHED.toISOString());
  });

  it('falls back to created_at when published_at is missing', () => {
    const { datePublished } = resolveBlogDates({ created_at: CREATED });
    expect(datePublished).toBe(CREATED.toISOString());
  });

  it('falls back to created_at when published_at is invalid', () => {
    const { datePublished } = resolveBlogDates({
      published_at: 'not-a-date',
      created_at: CREATED,
    });
    expect(datePublished).toBe(CREATED.toISOString());
  });

  it('is undefined when neither date exists', () => {
    expect(resolveBlogDates({})).toEqual({});
    expect(resolveBlogDates({ published_at: null, created_at: null })).toEqual({});
  });

  it('accepts string dates (unstable_cache JSON-serializes Date columns)', () => {
    const { datePublished } = resolveBlogDates({ published_at: PUBLISHED.toISOString() });
    expect(datePublished).toBe(PUBLISHED.toISOString());
  });
});

describe('resolveBlogDates — dateModified (write-side content-edit signal)', () => {
  it('emits dateModified from a genuine post-publication content edit', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      content_updated_at: LATER_EDIT,
    });
    expect(dateModified).toBe(LATER_EDIT.toISOString());
  });

  it('OMITS dateModified when content_updated_at is NULL (legacy / never edited)', () => {
    // Every row predating the column, and every post never edited since
    // publication, has content_updated_at = NULL → honest omission. This is
    // the state of all 250 backfilled prod rows.
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      content_updated_at: null,
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified when content_updated_at is absent entirely', () => {
    const { dateModified } = resolveBlogDates({ published_at: PUBLISHED });
    expect(dateModified).toBeUndefined();
  });

  it('IGNORES a bulk-poisoned updated_at — only content_updated_at is trusted', () => {
    // updated_at is stamped wholesale by translation backfills / the SEO cron;
    // it is not part of BlogDateSource anymore and must never drive
    // dateModified. Passing it as an unknown extra field changes nothing.
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      // @ts-expect-error updated_at is no longer a recognized source field
      updated_at: new Date('2026-07-10T23:14:35.880Z'),
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified when the edit is within the publish window (< 24h gap)', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      content_updated_at: new Date(PUBLISHED.getTime() + MIN_MODIFIED_GAP_MS - 1),
    });
    expect(dateModified).toBeUndefined();
  });

  it('emits dateModified exactly at the 24h boundary + 1ms', () => {
    const edit = new Date(PUBLISHED.getTime() + MIN_MODIFIED_GAP_MS + 1);
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      content_updated_at: edit,
    });
    expect(dateModified).toBe(edit.toISOString());
  });

  it('OMITS dateModified when content_updated_at precedes published_at', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      content_updated_at: new Date('2026-03-01T00:00:00Z'),
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified when there is no publication date at all', () => {
    const { dateModified } = resolveBlogDates({
      content_updated_at: LATER_EDIT,
    });
    expect(dateModified).toBeUndefined();
  });

  it('measures the edit gap against the created_at fallback when published_at is missing', () => {
    const { dateModified } = resolveBlogDates({
      created_at: CREATED,
      content_updated_at: LATER_EDIT,
    });
    expect(dateModified).toBe(LATER_EDIT.toISOString());
  });

  it('accepts string content_updated_at (unstable_cache JSON serialization)', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED.toISOString(),
      content_updated_at: LATER_EDIT.toISOString(),
    });
    expect(dateModified).toBe(LATER_EDIT.toISOString());
  });

  it('never fabricates dateModified from an invalid content_updated_at', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      content_updated_at: 'garbage',
    });
    expect(dateModified).toBeUndefined();
  });
});
