import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { locales } from '@/i18n/config';

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

// Per content type: the URL base for building all-locale paths.
//
// We deliberately revalidate by PATH only (no cache tags). On this Next 16 /
// Vercel setup `revalidateTag` OVER-INVALIDATES: busting one tag regenerates
// pages that don't use it — empirically a `services` tag bust regenerated a
// project detail page that reads no services data — i.e. ~a full-cache wipe per
// call. That broad regeneration was the dominant ISR-write cost. `revalidatePath`
// is surgical (only the given path regenerates; verified an unrelated page stayed
// HIT through a port-moody path bust). So {type,slug} expands to the exact
// all-locale detail + index paths and fires ZERO tags.
const TYPE_CONFIG: Record<string, { base: string }> = {
  blog: { base: 'blog' },
  project: { base: 'projects' },
  area: { base: 'areas' },
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

  // 1. Convenience: { type, slug } -> all-locale detail + index PATHS (no tags;
  //    see TYPE_CONFIG note). The homepage's gallery/sections refresh on their
  //    own daily ISR TTL — not worth a per-edit regen of the homepage × locales.
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
  }

  // 2. Explicit paths.
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p === 'string' && p.startsWith('/')) revalidatedPaths.push(p);
    }
  }

  // 3. Explicit tags — DELIBERATE broad busts only (e.g. `nav:globals` to refresh
  //    the footer/nav site-wide). Because revalidateTag over-invalidates here, a
  //    tag bust ≈ a full-cache regen — do NOT use for routine content edits; use
  //    {type,slug} or {paths} for those.
  if (Array.isArray(body.tags)) {
    for (const t of body.tags) {
      if (typeof t === 'string' && t.length > 0 && t.length < 256) revalidatedTags.push(t);
    }
  }

  if (revalidatedPaths.length === 0 && revalidatedTags.length === 0) {
    return NextResponse.json({ error: 'Nothing to revalidate. Provide paths, tags, or type+slug.' }, { status: 400 });
  }

  // Apply each invalidation independently so one failing call can't 500 the whole
  // request (PR #113). revalidatePath is surgical and sufficient. revalidateTag
  // (explicit tags only now) is best-effort + intentionally broad.
  const okPaths: string[] = [];
  const okTags: string[] = [];
  const errors: string[] = [];
  for (const p of [...new Set(revalidatedPaths)]) {
    try { revalidatePath(p); okPaths.push(p); }
    catch (e) { errors.push(`path ${p}: ${e instanceof Error ? e.message : String(e)}`); }
  }
  for (const t of [...new Set(revalidatedTags)]) {
    try { revalidateTag(t, 'max'); okTags.push(t); }
    catch (e) { errors.push(`tag ${t}: ${e instanceof Error ? e.message : String(e)}`); }
  }

  return NextResponse.json({ revalidated: okPaths.length > 0 || okTags.length > 0, paths: okPaths, tags: okTags, errors });
}
