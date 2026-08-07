import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNotNull, ne, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

/**
 * Read-only asset catalogue for the content agent.
 *
 * Why this exists: the SEO agent writes blog posts from a remote container. It
 * has SERVICES_NEON_DB, but that points at 127.0.0.1:5435 — the database is
 * deliberately not exposed through the tunnel — so the agent cannot see a
 * single real project, photo, or slug. Its first post therefore shipped with no
 * featured image, no inline photo, and no project link, against a corpus where
 * 98% of posts carry a featured image and 84% link a project.
 *
 * Telling it to "use images" without this endpoint would only invite it to
 * invent URLs, which is the fabrication class the whole pipeline guards against.
 * This gives it real ones.
 *
 * READ-ONLY and deliberately narrow: published projects only, and only the
 * fields needed to illustrate and cite a post. Same Bearer token as the blog
 * endpoint — it is the same caller doing the same job — but this route can
 * never write.
 */

const MAX_LIMIT = 60;

// The `db` export is a lazy Proxy (safe to import at build time), which costs
// drizzle's return-type inference — selected rows arrive as `any`. Naming the
// shape here keeps the filter/map callbacks type-checked instead of silently
// `any`, which is how a renamed column becomes a runtime undefined.
type AssetRow = {
  slug: string;
  titleEn: string | null;
  titleZh: string | null;
  heroImageUrl: string | null;
  locationCity: string | null;
  serviceType: string | null;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.BLOG_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Content API not configured.' }, { status: 503 });
  }
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(secret);
  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const service = url.searchParams.get('service')?.trim() ?? '';
  const city = url.searchParams.get('city')?.trim() ?? '';
  const limitRaw = Number(url.searchParams.get('limit') ?? '20');
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, limitRaw), MAX_LIMIT) : 20;

  try {
    const rows = await db
      .select({
        slug: projects.slug,
        titleEn: projects.titleEn,
        titleZh: projects.titleZh,
        heroImageUrl: projects.heroImageUrl,
        locationCity: projects.locationCity,
        serviceType: projects.serviceType,
      })
      .from(projects)
      .where(
        and(
          eq(projects.isPublished, true),
          isNotNull(projects.heroImageUrl),
          ne(projects.heroImageUrl, ''),
        ),
      )
      .orderBy(desc(projects.createdAt))
      .limit(MAX_LIMIT);

    // Filtering in JS rather than SQL: serviceType/locationCity are free-text
    // and the caller passes human words ("kitchen", "Burnaby"). A LIKE in SQL
    // would need escaping for a caller-supplied string; this cannot inject.
    const norm = (s: unknown) => String(s ?? '').toLowerCase();
    const filtered = rows
      .filter((r: AssetRow) => (service ? norm(r.serviceType).includes(service.toLowerCase()) : true))
      .filter((r: AssetRow) => (city ? norm(r.locationCity).includes(city.toLowerCase()) : true))
      .slice(0, limit);

    return NextResponse.json({
      count: filtered.length,
      // Spelled out so the caller does not have to guess the URL shape, which
      // is the other way agents invent links.
      projectUrlPattern: '/{locale}/projects/{slug}/',
      contactUrlPattern: '/{locale}/contact/',
      projects: filtered.map((r: AssetRow) => ({
        slug: r.slug,
        titleEn: r.titleEn,
        titleZh: r.titleZh,
        city: r.locationCity ?? null,
        serviceType: r.serviceType ?? null,
        heroImageUrl: r.heroImageUrl,
        projectUrl: `/en/projects/${r.slug}/`,
      })),
    });
  } catch (err) {
    console.error('[api/content-assets] query failed', err);
    return NextResponse.json({ error: 'Query failed.' }, { status: 500 });
  }
}
