import { cache } from 'react';
import { and, asc, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery, uncachedQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryPerSlugLocale } from '../cache';
import {
  blogPosts as blogPostsTable,
  projects as projectsTable,
  projectExternalProducts as projectExternalProductsTable,
} from '../schema';
import { DbExternalProductRow } from '../project-mappers';
import { getAssetUrl, getOptionalAssetUrl } from '../../storage';
import { buildLocalized, buildLocalizedOptional } from '../../utils';
import { BULK_TOUCH_CLUSTER_WINDOW_MINUTES } from '../../blog-dates';
import type { BlogPost, BlogRelatedProject } from '../../types';

/**
 * SQL interval fragment for the bulk-touch cluster window (see
 * lib/blog-dates.ts). `sql.raw` is safe here: the interpolated value is a
 * compile-time numeric constant, never user input.
 */
const BULK_CLUSTER_WINDOW_SQL = sql.raw(`interval '${BULK_TOUCH_CLUSTER_WINDOW_MINUTES} minutes'`);

/** Default number of blog posts per page */
export const BLOG_POSTS_PER_PAGE = 10;

/** Result of paginated blog posts query */
export interface PaginatedBlogPosts {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Strip content* keys from the localizations jsonb at the SQL layer for
 * listing queries. The columns content_en/content_zh aren't selected, but
 * the localizations jsonb embeds content for the other 12 locales — about
 * 6.5 MB of body text across 116 posts that listings never render.
 *
 * Verified 2026-05-04: full row payload 7.3 MB → 776 KB after strip
 * (9.4× reduction). Quota-eating culprit on Neon when layout + homepage
 * each call this on every Vercel ISR refresh / Lambda cold start.
 */
export const stripBlogContentLocalizations = sql`
  COALESCE(${blogPostsTable.localizations}, '{}'::jsonb)
    - 'contentZhHant' - 'contentJa' - 'contentKo' - 'contentEs'
    - 'contentPa'    - 'contentTl' - 'contentFa' - 'contentVi'
    - 'contentRu'    - 'contentAr' - 'contentHi' - 'contentFr'
`;

/** Fetch all published blog posts ordered by publishedAt desc. */
export const getBlogPostsFromDb = cachedQuery(async (): Promise<BlogPost[]> => {
  return safeQuery('getBlogPostsFromDb', async () => {
    const rows = await db
      .select({
        slug: blogPostsTable.slug,
        titleEn: blogPostsTable.titleEn,
        titleZh: blogPostsTable.titleZh,
        excerptEn: blogPostsTable.excerptEn,
        excerptZh: blogPostsTable.excerptZh,
        featuredImageUrl: blogPostsTable.featuredImageUrl,
        publishedAt: blogPostsTable.publishedAt,
        updatedAt: blogPostsTable.updatedAt,
        localizations: stripBlogContentLocalizations.as('localizations'),
      })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true))
      .orderBy(desc(blogPostsTable.publishedAt));

    return rows.map((row: typeof rows[number]) => ({
      slug: row.slug,
      title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations as Record<string, unknown>),
      excerpt: buildLocalizedOptional('excerpt', row.excerptEn, row.excerptZh, row.localizations as Record<string, unknown>),
      content: undefined,
      featured_image: getOptionalAssetUrl(row.featuredImageUrl),
      published_at: row.publishedAt ?? undefined,
      updated_at: row.updatedAt ?? undefined,
    }));
  }, []);
}, ['getBlogPostsFromDb', 'v1'], { revalidate: 86400, tags: ['blog:listing'] });

