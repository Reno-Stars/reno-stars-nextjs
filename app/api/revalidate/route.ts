import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { locales } from '@/i18n/config';
import { logEvent } from '@/lib/log';

/**
 * On-demand revalidation endpoint — the cheap alternative to a full redeploy.
 *
 * Why this exists: content lives in Neon and is edited frequently (the SEO
 * agent writes the DB directly, bypassing the Next.js admin server actions).
 * Previously the only way to surface those edits was `triggerDeploy()` — a
 * FULL Vercel rebuild on every edit, which wipes the entire ISR cache and
 * forces ~all pages to regenerate on the next crawl. `deploy-hook.ts` itself
 * documents the result: "each deploy prerendering ~600 pages → millions of
 * cache writes/week" — the dominant driver of the $83.93/mo ISR-write bill.
 *
 * This endpoint lets an external editor (the SEO agent, a cron, a webhook)
 * revalidate ONLY the pages that actually changed — every locale of one slug,
 * not the whole site. Writes become proportional to real edits. No deploy.
 *
 * Auth: Bearer token in `Authorization` header, matched against
 * `REVALIDATE_SECRET`. Returns 401 if missing/wrong, 503 if the secret isn't
 * configured (fail closed — never allow unauthenticated cache busting).
 *
 * Body (JSON), any combination:
 *   { "paths": ["/en/blog/x", "/zh/blog/x"] }   // exact paths
 *   { "tags": ["project:burnaby-kitchen"] }      // cache tags
 *   { "type": "blog", "slug": "x" }              // convenience: expands to
 *                                                //   /{locale}/blog/x for ALL
 *                                                //   locales + the index
 * `type` ∈ blog | project | area  (maps to /blog, /projects, /areas).
 */

// Per content type: the URL base + the data-cache tags an edit must bust.
// revalidatePath fixes the route cache; these tags fix the `unstable_cache`
// data entries the page reads (else a re-render serves stale data). These
// mirror what the admin server actions fire (blog-revalidate.ts, projects.ts,
// service-areas.ts) so the SEO agent's direct-DB edits get the same coverage.
const TYPE_CONFIG: Record<string, { base: string; tags: (slug: string) => string[] }> = {
  blog: { base: 'blog', tags: (slug) => [`blog:${slug}`, 'blog:listing'] },
  project: { base: 'projects', tags: (slug) => [`project:${slug}`, 'projects:listing', 'sites:listing'] },
  area: { base: 'areas', tags: (slug) => [`area:${slug}`] },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    // Fail closed: if the secret isn't set, do NOT allow anonymous revalidation.
    return NextResponse.json({ error: 'Revalidation not configured.' }, { status: 503 });
  }
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: { paths?: unknown; tags?: unknown; type?: unknown; slug?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const revalidatedPaths: string[] = [];
  const revalidatedTags: string[] = [];

  // 1. Convenience: { type, slug } -> all-locale detail paths + the index +
  //    the data-cache tags that back those pages.
  if (typeof body.type === 'string' && typeof body.slug === 'string') {
    const cfg = TYPE_CONFIG[body.type];
    if (!cfg) {
      return NextResponse.json({ error: `Unknown type "${body.type}". Use blog | project | area.` }, { status: 400 });
    }
    const slug = body.slug.replace(/^\/+|\/+$/g, '');
    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug.' }, { status: 400 });
    }
    for (const loc of locales) {
      revalidatedPaths.push(`/${loc}/${cfg.base}/${slug}`);
      revalidatedPaths.push(`/${loc}/${cfg.base}`); // the listing index
    }
    revalidatedTags.push(...cfg.tags(slug));
  }

  // 2. Explicit paths.
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p === 'string' && p.startsWith('/')) revalidatedPaths.push(p);
    }
  }

  // 3. Explicit tags.
  if (Array.isArray(body.tags)) {
    for (const t of body.tags) {
      if (typeof t === 'string' && t.length > 0 && t.length < 256) revalidatedTags.push(t);
    }
  }

  if (revalidatedPaths.length === 0 && revalidatedTags.length === 0) {
    return NextResponse.json({ error: 'Nothing to revalidate. Provide paths, tags, or type+slug.' }, { status: 400 });
  }

  // Dedupe + apply. revalidatePath/Tag are synchronous cache-mark operations.
  // revalidateTag(tag, 'max') is the route-handler-safe API (updateTag is
  // Server-Action-only and throws here). 'max' = invalidate immediately.
  for (const p of [...new Set(revalidatedPaths)]) revalidatePath(p);
  for (const t of [...new Set(revalidatedTags)]) revalidateTag(t, 'max');

  // Log every revalidation to Neon `app_log` — lets us measure how much ISR
  // write activity is edit-driven (this endpoint) vs crawl-after-deploy, and
  // gives a trail of what the SEO agent busts. Best-effort (never blocks).
  const kind = (typeof body.type === 'string' && typeof body.slug === 'string')
    ? 'type-slug'
    : Array.isArray(body.tags) && body.tags.length ? 'tags'
    : Array.isArray(body.paths) && body.paths.length ? 'paths' : 'other';
  await logEvent({
    event: 'revalidate',
    source: 'revalidate',
    msg: kind,
    meta: {
      type: typeof body.type === 'string' ? body.type : null,
      slug: typeof body.slug === 'string' ? body.slug : null,
      tags: [...new Set(revalidatedTags)],
      pathsCount: [...new Set(revalidatedPaths)].length,
      ua: (req.headers.get('user-agent') ?? '').slice(0, 200),
    },
  });

  return NextResponse.json({
    revalidated: true,
    paths: [...new Set(revalidatedPaths)],
    tags: [...new Set(revalidatedTags)],
  });
}
