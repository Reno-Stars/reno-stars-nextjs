import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';

/**
 * LIVE-DB integration coverage for the blog bulk-touch cluster count — the
 * wiring the 2026-07-13 review proved broken while every unit test passed:
 *
 * The first version computed the count with `eq(updatedAt, row.updatedAt)`.
 * Postgres stores updated_at at MICROSECOND precision, but the drizzle
 * `timestamp()` column (mode 'date') round-trips through a JS Date, which
 * only holds milliseconds — so the bound parameter matched ZERO rows, not
 * even the row itself. `updated_at_cluster_count` was 0 for every one of the
 * 237 published production rows, violating its documented ">= 1" invariant
 * and permanently disabling the dateModified gate. No unit test could catch
 * it because they all hand-fed the count.
 *
 * These tests run the REAL query functions against a REAL database. They are
 * gated on INTEGRATION_DATABASE_URL (NOT DATABASE_URL — tests/setup.ts force-
 * sets that to a dummy value for every test) and skip when it is unset, which
 * is the case in CI. Run them locally / anywhere a database is reachable:
 *
 *   INTEGRATION_DATABASE_URL=postgresql://... pnpm vitest run tests/unit/lib/db/blog-cluster-count.integration.test.ts
 *
 * Read-only: every statement is a SELECT.
 */
const INTEGRATION_URL = process.env.INTEGRATION_DATABASE_URL;

describe.skipIf(!INTEGRATION_URL)('blog updated_at cluster count (live DB)', () => {
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

  it('getBlogPostBySlugFromDb returns updated_at_cluster_count >= 1 (µs-precision row)', async () => {
    const { db, blogPosts } = await import('@/lib/db');
    const { getBlogPostBySlugFromDb } = await import('@/lib/db/queries/blog');

    // Prefer a row whose updated_at has sub-millisecond residue — the exact
    // shape the ms-truncated JS Date parameter could never match. (All 237
    // published prod rows had residue at the time of the review.)
    const candidates: { slug: string }[] = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(sql`${blogPosts.isPublished} = true
        AND ${blogPosts.updatedAt} <> date_trunc('milliseconds', ${blogPosts.updatedAt})`)
      .limit(1);
    const fallback: { slug: string }[] = candidates.length
      ? candidates
      : await db.select({ slug: blogPosts.slug }).from(blogPosts)
          .where(sql`${blogPosts.isPublished} = true`).limit(1);
    const slug = fallback[0]?.slug;
    expect(slug, 'precondition: at least one published blog row').toBeTruthy();

    const post = await getBlogPostBySlugFromDb(slug!, 'en');
    expect(post).not.toBeNull();
    // The invariant the shipped bug violated: the cluster includes the row
    // itself, so the count can never be 0 or undefined for a fetched row.
    expect(post!.updated_at_cluster_count).toBeTypeOf('number');
    expect(post!.updated_at_cluster_count!).toBeGreaterThanOrEqual(1);
  });

  it('getBlogPostSlugsFromDb (sitemap feed) carries cluster counts >= 1 on every row', async () => {
    const { getBlogPostSlugsFromDb } = await import('@/lib/db/queries/blog');
    const rows = await getBlogPostSlugsFromDb();
    expect(rows.length, 'precondition: published blog rows exist').toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.updatedAtClusterCount).toBeTypeOf('number');
      expect(row.updatedAtClusterCount).toBeGreaterThanOrEqual(1);
    }
  });

  it('REGRESSION PIN: a JS-Date-bound equality matches zero µs-precision rows', async () => {
    // Documents WHY the cluster count must be computed in SQL keyed by id.
    // If this ever starts matching, the DB column precision changed and the
    // constraint can be revisited.
    const { db, blogPosts } = await import('@/lib/db');
    const { eq, and, count } = await import('drizzle-orm');

    const rows: { slug: string; updatedAt: Date }[] = await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(sql`${blogPosts.isPublished} = true
        AND ${blogPosts.updatedAt} <> date_trunc('milliseconds', ${blogPosts.updatedAt})`)
      .limit(1);
    if (rows.length === 0) return; // no µs-residue row to demonstrate with

    const row = rows[0];
    const matched: { value: number }[] = await db
      .select({ value: count() })
      .from(blogPosts)
      .where(and(eq(blogPosts.updatedAt, row.updatedAt), eq(blogPosts.isPublished, true)));
    // The old code's own row doesn't even match itself: ms-truncated param
    // vs µs-precision storage.
    expect(matched[0]?.value).toBe(0);
  });
});
