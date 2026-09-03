import type { MetadataRoute } from 'next';

/**
 * Sitemap XML serialisation.
 *
 * The site used to let Next's metadata route (`app/sitemap.ts`) render one
 * sitemap containing every URL. That produced a 12.3 MB document built from
 * scratch on every request (`force-dynamic`), and a handful of concurrent
 * crawler hits exhausted the pod's V8 heap — `FATAL ERROR: Reached heap limit`,
 * SIGSEGV, restart, and a 502 window each time because the deployment runs a
 * small number of replicas (production incident 2026-09-02).
 *
 * Splitting into an index plus per-section files means no single request builds
 * more than a slice, but Next only renders ONE sitemap per metadata route and
 * emits no index at all (verified: Next 16.1.6 ships no `sitemapindex` writer).
 * So the XML is written here instead.
 *
 * The element order and shape below reproduce Next's own renderer exactly, as
 * observed in the live 5,825-URL sitemap this replaced:
 *   <loc> -> <xhtml:link> alternates -> <image:image> -> <video:video>
 *         -> <lastmod> -> <changefreq> -> <priority>
 * Keeping byte-compatible output is what lets the split be verified by diffing
 * the new files' URLs against the sitemap that was live before it.
 */

const URLSET_NS = [
  'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
  'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"',
  'xmlns:xhtml="http://www.w3.org/1999/xhtml"',
].join(' ');

/** Escape the five XML predefined entities. `&` must be replaced first. */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** `lastModified` may be a Date or an ISO string; Next emits the ISO form. */
function lastmod(value: MetadataRoute.Sitemap[number]['lastModified']): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function renderEntry(entry: MetadataRoute.Sitemap[number]): string {
  const lines: string[] = ['<url>', `<loc>${xmlEscape(entry.url)}</loc>`];

  const languages = entry.alternates?.languages;
  if (languages) {
    for (const [hreflang, href] of Object.entries(languages)) {
      if (!href) continue;
      lines.push(
        `<xhtml:link rel="alternate" hreflang="${xmlEscape(hreflang)}" href="${xmlEscape(String(href))}" />`,
      );
    }
  }

  for (const image of entry.images ?? []) {
    lines.push('<image:image>', `<image:loc>${xmlEscape(image)}</image:loc>`, '</image:image>');
  }

  for (const video of entry.videos ?? []) {
    lines.push('<video:video>');
    lines.push(`<video:title>${xmlEscape(video.title)}</video:title>`);
    lines.push(`<video:thumbnail_loc>${xmlEscape(video.thumbnail_loc)}</video:thumbnail_loc>`);
    lines.push(`<video:description>${xmlEscape(video.description)}</video:description>`);
    if (video.content_loc) {
      lines.push(`<video:content_loc>${xmlEscape(String(video.content_loc))}</video:content_loc>`);
    }
    if (video.publication_date) {
      const published = video.publication_date;
      const iso = published instanceof Date ? published.toISOString() : String(published);
      lines.push(`<video:publication_date>${xmlEscape(iso)}</video:publication_date>`);
    }
    lines.push('</video:video>');
  }

  const modified = lastmod(entry.lastModified);
  if (modified) lines.push(`<lastmod>${xmlEscape(modified)}</lastmod>`);
  if (entry.changeFrequency) lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
  // Number formatting matters: Next renders 1.0 as "1" and 0.7 as "0.7".
  if (entry.priority !== undefined) lines.push(`<priority>${entry.priority}</priority>`);

  lines.push('</url>');
  return lines.join('\n');
}

/** A `<urlset>` document — one sitemap FILE. */
export function renderUrlset(entries: MetadataRoute.Sitemap): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset ${URLSET_NS}>`,
    ...entries.map(renderEntry),
    '</urlset>',
    '',
  ].join('\n');
}

export interface SitemapIndexEntry {
  loc: string;
  lastModified?: string;
}

/** A `<sitemapindex>` document — served at /sitemap.xml. */
export function renderSitemapIndex(sitemaps: SitemapIndexEntry[]): string {
  const body = sitemaps.map(({ loc, lastModified }) => {
    const lines = ['<sitemap>', `<loc>${xmlEscape(loc)}</loc>`];
    if (lastModified) lines.push(`<lastmod>${xmlEscape(lastModified)}</lastmod>`);
    lines.push('</sitemap>');
    return lines.join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...body,
    '</sitemapindex>',
    '',
  ].join('\n');
}
