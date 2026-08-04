import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { refreshBlogPost } from '@/lib/seo/blog-revalidate';

/**
 * External blog-publishing endpoint — the write counterpart to /api/revalidate.
 *
 * Why this exists: blog posts are DB rows, not files, and the only write paths
 * were the admin server actions (browser session) and a direct Postgres insert
 * from a script on this machine. The SEO agent runs in a remote container and
 * Postgres is not exposed through the Cloudflare Tunnel — deliberately — so the
 * agent could research, write and translate a post but had no way to publish
 * one. Opening a PR does not help either: a post is a row, so no code change
 * creates it. This endpoint is that missing path, scoped to exactly one table.
 *
 * Auth: Bearer token matched against `BLOG_API_SECRET`. Deliberately NOT
 * `REVALIDATE_SECRET` — least privilege, so a content token cannot purge the
 * CDN and a cache token cannot write content. 503 when unset (fail closed),
 * 401 on mismatch, compared timing-safely (a plain !== leaks the secret's
 * length and prefix through response latency on a stable-path origin).
 *
 * Posts are created UNPUBLISHED by default. `isPublished` must be passed
 * explicitly, so an automated writer cannot put content in front of customers
 * as a side effect of a successful call — publishing stays a separate decision.
 *
 * Idempotent on `slug`: a repeat call updates in place rather than creating a
 * duplicate. A retry after a network timeout is therefore safe, which matters
 * because the caller is an unattended agent that will retry.
 *
 * Body (JSON):
 *   required : slug, titleEn, titleZh, contentEn, contentZh
 *   optional : excerptEn/Zh, metaTitleEn/Zh, metaDescriptionEn/Zh,
 *              focusKeywordEn/Zh, seoKeywordsEn/Zh, readingTimeMinutes,
 *              featuredImageUrl, author, isPublished, localizations
 *
 * `localizations` carries the 12 locales that have no dedicated column
 * (camelCase keys: titleJa, contentJa, excerptJa, …) — the same shape the
 * admin actions write, so both producers stay interchangeable.
 */

// Mirrors the DB constraint and the /[locale]/blog/[slug] route segment.
// Rejecting path separators and traversal here keeps a hostile slug from
// reaching revalidatePath(), which takes a URL path.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG = 200;

const REQUIRED = ['slug', 'titleEn', 'titleZh', 'contentEn', 'contentZh'] as const;

const OPTIONAL_TEXT = [
  'excerptEn', 'excerptZh', 'metaTitleEn', 'metaTitleZh',
  'metaDescriptionEn', 'metaDescriptionZh', 'focusKeywordEn', 'focusKeywordZh',
  'seoKeywordsEn', 'seoKeywordsZh', 'featuredImageUrl', 'author',
] as const;

type Body = Record<string, unknown>;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.BLOG_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Blog API not configured.' }, { status: 503 });
  }
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(secret);
  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const missing = REQUIRED.filter(
    (k) => typeof body[k] !== 'string' || (body[k] as string).trim() === '',
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing or empty required field(s): ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  const slug = (body.slug as string).trim();
  if (slug.length > MAX_SLUG || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'Invalid slug — lowercase alphanumeric words separated by single hyphens.' },
      { status: 400 },
    );
  }

  // localizations must be a plain JSON object of string values. Anything else
  // would be written verbatim into a jsonb column the render path reads.
  const localizations: Record<string, string> = {};
  if (body.localizations !== undefined) {
    const l = body.localizations;
    if (typeof l !== 'object' || l === null || Array.isArray(l)) {
      return NextResponse.json({ error: '`localizations` must be an object.' }, { status: 400 });
    }
    for (const [k, v] of Object.entries(l as Record<string, unknown>)) {
      if (typeof v !== 'string') {
        return NextResponse.json(
          { error: `localizations.${k} must be a string.` },
          { status: 400 },
        );
      }
      localizations[k] = v;
    }
  }

  const readingTime =
    typeof body.readingTimeMinutes === 'number' && Number.isInteger(body.readingTimeMinutes)
      ? body.readingTimeMinutes
      : null;

  // Unpublished unless asked for explicitly. `isPublished` must be a real
  // boolean — a truthy string like "false" must not publish a post.
  const isPublished = body.isPublished === true;

  const values: Record<string, unknown> = {
    slug,
    titleEn: body.titleEn,
    titleZh: body.titleZh,
    contentEn: body.contentEn,
    contentZh: body.contentZh,
    isPublished,
    publishedAt: isPublished ? new Date() : null,
    readingTimeMinutes: readingTime,
    localizations,
    updatedAt: new Date(),
  };
  for (const k of OPTIONAL_TEXT) {
    if (typeof body[k] === 'string') values[k] = body[k];
  }

  let created: boolean;
  try {
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      await db.update(blogPosts).set(values).where(eq(blogPosts.slug, slug));
      created = false;
    } else {
      await db.insert(blogPosts).values(values as typeof blogPosts.$inferInsert);
      created = true;
    }
  } catch (err) {
    console.error('[api/blog] write failed', err);
    return NextResponse.json({ error: 'Database write failed.' }, { status: 500 });
  }

  // Surface it immediately. An unpublished post still needs the listing caches
  // busted, because flipping isPublished later goes through this same endpoint
  // and would otherwise serve a stale listing.
  try {
    refreshBlogPost(slug);
  } catch (err) {
    // The row is already committed; a revalidation failure must not turn a
    // successful write into an error the caller retries (which would be a
    // no-op update anyway, but the caller would log it as a failure).
    console.error('[api/blog] revalidation failed', err);
  }

  return NextResponse.json({
    ok: true,
    slug,
    created,
    isPublished,
    locales: Object.keys(localizations).length,
  });
}
