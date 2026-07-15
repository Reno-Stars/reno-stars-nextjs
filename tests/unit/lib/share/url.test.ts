import { describe, it, expect } from 'vitest';
import { buildShareUrl, enc } from '@/lib/share/url';
import { PLATFORMS } from '@/lib/share/platforms';
import type { PlatformId } from '@/lib/share/types';

const CANONICAL = 'https://www.reno-stars.com/en/blog/kitchen-costs/';

const tagged = (id: PlatformId) => buildShareUrl(CANONICAL, PLATFORMS[id]);

describe('buildShareUrl — UTM tagging', () => {
  it('tags platform shares so returning traffic is attributable', () => {
    const url = new URL(tagged('facebook'));
    expect(url.searchParams.get('utm_source')).toBe('facebook');
    expect(url.searchParams.get('utm_medium')).toBe('social');
    expect(url.searchParams.get('utm_campaign')).toBe('share');
  });

  it('tags each platform with its own id', () => {
    expect(new URL(tagged('weibo')).searchParams.get('utm_source')).toBe('weibo');
    expect(new URL(tagged('whatsapp')).searchParams.get('utm_source')).toBe('whatsapp');
  });

  it('tags the WeChat QR — a scan is still an attributable share', () => {
    expect(new URL(tagged('wechat')).searchParams.get('utm_source')).toBe('wechat');
  });

  it('leaves Copy link clean — the visitor sees and pastes this URL', () => {
    expect(tagged('copy')).toBe(CANONICAL);
  });

  it('leaves the native sheet clean for the same reason', () => {
    expect(tagged('native')).toBe(CANONICAL);
  });

  it('preserves the canonical path and origin exactly', () => {
    const url = new URL(tagged('x'));
    expect(url.origin).toBe('https://www.reno-stars.com');
    expect(url.pathname).toBe('/en/blog/kitchen-costs/');
  });

  it('keeps query params the canonical already carried', () => {
    const withQuery = 'https://www.reno-stars.com/en/projects/?page=2';
    const url = new URL(buildShareUrl(withQuery, PLATFORMS.facebook));
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('utm_source')).toBe('facebook');
  });

  it('returns the input untagged rather than throwing on a malformed canonical', () => {
    // Untagged beats broken: a relative URL should still produce a share link.
    expect(buildShareUrl('/en/blog/oops/', PLATFORMS.facebook)).toBe('/en/blog/oops/');
  });
});

describe('enc — encoding', () => {
  it('encodes RTL titles (ar/fa post titles reach these builders verbatim)', () => {
    const encoded = enc('تجديد المطبخ');
    expect(encoded).not.toContain(' ');
    expect(decodeURIComponent(encoded)).toBe('تجديد المطبخ');
  });

  it('encodes emoji without mangling surrogate pairs', () => {
    expect(decodeURIComponent(enc('Kitchen reno 🔨 done'))).toBe('Kitchen reno 🔨 done');
  });

  it('encodes characters that would otherwise break out of a query param', () => {
    expect(enc('a&b=c?d#e')).toBe('a%26b%3Dc%3Fd%23e');
  });
});

describe('platform href builders', () => {
  const ctx = {
    url: CANONICAL,
    title: 'Kitchen & Bath: 2026 Costs',
    imageUrl: 'https://img.reno-stars.com/hero.webp',
  };

  // Snapshot every builder against one fixture. This is what catches an
  // encoding regression when someone edits a template string in platforms.ts.
  it.each(Object.keys(PLATFORMS) as PlatformId[])('%s builds a stable href', (id) => {
    expect(PLATFORMS[id].href(ctx)).toMatchSnapshot();
  });

  it('never leaks a raw ampersand from a title into a query string', () => {
    for (const id of Object.keys(PLATFORMS) as PlatformId[]) {
      const href = PLATFORMS[id].href(ctx);
      // The title contains "&" — it must arrive encoded, never as a separator.
      expect(href, `${id} leaked an unencoded title`).not.toContain('Bath: 2026');
    }
  });
});
