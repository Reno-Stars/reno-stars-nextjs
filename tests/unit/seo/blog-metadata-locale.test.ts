import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Regression: generateMetadata for a blog post threw on every locale that has
 * no `seo_keywords` entry — i.e. the 12 machine-translated locales, since only
 * `en` and `zh` are authored.
 *
 *     ...(post.seo_keywords?.[locale]?.split(',')… as string[])
 *
 * Optional chaining guards the `.split` CALL; it does not guard the SPREAD
 * around it. With no row for the locale the parenthesised expression is
 * `undefined`, and `[...undefined]` throws
 * `TypeError: (intermediate value) is not iterable`. The `as string[]` cast is
 * what let it past typecheck.
 *
 * A throw inside generateMetadata loses the WHOLE metadata object, so those
 * pages shipped with no <title>, no description, no canonical, no og/twitter —
 * and crucially without the `robots: noindex` that the same function computes
 * to keep untranslated bodies out of the index. Measured on production
 * 2026-08-25: /fr/blog/basement-renovations-port-moody/ had zero head metadata
 * while /en/blog/ of the same post had all of it.
 *
 * The assertions below are about metadata SURVIVING, not about keywords.
 */

const postWithEnOnlyKeywords = {
  slug: 'basement-renovations-port-moody',
  title: { en: 'Basement Renovation Port Moody', zh: '本拿比地下室装修' },
  excerpt: { en: 'An excerpt.', zh: '摘要。' },
  // Only en/zh bodies exist — this is what makes the other 12 locales noindex.
  content: { en: '<p>Body</p>', zh: '<p>正文</p>' },
  featured_image: 'https://example.com/hero.jpg',
  author: 'Reno Stars',
  published_at: new Date('2026-05-01T00:00:00Z'),
  created_at: new Date('2026-05-01T00:00:00Z'),
  // The shape that caused the throw: authored locales only.
  seo_keywords: { en: 'basement, port moody', zh: '地下室, 满地宝' },
  focus_keyword: { en: 'basement renovation port moody' },
};

vi.mock('@/lib/db/queries', () => ({
  getBlogPostBySlugFromDb: vi.fn(async () => postWithEnOnlyKeywords),
  getCompanyFromDb: vi.fn(async () => ({})),
  getServicesFromDb: vi.fn(async () => []),
  getServiceAreasFromDb: vi.fn(async () => []),
}));

vi.mock('@/navigation', () => ({
  Link: (props: { children?: unknown }) => props.children,
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({}),
  getPathname: () => '/',
}));

const { generateMetadata } = await import('@/app/[locale]/blog/[slug]/page');

const meta = (locale: string) =>
  generateMetadata({
    params: Promise.resolve({ locale, slug: postWithEnOnlyKeywords.slug }),
  } as Parameters<typeof generateMetadata>[0]);

// Every locale the site serves. en/zh are authored; the rest are machine
// translated and are exactly the ones that used to throw.
const MT_LOCALES = ['fr', 'ja', 'ko', 'es', 'ru', 'pa', 'hi', 'tl', 'vi', 'fa', 'ar', 'zh-Hant'];

describe('blog generateMetadata — locales with no seo_keywords row', () => {
  beforeEach(() => vi.clearAllMocks());

  it('still produces a title for an authored locale', async () => {
    const m = await meta('en');
    expect(m.title).toBeTruthy();
  });

  it.each(MT_LOCALES)('does not throw and still emits a title for %s', async (locale) => {
    const m = await meta(locale);
    expect(m.title).toBeTruthy();
    expect(m.description).toBeTruthy();
  });

  it.each(MT_LOCALES)('still emits robots noindex for %s (the untranslated-body guard)', async (locale) => {
    const m = await meta(locale);
    expect(m.robots).toMatchObject({ index: false });
  });

  it('leaves the authored locale indexable', async () => {
    const m = await meta('en');
    expect(m.robots).toBeUndefined();
  });
});
