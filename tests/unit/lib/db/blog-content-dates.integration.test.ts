import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { resolveBlogDates } from '@/lib/blog-dates';

/**
 * LIVE-DB integration coverage for the blog `content_updated_at` write-side
 * date signal (2026-07-13 review findings #8/#30/#23/#28) that replaced the
 * ±60-min bulk-touch cluster heuristic.
 *
 * These tests run the REAL query functions against a REAL database. They are
 * gated on INTEGRATION_DATABASE_URL (NOT DATABASE_URL — tests/setup.ts force-
 * sets that to a dummy value for every test) and skip when it is unset, which
 * is the case in CI. Run them locally / anywhere a database is reachable:
 *
 *   INTEGRATION_DATABASE_URL=postgresql://... pnpm vitest run tests/unit/lib/db/blog-content-dates.integration.test.ts
 *
 * Read-only: every statement is a SELECT.
 */
const INTEGRATION_URL = process.env.INTEGRATION_DATABASE_URL;

describe.skipIf(!INTEGRATION_URL)('blog content_updated_at date signal (live DB)', () => {
  beforeAll(() => {
    // lib/db initializes its pool lazily on first query, so overriding here
    // (after setup.ts planted the dummy) points this file's queries at the
    // real database. Vitest isolates test files per worker — no bleed into
    // other files.
    process.env.DATABASE_URL = INTEGRATION_URL;
  });

  afterAll(async () => {
    // drizzle/node-postgres exposes the pg Pool as $client; end it so the
    // worker doesn't hold the event loop open.
    const { db } = await import('@/lib/db');
    const client = (db as { $client?: { end?: () => Promise<void> } }).$client;
    await client?.end?.().catch(() => undefined);
  });

  it('getBlogPostBySlugFromDb surfaces content_updated_at (present or undefined, never crashes)', async () => {
    const { db, blogPosts } = await import('@/lib/db');
    const { getBlogPostBySlugFromDb } = await import('@/lib/db/queries/blog');

    const first: { slug: string }[] = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(sql`${blogPosts.isPublished} = true`)
      .limit(1);
    const slug = first[0]?.slug;
    expect(slug, 'precondition: at least one published blog row').toBeTruthy();

    const post = await getBlogPostBySlugFromDb(slug!, 'en');
    expect(post).not.toBeNull();
    // content_updated_at is a nullable column: a Date when the post was edited
    // through the admin content-save path, otherwise undefined. Both are valid.
    const cua = post!.content_updated_at;
    expect(cua === undefined || cua instanceof Date || typeof cua === 'string').toBe(true);
  });

  it('getBlogPostSlugsFromDb (sitemap feed) carries a contentUpdatedAt field on every row', async () => {
    const { getBlogPostSlugsFromDb } = await import('@/lib/db/queries/blog');
    const rows = await getBlogPostSlugsFromDb();
    expect(rows.length, 'precondition: published blog rows exist').toBeGreaterThan(0);
    for (const row of rows) {
      // The property must exist and be either a Date or null — no correlated
      // count(*) anywhere in the query anymore (finding #28).
      expect('contentUpdatedAt' in row).toBe(true);
      expect(row.contentUpdatedAt === null || row.contentUpdatedAt instanceof Date).toBe(true);
    }
  });

  it('the page and the sitemap resolve the SAME dates for every published slug', async () => {
    // Both surfaces feed resolveBlogDates the same columns, so a genuine edit
    // and a bulk touch can never produce contradictory signals (page JSON-LD
    // dateModified vs sitemap <lastmod>). Verify parity directly.
    const { getBlogPostSlugsFromDb, getBlogPostBySlugFromDb } = await import('@/lib/db/queries/blog');
    const rows = await getBlogPostSlugsFromDb();
    // Sample up to 25 slugs to keep the round-trips bounded.
    for (const row of rows.slice(0, 25)) {
      const sitemapDates = resolveBlogDates({
        published_at: row.publishedAt,
        created_at: row.createdAt,
        content_updated_at: row.contentUpdatedAt,
      });
      const post = await getBlogPostBySlugFromDb(row.slug, 'en');
      if (!post) continue; // unpublished mid-flight
      const pageDates = resolveBlogDates(post);
      expect(pageDates.dateModified).toBe(sitemapDates.dateModified);
      expect(pageDates.datePublished).toBe(sitemapDates.datePublished);
    }
  });
});
