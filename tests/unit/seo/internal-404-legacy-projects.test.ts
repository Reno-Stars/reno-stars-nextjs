import { describe, it, expect, vi } from 'vitest';

/**
 * DI-17 follow-up (task 127/134): 9 legacy project slugs that were linked from
 * the old service-hub cards (code-fixed in #410) now 301 to a live page.
 */
vi.mock('next-intl/middleware', () => ({ default: () => () => new Response(null) }));

async function proxyGet(path: string) {
  const { NextRequest } = await import('next/server');
  const { default: proxy } = await import('@/proxy');
  return proxy(new NextRequest(`https://www.reno-stars.com${path}`));
}

const LEGACY: ReadonlyArray<readonly [string, string]> = [
  ['projects/commercial-renovation-skin-lab-granville', 'projects/vancouver-skin-lab-commercial-renovation'],
  ['projects/coquitlam-white-shaker-cabinets', 'projects/kitchen'],
  ['projects/richmond-kitchen-bathroom-remodel', 'projects/kitchen'],
  ['projects/surrey-home-renovation', 'projects/kitchen'],
  ['projects/bathroom-renovation-delta', 'projects/bathroom'],
  ['projects/richmond-bathroom-remodel', 'projects/bathroom'],
  ['projects/bathroom-vanity-west-vancouver', 'projects/bathroom'],
  ['projects/basement-renovation-vancouver', 'services/basement/vancouver'],
  ['projects/cabinet-refacing-richmond', 'services/cabinet/richmond'],
];
const LOCALES = ['en', 'zh', 'ja', 'pa'] as const;

describe('legacy project slugs → 301 (DI-17 follow-up)', () => {
  it.each(LEGACY)('/<loc>/%s/ → /<loc>/%s/ in en, zh, ja, pa via the real proxy', async (from, to) => {
    for (const loc of LOCALES) {
      const res = await proxyGet(`/${loc}/${from}/`);
      expect(res.status, `${loc} ${from}`).toBe(301);
      expect(new URL(res.headers.get('location')!).pathname).toBe(`/${loc}/${to}/`);
    }
  });

  it('the two WFH office-conversion slugs stay unredirected (no suitable target)', async () => {
    const { deadLinkRedirectPath } = await import('@/lib/seo/dead-link-redirects');
    for (const slug of [
      'projects/vancouver-wfh-glass-partition-office-conversion',
      'projects/vancouver-wfh-office-conversion-glass-partition-2026',
    ]) {
      for (const loc of LOCALES) expect(deadLinkRedirectPath(`/${loc}/${slug}/`), `${loc} ${slug}`).toBeNull();
      const res = await proxyGet(`/en/${slug}/`);
      expect(res.status, slug).not.toBe(301);
      expect(res.headers.get('location'), slug).toBeNull();
    }
  });

  it('an older #410 entry still 301s and /en/constructor/ still does not', async () => {
    const old = await proxyGet('/en/projects/minimalist-bathroom-renovation-in-richmond/');
    expect(old.status).toBe(301);
    expect(new URL(old.headers.get('location')!).pathname).toBe('/en/projects/minimalist-bathroom-renovation-richmond/');
    const proto = await proxyGet('/en/constructor/');
    expect(proto.status).not.toBe(301);
    expect(proto.headers.get('location')).toBeNull();
  });
});