/** Fetch paginated published blog posts ordered by publishedAt desc. */
export const getBlogPostsPaginatedFromDb = cache(
  async (page: number = 1, perPage: number = BLOG_POSTS_PER_PAGE): Promise<PaginatedBlogPosts> => {
    return safeQuery('getBlogPostsPaginatedFromDb', async () => {
      // Get total count using SQL COUNT for efficiency
      const countResult = await db
        .select({ value: count() })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.isPublished, true));

      const totalCount = countResult[0]?.value ?? 0;
      const totalPages = Math.ceil(totalCount / perPage);
      const currentPage = Math.max(1, Math.min(page, totalPages || 1));
      const offset = (currentPage - 1) * perPage;

      // Slim projection — see getBlogPostsFromDb comment. Strips content*
      // keys from localizations jsonb at SQL layer (the 12 non-en/zh body
      // texts that listings never render).
      const rows = await db
        .select({
          slug: blogPostsTable.slug,
          titleEn: blogPostsTable.titleEn,
          titleZh: blogPostsTable.titleZh,
          excerptEn: blogPostsTable.excerptEn,
          excerptZh: blogPostsTable.excerptZh,
          featuredImageUrl: blogPostsTable.featuredImageUrl,
          publishedAt: blogPostsTable.publishedAt,
          updatedAt: blogPostsTable.updatedAt,
          localizations: stripBlogContentLocalizations.as('localizations'),
        })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.isPublished, true))
        .orderBy(desc(blogPostsTable.publishedAt))
        .limit(perPage)
        .offset(offset);

      const posts = rows.map((row: typeof rows[number]) => ({
        slug: row.slug,
        title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations as Record<string, unknown>),
        excerpt: buildLocalizedOptional('excerpt', row.excerptEn, row.excerptZh, row.localizations as Record<string, unknown>),
        content: undefined,
        featured_image: getOptionalAssetUrl(row.featuredImageUrl),
        published_at: row.publishedAt ?? undefined,
        updated_at: row.updatedAt ?? undefined,
      }));

      return { posts, totalCount, totalPages, currentPage };
    }, { posts: [], totalCount: 0, totalPages: 0, currentPage: 1 });
  }
);

