import { listSitemapFiles } from '@/lib/sitemap/sections';
import { renderSitemapIndex } from '@/lib/sitemap/xml';
import { getBaseUrl } from '@/lib/utils';

/**
 * /sitemap.xml — the sitemap INDEX.
 *
 * This URL is what robots.txt advertises and what Search Console has on file,
 * so it stays put; only its CONTENT changed, from one enormous <urlset> to a
 * <sitemapindex> pointing at /sitemaps/<section>-<n>.xml.
 *
 * Why it moved off Next's metadata route (`app/sitemap.ts`, deleted): that
 * renders a single document, and with `force-dynamic` it rebuilt all 5,825
 * URLs — 12.3 MB of XML — on every request. Concurrent crawler hits exhausted
 * the pod's V8 heap (`Reached heap limit`, SIGSEGV, restart, 502 each time;
 * incident 2026-09-02). Next 16 also emits no sitemap index of its own, so the
 * index had to be hand-served regardless.
 *
 * Still `force-dynamic`, for the original reason: a freshly published post must
 * appear immediately, and a metadata-route ISR entry could not be busted on
 * demand (verified 2026-07-03). The index is a few hundred bytes, and the
 * s-maxage below lets Cloudflare absorb repeat crawler hits so a crawl burst no
 * longer reaches the origin at all.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = getBaseUrl();
  const files = await listSitemapFiles();

  const xml = renderSitemapIndex(
    files.map(({ file, lastModified }) => ({
      loc: `${baseUrl}/sitemaps/${file}.xml`,
      lastModified,
    })),
  );

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
