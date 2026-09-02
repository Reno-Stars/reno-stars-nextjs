import { buildSitemapFile } from '@/lib/sitemap/sections';
import { renderUrlset } from '@/lib/sitemap/xml';

/**
 * /sitemaps/<section>-<n>.xml — one slice of the sitemap.
 *
 * Each request builds only its own section slice, which is what bounds the
 * memory a crawler can make the pod spend. The former single sitemap expanded
 * every URL and serialised 12.3 MB per request; a handful of those at once took
 * the heap out (incident 2026-09-02).
 *
 * A file name that does not correspond to a real section/page 404s rather than
 * returning an empty <urlset>, so a stale index entry or a fabricated URL is
 * visible instead of silently looking like a section that legitimately has no
 * URLs.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  // The route captures the whole segment including the extension.
  const name = file.endsWith('.xml') ? file.slice(0, -'.xml'.length) : file;

  const entries = await buildSitemapFile(name);
  if (!entries) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(renderUrlset(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
