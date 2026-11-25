import { describe, it, expect, vi } from 'vitest';

/**
 * DI-17 (2026-11-24): 301s for internal links that are written wrong in
 * DATABASE content (lib/seo/dead-link-redirects.ts, applied in proxy.ts).
 */

// The real next-intl middleware pulls Next runtime internals that do not
// resolve under vitest; every redirect under test returns before it is reached.
vi.mock('next-intl/middleware', () => ({ default: () => () => new Response(null) }));

const TEST_A = [
  'kitchen/richmond', 'kitchen/delta', 'kitchen/coquitlam', 'kitchen/north-vancouver',
  'basement/north-vancouver', 'basement/burnaby', 'basement/langley', 'basement/port-moody',
  'cabinet/delta', 'cabinet/port-moody', 'bathroom/port-coquitlam', 'bathroom/white-rock',
  'heat-pump-hvac/port-moody', 'critical-load-panel/langley',
];

async function proxyGet(path: string) {
  const { NextRequest } = await import('next/server');
  const { default: proxy } = await import('@/proxy');
  return proxy(new NextRequest(`https://www.reno-stars.com${path}`));
}

describe('dead internal-link 301 table', () => {
  it('maps a path in any locale to the same locale, with a trailing slash', async () => {
    const { deadLinkRedirectPath } = await import('@/lib/seo/dead-link-redirects');
    expect(deadLinkRedirectPath('/en/blog/port-moody-home-renovation-guide-2026/'))
      .toBe('/en/blog/whole-house-renovation-port-moody-2026/');
    expect(deadLinkRedirectPath('/zh-Hant/blog/condo-renovation-burnaby-bc-2026'))
      .toBe('/zh-Hant/blog/condo-renovation-cost-metro-vancouver-2026/');
    expect(deadLinkRedirectPath('/ja/projects/minimalist-bathroom-renovation-in-richmond/'))
      .toBe('/ja/projects/minimalist-bathroom-renovation-richmond/');
    expect(deadLinkRedirectPath('/es/contacto/')).toBe('/es/contact/');
  });

  it('matches machine-translated paths whether percent-encoded or not', async () => {
    const { deadLinkRedirectPath } = await import('@/lib/seo/dead-link-redirects');
    const raw = '/hi/guides/रसोई-नवीनीकरण-लागत-Vancouver/';
    expect(deadLinkRedirectPath(raw)).toBe('/hi/guides/kitchen-renovation-cost-vancouver/');
    expect(deadLinkRedirectPath(encodeURI(raw))).toBe('/hi/guides/kitchen-renovation-cost-vancouver/');
    expect(deadLinkRedirectPath(encodeURI('/es/guias/coste-de-renovación-del-sótano-vancouver/')))
      .toBe('/es/guides/basement-renovation-cost-vancouver/');
  });

  it('leaves live pages, unknown paths, non-locale paths and TEST A alone', async () => {
    const { deadLinkRedirectPath } = await import('@/lib/seo/dead-link-redirects');
    for (const p of [
      '/en/', '/en/contact/', '/en/projects/', '/en/projects/kitchen/',
      '/en/blog/whole-house-renovation-port-moody-2026/', '/en/blog/no-such-post/',
      '/xx/contacto/', '/contacto/', '/api/contacto/',
      ...TEST_A.map((k) => `/en/services/${k}/`),
    ]) {
      expect(deadLinkRedirectPath(p), p).toBeNull();
    }
  });

  it('is a well-formed table: no loops, no chains, every target a real top-level section', async () => {
    const { DEAD_LINK_REDIRECTS } = await import('@/lib/seo/dead-link-redirects');
    const SECTIONS = new Set(['blog', 'projects', 'services', 'guides', 'areas', 'contact', 'design', 'reviews', 'showroom']);
    for (const [from, to] of Object.entries(DEAD_LINK_REDIRECTS)) {
      expect(from).not.toBe(to);
      expect(DEAD_LINK_REDIRECTS[to], `${from} → ${to} chains`).toBeUndefined();
      expect(to).not.toMatch(/^\/|\/$/);
      expect(SECTIONS.has(to.split('/')[0]), to).toBe(true);
      expect(to, 'target must be plain ASCII lower-case').toMatch(/^[a-z0-9/-]+$/);
    }
  });

  it('proxy answers a real 301 that keeps the locale', async () => {
    for (const [path, expected] of [
      ['/en/blog/port-moody-home-renovation-guide-2026/', '/en/blog/whole-house-renovation-port-moody-2026/'],
      ['/fr/projects/three-and-a-half-bathroom-renovation-delta/', '/fr/projects/three-bathroom-renovation-delta/'],
      [encodeURI('/hi/संपर्क/'), '/hi/contact/'],
    ] as const) {
      const res = await proxyGet(path);
      expect(res.status, path).toBe(301);
      expect(new URL(res.headers.get('location')!).pathname).toBe(expected);
    }
  });

  it('proxy does not redirect a TEST A service×city page', async () => {
    for (const k of TEST_A) {
      const res = await proxyGet(`/en/services/${k}/`);
      expect(res.status, k).not.toBe(301);
      expect(res.headers.get('location'), k).toBeNull();
    }
  });
});

describe('prototype-safe lookup', () => {
  // A plain-object lookup also matches Object.prototype members: before the
  // fix /en/constructor/ answered 301 → "/en/function Object() { [native code] }/".
  const PROTO = ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf', 'isPrototypeOf'];

  it.each(PROTO)('/en/%s/ is not in the table → no redirect', async (key) => {
    const { deadLinkRedirectPath } = await import('@/lib/seo/dead-link-redirects');
    expect(deadLinkRedirectPath(`/en/${key}/`)).toBeNull();
    expect(deadLinkRedirectPath(`/zh/${key}`)).toBeNull();
  });

  it('proxy hands /en/constructor/ (and friends) to the router — no 301, no Location', async () => {
    for (const key of PROTO) {
      const res = await proxyGet(`/en/${key}/`);
      expect(res.status, key).not.toBe(301);
      expect(res.headers.get('location'), key).toBeNull();
    }
  });

  it('every one of the 124 real entries still redirects exactly as before', async () => {
    const { DEAD_LINK_REDIRECTS, deadLinkRedirectPath } = await import('@/lib/seo/dead-link-redirects');
    const entries = Object.entries(DEAD_LINK_REDIRECTS);
    expect(entries).toHaveLength(124);
    for (const [from, to] of entries) {
      expect(deadLinkRedirectPath(`/en/${from}/`), from).toBe(`/en/${to}/`);
    }
  });
});

