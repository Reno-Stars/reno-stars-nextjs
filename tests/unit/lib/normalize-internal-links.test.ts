import { describe, it, expect } from 'vitest';
import { normalizeInternalLinks } from '@/lib/markdown-html';

const a = (href: string) => `<a href="${href}">x</a>`;

describe('normalizeInternalLinks', () => {
  it('adds a trailing slash to internal path links', () => {
    expect(normalizeInternalLinks(a('/en/contact'))).toBe(a('/en/contact/'));
  });

  it('leaves already-canonical links untouched', () => {
    const html = a('/en/blog/some-post/');
    expect(normalizeInternalLinks(html)).toBe(html);
  });

  it('prefixes the current locale on locale-less paths', () => {
    expect(normalizeInternalLinks(a('/contact'), 'zh')).toBe(a('/zh/contact/'));
    expect(normalizeInternalLinks(a('/blog/foo'), 'en')).toBe(a('/en/blog/foo/'));
  });

  it('leaves an already-in-locale prefix untouched (no double-prefix)', () => {
    expect(normalizeInternalLinks(a('/zh/blog/foo/'), 'zh')).toBe(a('/zh/blog/foo/'));
    expect(normalizeInternalLinks(a('/en/contact/'), 'en')).toBe(a('/en/contact/'));
  });

  it('rewrites a foreign locale prefix to the page locale (keeps readers in-locale)', () => {
    // Translated blog bodies inherit hard-coded `/en/...` links from the English
    // source; on a zh page they must localize to `/zh/...`, not send readers to EN.
    expect(normalizeInternalLinks(a('/en/areas/vancouver/'), 'zh')).toBe(a('/zh/areas/vancouver/'));
    expect(normalizeInternalLinks(a('/en/services/kitchen'), 'zh')).toBe(a('/zh/services/kitchen/'));
    expect(normalizeInternalLinks(a('/zh-Hant/blog/foo'), 'en')).toBe(a('/en/blog/foo/'));
    // Home ("/en/") localizes to the page-locale home, not "/en/zh/…".
    expect(normalizeInternalLinks(a('/en/'), 'ja')).toBe(a('/ja/'));
  });

  it('preserves query + fragment when rewriting a foreign locale prefix', () => {
    expect(normalizeInternalLinks(a('/en/contact?src=blog#form'), 'zh')).toBe(a('/zh/contact/?src=blog#form'));
  });

  it('canonicalizes absolute own-host links to https://www + trailing slash', () => {
    expect(normalizeInternalLinks(a('https://reno-stars.com/en/services/kitchen'))).toBe(
      a('https://www.reno-stars.com/en/services/kitchen/'),
    );
  });

  it('preserves query strings and fragments', () => {
    expect(normalizeInternalLinks(a('/en/contact?src=blog#form'))).toBe(a('/en/contact/?src=blog#form'));
  });

  it('leaves external, file, api, mailto, tel, and anchor links untouched', () => {
    for (const href of [
      'https://example.com/foo',
      '/downloads/brochure.pdf',
      '/api/og?title=x',
      'mailto:hi@reno-stars.com',
      'tel:+17789607999',
      '#section-2',
    ]) {
      expect(normalizeInternalLinks(a(href))).toBe(a(href));
    }
  });

  it('handles multiple anchors and non-anchor content in one pass', () => {
    const html = `<p>see ${a('/en/blog/foo')} and ${a('https://example.com/x')}</p>`;
    expect(normalizeInternalLinks(html)).toBe(`<p>see ${a('/en/blog/foo/')} and ${a('https://example.com/x')}</p>`);
  });
});
