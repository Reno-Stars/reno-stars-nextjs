import { describe, it, expect } from 'vitest';
import { resolveBlogDates, MIN_MODIFIED_GAP_MS } from '@/lib/blog-dates';

// Background (2026-07-10 bathtub forensics): BlogPosting JSON-LD emitted a
// reset published_at and a bulk-script updated_at as dateModified. These tests
// pin the honest-dates contract: real published_at (fallback created_at), and
// dateModified ONLY for a genuine, row-specific, post-publication edit.

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

describe('resolveBlogDates — dateModified (genuine-edit gate)', () => {
  it('emits dateModified for an isolated post-publication edit (cluster of 1)', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      updated_at: LATER_EDIT,
      updated_at_cluster_count: 1,
    });
    expect(dateModified).toBe(LATER_EDIT.toISOString());
  });

  it('OMITS dateModified when other rows were written in the same window (single-stamp bulk touch)', () => {
    // 29 rows shared the exact stamp 2026-07-10 23:14:35.880614 (translation
    // backfill); 89 shared a 2026-06-27 stamp. Identical timestamps across
    // rows are a bulk-write fingerprint, never independent edits.
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      updated_at: new Date('2026-07-10T23:14:35.880Z'),
      updated_at_cluster_count: 30,
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified for sequential bulk loops (distinct stamps, same window)', () => {
    // 2026-07-13 review finding: bulk scripts that loop row-by-row give every
    // row a DISTINCT updated_at (~9 min apart in the 36-post cost-index
    // backfill), so exact-stamp matching alone leaked 41 posts. The window
    // cluster count is >= 2 for such rows and must suppress dateModified.
    const { dateModified } = resolveBlogDates({
      published_at: new Date('2023-07-31T12:00:00.000Z'),
      updated_at: new Date('2026-07-04T02:14:40.961Z'), // cost-index july-2023 row
      updated_at_cluster_count: 7, // neighbors within ±60 min of the loop
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified when the cluster size is unknown (unverifiable signal)', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      updated_at: LATER_EDIT,
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified when updated_at is within the publish window (< 24h gap)', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      updated_at: new Date(PUBLISHED.getTime() + MIN_MODIFIED_GAP_MS - 1),
      updated_at_cluster_count: 1,
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified when updated_at precedes published_at', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      updated_at: new Date('2026-03-01T00:00:00Z'),
      updated_at_cluster_count: 1,
    });
    expect(dateModified).toBeUndefined();
  });

  it('OMITS dateModified when there is no publication date at all', () => {
    const { dateModified } = resolveBlogDates({
      updated_at: LATER_EDIT,
      updated_at_cluster_count: 1,
    });
    expect(dateModified).toBeUndefined();
  });

  it('measures the edit gap against the created_at fallback when published_at is missing', () => {
    const { dateModified } = resolveBlogDates({
      created_at: CREATED,
      updated_at: LATER_EDIT,
      updated_at_cluster_count: 1,
    });
    expect(dateModified).toBe(LATER_EDIT.toISOString());
  });

  it('never fabricates dateModified from invalid updated_at', () => {
    const { dateModified } = resolveBlogDates({
      published_at: PUBLISHED,
      updated_at: 'garbage',
      updated_at_cluster_count: 1,
    });
    expect(dateModified).toBeUndefined();
  });
});