/** Fetch a single published blog post by slug, with related project if linked. */
export const getBlogPostBySlugFromDb = cachedQueryPerSlugLocale(
  async (slug: string): Promise<BlogPost | null> => {
    return safeQuery('getBlogPostBySlugFromDb', async () => {
    // Defensive SELECT — see 2026-05-26 PR #62 outage: when a Drizzle schema
    // adds a column that the DB hasn't received yet (db:push didn't run), the
    // default `select()` includes the new column in the column list and
    // Postgres errors with `42703 column does not exist`, killing every
    // `/en/blog/[slug]` route. The deploy-hook in vercel.json now runs
    // `pnpm db:push` before `next build` so this scenario shouldn't recur —
    // but this guard is belt-and-suspenders: on `42703`, retry with an
    // explicit column list excluding `metaOverrides` and synthesize the
    // missing field as undefined.
    let rows: typeof blogPostsTable.$inferSelect[];
    try {
      rows = await db
        .select()
        .from(blogPostsTable)
        .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.isPublished, true)))
        .limit(1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isMissingColumn = msg.includes('42703') || msg.toLowerCase().includes('column') && msg.toLowerCase().includes('does not exist');
      if (!isMissingColumn) throw err;
      console.warn(`[getBlogPostBySlugFromDb] schema/DB drift detected (42703); retrying with explicit columns. msg=${msg.slice(0, 200)}`);
      const fallbackRows = await db
        .select({
          id: blogPostsTable.id,
          slug: blogPostsTable.slug,
          titleEn: blogPostsTable.titleEn,
          titleZh: blogPostsTable.titleZh,
          excerptEn: blogPostsTable.excerptEn,
          excerptZh: blogPostsTable.excerptZh,
          contentEn: blogPostsTable.contentEn,
          contentZh: blogPostsTable.contentZh,
          featuredImageUrl: blogPostsTable.featuredImageUrl,
          author: blogPostsTable.author,
          metaTitleEn: blogPostsTable.metaTitleEn,
          metaTitleZh: blogPostsTable.metaTitleZh,
          metaDescriptionEn: blogPostsTable.metaDescriptionEn,
          metaDescriptionZh: blogPostsTable.metaDescriptionZh,
          focusKeywordEn: blogPostsTable.focusKeywordEn,
          focusKeywordZh: blogPostsTable.focusKeywordZh,
          seoKeywordsEn: blogPostsTable.seoKeywordsEn,
          seoKeywordsZh: blogPostsTable.seoKeywordsZh,
          readingTimeMinutes: blogPostsTable.readingTimeMinutes,
          isPublished: blogPostsTable.isPublished,
          publishedAt: blogPostsTable.publishedAt,
          projectId: blogPostsTable.projectId,
          createdAt: blogPostsTable.createdAt,
          updatedAt: blogPostsTable.updatedAt,
          localizations: blogPostsTable.localizations,
        })
        .from(blogPostsTable)
        .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.isPublished, true)))
        .limit(1);
      // Synthesize missing metaOverrides as empty so the mapper below can run
      // unchanged. The cast is required because Drizzle infers the explicit
      // select shape without metaOverrides; pages reading post.meta_overrides
      // will simply see undefined post-mapping.
      rows = fallbackRows.map((r: Record<string, unknown>) => ({ ...r, metaOverrides: {} } as typeof blogPostsTable.$inferSelect));
    }

    const row = rows[0];
    if (!row) return null;

    // How many blog rows (published or not — bulk scripts touch both) were
    // written within ±BULK_TOUCH_CLUSTER_WINDOW_MINUTES of this row's
    // updated_at, including itself. Bulk maintenance scripts (translation
    // backfills, link rewrites, content backfills) either stamp every row
    // with one `now()` or loop row-by-row minutes apart — both cluster in
    // time, so any neighbor inside the window is a bulk-write fingerprint and
    // lib/blog-dates.ts suppresses dateModified instead of emitting a fake
    // edit date. Cheap (~250 rows, runs only on per-slug cache miss).
    //
    // PRECISION: the comparison is entirely in SQL, keyed by row id — never
    // `eq(updatedAt, row.updatedAt)`. Postgres stores microseconds; a JS Date
    // param is ms-truncated and matches ZERO rows (not even the row itself),
    // which silently disabled this gate in the first version of the fix.
    let updatedAtClusterCount: number | undefined;
    if (row.updatedAt) {
      const cluster = await db
        .select({ value: count() })
        .from(blogPostsTable)
        .where(sql`${blogPostsTable.updatedAt} BETWEEN
          (SELECT b.updated_at FROM blog_posts b WHERE b.id = ${row.id}) - ${BULK_CLUSTER_WINDOW_SQL}
          AND (SELECT b.updated_at FROM blog_posts b WHERE b.id = ${row.id}) + ${BULK_CLUSTER_WINDOW_SQL}`);
      updatedAtClusterCount = cluster[0]?.value ?? undefined;
    }

    // Fetch related project and external products in parallel if projectId is set
    let relatedProject: BlogRelatedProject | undefined;
    if (row.projectId) {
      const [projectRows, externalProducts] = await Promise.all([
        db.select().from(projectsTable).where(eq(projectsTable.id, row.projectId)).limit(1),
        db.select().from(projectExternalProductsTable)
          .where(eq(projectExternalProductsTable.projectId, row.projectId))
          .orderBy(asc(projectExternalProductsTable.displayOrder)),
      ]);

      const project = projectRows[0];
      if (project) {
        relatedProject = {
          slug: project.slug,
          title: { en: project.titleEn, zh: project.titleZh },
          hero_image: project.heroImageUrl ? getAssetUrl(project.heroImageUrl) : undefined,
          external_products:
            externalProducts.length > 0
              ? externalProducts.map((ep: DbExternalProductRow) => ({
                  url: ep.url,
                  image_url: ep.imageUrl ? getAssetUrl(ep.imageUrl) : undefined,
                  label: { en: ep.labelEn, zh: ep.labelZh },
                }))
              : undefined,
        };
      }
    }

    return {
      slug: row.slug,
      title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations),
      excerpt: buildLocalizedOptional('excerpt', row.excerptEn, row.excerptZh, row.localizations),
      content: buildLocalizedOptional('content', row.contentEn, row.contentZh, row.localizations),
      featured_image: getOptionalAssetUrl(row.featuredImageUrl),
      featured_image_alt: (() => {
        const locs = row.localizations as Record<string, unknown> | null;
        const en = typeof locs?.['featuredImageAltEn'] === 'string' ? locs['featuredImageAltEn'] : '';
        if (!en) return undefined;
        // zh alt also lives in the JSONB (no dedicated column). Fall back to EN —
        // pickLocale treats '' as present, so an empty zh would block the en
        // fallback chain for both zh and zh-Hant.
        const zhRaw = locs?.['featuredImageAltZh'];
        const zh = typeof zhRaw === 'string' && zhRaw ? zhRaw : en;
        return buildLocalized('featuredImageAlt', en, zh, locs);
      })(),
      author: row.author ?? undefined,
      published_at: row.publishedAt ?? undefined,
      created_at: row.createdAt ?? undefined,
      updated_at: row.updatedAt ?? undefined,
      updated_at_cluster_count: updatedAtClusterCount,
      meta_title: (row.metaTitleEn || row.metaTitleZh)
        ? buildLocalized('metaTitle', row.metaTitleEn ?? '', row.metaTitleZh ?? '', row.localizations)
        : undefined,
      meta_description: (row.metaDescriptionEn || row.metaDescriptionZh)
        ? buildLocalized('metaDescription', row.metaDescriptionEn ?? '', row.metaDescriptionZh ?? '', row.localizations)
        : undefined,
      meta_overrides: row.metaOverrides && Object.keys(row.metaOverrides).length > 0
        ? row.metaOverrides
        : undefined,
      focus_keyword: (row.focusKeywordEn || row.focusKeywordZh)
        ? buildLocalized('focusKeyword', row.focusKeywordEn ?? '', row.focusKeywordZh ?? '', row.localizations)
        : undefined,
      seo_keywords: (row.seoKeywordsEn || row.seoKeywordsZh)
        ? buildLocalized('seoKeywords', row.seoKeywordsEn ?? '', row.seoKeywordsZh ?? '', row.localizations)
        : undefined,
      related_project: relatedProject,
    };
    }, null);
  },
  'getBlogPostBySlugFromDb',
  // Narrow tag only — admin fires updateTag('blog:${slug}') on edits.
  { revalidate: 86400, tagPrefix: 'blog' }
);

