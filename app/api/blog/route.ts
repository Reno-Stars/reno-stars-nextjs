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

// The exact contract the render path reads: <field><LocaleSuffix>. EN and ZH
// live in dedicated columns; these are the other 12 locales from i18n/config.
// 6 fields x 12 locales = 72 keys on a complete post.
const LOC_FIELDS = [
  'title', 'content', 'excerpt', 'focusKeyword', 'metaTitle', 'metaDescription',
] as const;
const LOC_SUFFIXES = [
  'Ar', 'Es', 'Fa', 'Fr', 'Hi', 'Ja', 'Ko', 'Pa', 'Ru', 'Tl', 'Vi', 'ZhHant',
] as const;
const LOCALIZATION_KEY_RE = new RegExp(
  `^(${LOC_FIELDS.join('|')})(${LOC_SUFFIXES.join('|')})$`,
);

/**
 * Returns a human-readable problem with a content field, or null if it is
 * acceptable HTML. Deliberately permissive about WHICH tags — the point is to
 * catch a whole document authored in Markdown, not to police markup style.
 */
function htmlProblem(value: unknown, field: string): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const v = value.trim();
  // A leading ATX heading, or a `##` at line start, means the writer produced
  // Markdown. Checked first so the error names the real problem.
  if (/^#{1,6}\s/.test(v) || /\n#{1,6}\s/.test(v)) {
    return `${field} looks like Markdown (found a "#" heading). Send HTML — e.g. <h2>Heading</h2> and <p>text</p>. Markdown is not converted; it renders literally on the page.`;
  }
  if (/(^|\n)\s*[-*]\s+\S/.test(v) && !/<(ul|ol|li)\b/i.test(v)) {
    return `${field} looks like Markdown (found a "-" or "*" list with no <ul>/<li>). Send HTML lists.`;
  }
  if (!/<(p|h[1-6]|ul|ol|div|section|article|blockquote|table)\b/i.test(v)) {
    return `${field} contains no HTML block element. Send HTML — at minimum wrap paragraphs in <p>.`;
  }
  return null;
}

/**
 * Minimum substance. The format gate checks SHAPE — `<p>Test</p>` is perfectly
 * valid HTML — so on 2026-08-08 three placeholder posts ("Test Post",
 * `<p>Test</p>`) were published straight to the live blog and picked up by the
 * sitemap in 24 locale variants before anyone noticed. Publish-by-default means
 * an experimental payload IS a customer-facing page, so the endpoint has to
 * refuse one.
 *
 * The bar is deliberately low — this rejects a placeholder, not a short post.
 * A genuine article clears it by an order of magnitude.
 */
const MIN_WORDS_PUBLISHED = 150;

function wordCount(html: string): number {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

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

  // Content must be HTML. The render path injects these fields as markup, so
  // Markdown does not degrade — it renders literally, and a reader sees `##`
  // and `**` on the page. The first automated post arrived as Markdown and was
  // accepted with a 200, which taught the writer nothing. Reject it loudly.
  for (const f of ['contentEn', 'contentZh'] as const) {
    const err = htmlProblem(body[f] as string, f);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  // localizations must be a plain JSON object of string values, keyed EXACTLY
  // as the renderer reads them: <field><LocaleSuffix>, e.g. `titleJa`. The
  // first automated post used bare locale codes (`ja`, `es`), which are valid
  // JSON, stored fine, and are invisible to every read path — 12 translations
  // that silently did not exist. Structural validity is not the bar; matching
  // the contract is.
  const localizations: Record<string, string> = {};
  if (body.localizations !== undefined) {
    const l = body.localizations;
    if (typeof l !== 'object' || l === null || Array.isArray(l)) {
      return NextResponse.json({ error: '`localizations` must be an object.' }, { status: 400 });
    }
    const bad: string[] = [];
    for (const [k, v] of Object.entries(l as Record<string, unknown>)) {
      if (typeof v !== 'string') {
        return NextResponse.json(
          { error: `localizations.${k} must be a string.` },
          { status: 400 },
        );
      }
      if (!LOCALIZATION_KEY_RE.test(k)) bad.push(k);
      localizations[k] = v;
    }
    if (bad.length > 0) {
      return NextResponse.json(
        {
          error:
            `Unrecognised localizations key(s): ${bad.slice(0, 8).join(', ')}` +
            (bad.length > 8 ? ` (+${bad.length - 8} more)` : '') +
            `. Keys must be <field><Locale>, e.g. "titleJa". ` +
            `Fields: ${LOC_FIELDS.join('|')}. Locales: ${LOC_SUFFIXES.join('|')}. ` +
            `A bare locale code like "ja" is stored but never read by the site.`,
          expectedExample: { titleJa: '…', contentJa: '<p>…</p>', excerptJa: '…' },
        },
        { status: 400 },
      );
    }
    // A locale with a title but no body renders an empty page under a real
    // headline — worse than the locale simply being absent.
    const missingBody = LOC_SUFFIXES.filter(
      (s) => localizations[`title${s}`] && !localizations[`content${s}`],
    );
    if (missingBody.length > 0) {
      return NextResponse.json(
        {
          error:
            `Locale(s) ${missingBody.join(', ')} have a title but no content. ` +
            `Send content<Locale> for each locale you send title<Locale> for, or omit the locale entirely.`,
        },
        { status: 400 },
      );
    }
    for (const s of LOC_SUFFIXES) {
      const err = htmlProblem(localizations[`content${s}`], `localizations.content${s}`);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }
  }

  const readingTime =
    typeof body.readingTimeMinutes === 'number' && Number.isInteger(body.readingTimeMinutes)
      ? body.readingTimeMinutes
      : null;

  // Published by default (owner decision, 2026-08-07). The endpoint's own
  // validation is the gate now, not a human review step — so anything that
  // reaches the database is already well-formed. Pass `isPublished: false`
  // explicitly to stage a draft.
  const isPublished = body.isPublished !== false;

  // Only gate what goes live. A deliberate draft (isPublished:false) may be any
  // length — that is a legitimate way to stage work in progress.
  if (isPublished) {
    const words = wordCount(body.contentEn as string);
    if (words < MIN_WORDS_PUBLISHED) {
      return NextResponse.json(
        {
          error:
            `contentEn has ~${words} words; a published post needs at least ` +
            `${MIN_WORDS_PUBLISHED}. This endpoint publishes immediately, so a ` +
            `placeholder becomes a live customer-facing page. Send the finished ` +
            `article, or pass "isPublished": false to stage a draft.`,
        },
        { status: 400 },
      );
    }
  }

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
