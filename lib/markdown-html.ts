import sanitizeHtml, { type IOptions } from 'sanitize-html';
import { marked } from 'marked';
import { locales } from '@/i18n/config';

/**
 * Sanitize options used for service/blog/area long-form content.
 * Allows standard prose tags + images, strips scripts and inline event handlers.
 */
export const PROSE_SANITIZE_OPTIONS: IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height', 'loading'],
  },
};

/**
 * Convert markdown (or HTML) string to safe HTML for `dangerouslySetInnerHTML`.
 * `marked` passes existing HTML through unchanged, so accepts both formats.
 */
export function renderProseHtml(content: string): string {
  return sanitizeHtml(
    marked.parse(content, { async: false }) as string,
    PROSE_SANITIZE_OPTIONS,
  );
}

const INTERNAL_LINK_HOSTS = ['www.reno-stars.com', 'reno-stars.com'];

/**
 * Normalize in-content internal `<a href>`s to their canonical form:
 * trailing slash, locale prefix, https + www host. When `locale` is given, a
 * link that carries no locale is prefixed with it, and one that carries a
 * *different* locale (e.g. a hard-coded `/en/...` inherited by a translated
 * body) is rewritten to the page's own locale so localized content keeps its
 * readers in-locale. Authored content links
 * like `/en/contact` or `/blog/foo` each cost a 308 (or two) per crawl —
 * across ~3,300 rendered blog pages these chains are the bulk of GSC's
 * 1,309 "Page with redirect" URLs (2026-07-07 audit). Run AFTER sanitizeHtml
 * (attributes are then double-quoted). External hosts, files with
 * extensions, /api/, mailto:/tel:/#anchor links are left untouched.
 */
export function normalizeInternalLinks(html: string, locale?: string): string {
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    const m = tag.match(/\shref="([^"]+)"/i);
    if (!m) return tag;
    const href = m[1];
    if (/^(mailto:|tel:|#|data:|javascript:)/i.test(href)) return tag;
    let url: URL;
    try { url = new URL(href, 'https://www.reno-stars.com'); } catch { return tag; }
    if (!INTERNAL_LINK_HOSTS.includes(url.hostname)) return tag;
    let path = url.pathname;
    if (path.startsWith('/api/') || /\.[a-z0-9]{2,5}$/i.test(path)) return tag;
    if (locale) {
      const segments = path.split('/').filter(Boolean);
      const first = segments[0];
      if (!first) {
        path = `/${locale}/`;
      } else if (!(locales as readonly string[]).includes(first)) {
        path = `/${locale}${path}`;
      } else if (first !== locale) {
        // Replace an already-present *foreign* locale prefix with the page's own
        // locale. Translated blog bodies (content_zh et al.) inherited hard-coded
        // `/en/...` links from their English source, so without this every in-body
        // link on a non-English blog page sends the reader to the English page and
        // drains that locale's internal-link equity. Every `/[locale]/…` content
        // route exists in all locales, so the rewritten target is always a 200 with
        // no redirect. A same-locale prefix (first === locale) is left untouched.
        segments[0] = locale;
        path = `/${segments.join('/')}`;
      }
    }
    if (!path.endsWith('/')) path += '/';
    const rebuilt = (href.startsWith('/') ? '' : 'https://www.reno-stars.com')
      + path + url.search + url.hash;
    if (rebuilt === href) return tag;
    return tag.replace(/\shref="[^"]+"/i, ` href="${rebuilt}"`);
  });
}