/** Fetch all published blog post slugs with dates (for sitemap). Uncached — see getProjectSlugsFromDb. */
export async function getBlogPostSlugsFromDb(): Promise<{ slug: string; updatedAt: Date | null; publishedAt: Date | null; createdAt: Date | null; updatedAtClusterCount: number; featuredImageUrl: string | null; nativeContentKeys: string[] }[]> {
  return uncachedQuery('getBlogPostSlugsFromDb', async () => {
    const rows = await db
      .select({
        slug: blogPostsTable.slug,
        updatedAt: blogPostsTable.updatedAt,
        publishedAt: blogPostsTable.publishedAt,
        createdAt: blogPostsTable.createdAt,
        // Bulk-touch cluster size for this row (see getBlogPostBySlugFromDb).
        // Lets the sitemap run the same resolveBlogDates gate as the page's
        // JSON-LD, so <lastmod> and dateModified never contradict each other
        // (pre-2026-07-13 the sitemap advertised raw bulk-stamp updated_at
        // while the page honestly omitted dateModified). Column-to-column
        // comparison — full microsecond precision, no JS round-trip.
        // The outer column MUST be written as a raw qualified name: in a
        // SELECT-list fragment drizzle renders ${blogPostsTable.updatedAt}
        // UNqualified ("updated_at"), which the inner scope resolves to
        // b.updated_at — turning the BETWEEN into a tautology that counts
        // every row in the table (empirically: 250 for all rows).
        updatedAtClusterCount: sql<number>`(
          SELECT count(*)::int FROM blog_posts b
          WHERE b.updated_at BETWEEN blog_posts.updated_at - ${BULK_CLUSTER_WINDOW_SQL}
            AND blog_posts.updated_at + ${BULK_CLUSTER_WINDOW_SQL}
        )`,
        featuredImageUrl: blogPostsTable.featuredImageUrl,
        // `content<Suffix>` keys (e.g. contentJa) whose value is a real native
        // translation — non-empty and different from the EN body. Mirrors the
        // hasNativeBody noindex condition in app/[locale]/blog/[slug]/page.tsx
        // so the sitemap only submits locale URLs that are actually indexable.
        nativeContentKeys: sql<string[]>`array(
          select e.key from jsonb_each_text(${blogPostsTable.localizations}) as e(key, value)
          where e.key like 'content%' and e.value <> '' and e.value is distinct from ${blogPostsTable.contentEn}
        )`,
      })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true));
    return rows;
  }, []);
}

/** Fetch all blog posts (admin — includes unpublished). */
export async function getAllBlogPostsAdmin() {
  return db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
}
