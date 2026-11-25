import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';

/**
 * DI-19 (2026-11-24): the blog CLIENT component used to receive the whole
 * BlogPost — 14 locales of body copy — and every client prop is serialised into
 * the page's RSC payload (~470 KB on /en/blog/renovate-vs-move-vancouver-2026/).
 * It now receives ONE locale (lib/data/blog-post-view.ts).
 */

const LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr'] as const;
const per = (fn: (l: string) => string) => Object.fromEntries(LOCALES.map((l) => [l, fn(l)]));

const POST = {
  slug: 'renovate-vs-move-vancouver-2026',
  title: per((l) => `TITLE-${l}`),
  excerpt: per((l) => `EXCERPT-${l}`),
  content: per((l) => `<p>BODY-${l}</p>`),
  featured_image_alt: per((l) => `ALT-${l}`),
  meta_title: per((l) => `META-${l}`),
  meta_description: per((l) => `DESC-${l}`),
  seo_keywords: { en: 'renovate vs move', zh: '装修还是搬家' },
  featured_image: 'https://example.com/hero.jpg',
  author: 'Reno Stars Team',
  published_at: new Date('2026-04-17T20:46:38.633Z'),
  created_at: new Date('2026-04-17T20:46:38.634Z'),
  updated_at: new Date('2026-08-07T01:04:24.603Z'),
  content_updated_at: new Date('2026-06-01T00:00:00.000Z'),
};

vi.mock('@/lib/db/queries', () => ({
  getBlogPostBySlugFromDb: vi.fn(async () => POST),
  getCompanyFromDb: vi.fn(async () => ({ name: 'Reno Stars' })),
  getServicesFromDb: vi.fn(async () => []),
  getServiceAreasFromDb: vi.fn(async () => []),
}));
vi.mock('@/lib/google-reviews', () => ({ getGoogleReviews: async () => ({ rating: 5, userRatingCount: 80 }) }));
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (k: string) => k,
  setRequestLocale: () => {},
}));
vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
vi.mock('@/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, ...p }: any) => React.createElement('a', p, children),
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({}),
  getPathname: () => '/',
}));
vi.mock('@/components/share/ShareBar', () => ({ default: () => null }));
vi.mock('@/components/OptimizedImage', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (p: any) => React.createElement('img', { alt: p.alt, src: p.src }),
}));

const OTHER = LOCALES.filter((l) => l !== 'en');

describe('toBlogPostView — one locale only', () => {
  it('carries the requested locale and nothing from the other 13', async () => {
    const { toBlogPostView } = await import('@/lib/data/blog-post-view');
    const view = toBlogPostView(POST as never, 'en');
    const json = JSON.stringify(view);
    expect(view.title).toBe('TITLE-en');
    expect(view.content).toBe('<p>BODY-en</p>');
    expect(view.excerpt).toBe('EXCERPT-en');
    expect(view.featured_image_alt).toBe('ALT-en');
    for (const l of OTHER) expect(json, l).not.toContain(`BODY-${l}`);
    for (const l of OTHER) expect(json, l).not.toContain(`TITLE-${l}`);
    // Fields the component never rendered are not shipped at all.
    expect(json).not.toMatch(/META-|DESC-|seo_keywords|meta_title/);
    expect(JSON.stringify(toBlogPostView(POST as never, 'zh'))).toContain('BODY-zh');
  });

  it('resolves the dates exactly as the component used to (resolveBlogDates)', async () => {
    const { toBlogPostView } = await import('@/lib/data/blog-post-view');
    const { resolveBlogDates } = await import('@/lib/blog-dates');
    const view = toBlogPostView(POST as never, 'en');
    const { datePublished, dateModified } = resolveBlogDates(POST as never);
    expect(view.datePublished).toBe(datePublished);
    expect(view.dateModified).toBe(dateModified);
    expect(view.featured_image).toBe(POST.featured_image);
    expect(view.author).toBe(POST.author);
  });
});

describe('blog route hands the client component a single-locale post', () => {
  /** Depth-first search of the returned element tree for BlogPostPage. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function findProps(node: any, type: unknown): any {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) { for (const n of node) { const r = findProps(n, type); if (r) return r; } return null; }
    if (node.type === type) return node.props;
    return findProps(node.props?.children, type);
  }

  it('the serialised BlogPostPage props contain one language', async () => {
    const { default: Page } = await import('@/app/[locale]/blog/[slug]/page');
    const { default: BlogPostPage } = await import('@/components/pages/BlogPostPage');
    const tree = await Page({ params: Promise.resolve({ locale: 'en', slug: POST.slug }) });
    const props = findProps(tree, BlogPostPage);
    expect(props).toBeTruthy();
    const json = JSON.stringify(props);
    expect(json).toContain('BODY-en');
    for (const l of OTHER) expect(json, l).not.toContain(`BODY-${l}`);
    expect(json).not.toMatch(/META-|DESC-/);
  });

  it('canonical and hreflang are unchanged (generateMetadata untouched)', async () => {
    const { generateMetadata } = await import('@/app/[locale]/blog/[slug]/page');
    const m = await generateMetadata({ params: Promise.resolve({ locale: 'en', slug: POST.slug }) } as never);
    expect(String(m.alternates?.canonical)).toMatch(/\/en\/blog\/renovate-vs-move-vancouver-2026\/$/);
    // Every locale has a native body here, so all 14 + x-default are alternates.
    expect(Object.keys(m.alternates?.languages ?? {}).sort()).toEqual([...LOCALES, 'x-default'].sort());
  });
});

describe('BlogPostPage still renders the same copy from the view', () => {
  it('title, body, author and the published / updated dates', async () => {
    const { toBlogPostView } = await import('@/lib/data/blog-post-view');
    const { default: BlogPostPage } = await import('@/components/pages/BlogPostPage');
    const html = renderToStaticMarkup(
      <BlogPostPage
        locale="en"
        post={toBlogPostView(POST as never, 'en')}
        company={{ name: 'Reno Stars' } as never}
        share={{ url: 'https://www.reno-stars.com/en/blog/x/', title: 't' }}
      />,
    );
    expect(html).toContain('TITLE-en');
    expect(html).toContain('BODY-en');
    expect(html).toContain('Reno Stars Team');
    expect(html).toContain('dateTime="2026-04-17T20:46:38.633Z"');
    expect(html).toContain('dateTime="2026-06-01T00:00:00.000Z"');
    for (const l of OTHER) expect(html, l).not.toContain(`BODY-${l}`);
  });
});
