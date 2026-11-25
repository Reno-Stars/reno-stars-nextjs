import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * DI-17 (2026-11-24): internal links that 404. This file covers the CODE-side
 * fixes; content-side (DB) links are covered by the 301s in
 * tests/unit/seo/internal-404-redirects.test.ts.
 */

vi.mock('@/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({}),
  getPathname: () => '/',
}));
vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
vi.mock('@/components/ProjectCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href }: any) => React.createElement('a', { href, 'data-card': '1' }),
}));
vi.mock('@/components/ProjectModal', () => ({ default: () => null }));

const nav = vi.hoisted(() => ({
  permanentRedirect: vi.fn((to: string) => { throw new Error(`REDIRECT ${to}`); }),
  notFound: vi.fn(() => { throw new Error('NOT_FOUND'); }),
}));
vi.mock('next/navigation', () => nav);
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (k: string) => k,
  setRequestLocale: () => {},
}));
vi.mock('@/components/pages/ProjectCategoryPage', () => ({ default: () => null }));
vi.mock('@/components/pages/ProjectDetailPage', () => ({ default: () => null }));
vi.mock('@/components/pages/SiteDetailPage', () => ({ default: () => null }));
vi.mock('@/components/ClientMessages', () => ({ default: () => null }));
vi.mock('@/lib/db/queries', () => ({
  getCompanyFromDb: async () => ({}),
  getProjectsFromDb: async () => [{ slug: 'kitchen-one', service_type: 'kitchen', title: { en: 'K', zh: 'K' } }],
  getSiteBySlugFromDb: async () => null,
  getServiceTypeToCategory: async () => ({}),
  getCategoriesLocalized: async () => [{ serviceType: 'kitchen', en: 'Kitchen', zh: '厨房' }],
  getCategorySlugs: async () => ['kitchen'],
  getServiceBlocksBySlug: async () => [],
  getProjectReviews: async () => [],
  getServicesFromDb: async () => [{ slug: 'kitchen' }, { slug: 'heat-pump-hvac' }, { slug: 'critical-load-panel' }, { slug: 'realtor' }],
}));

beforeEach(() => { nav.permanentRedirect.mockClear(); nav.notFound.mockClear(); });

/** Every .tsx under components/ and app/. */
function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return n === 'node_modules' ? [] : tsxFiles(p);
    return p.endsWith('.tsx') ? [p] : [];
  });
}

describe('locale-aware Link never gets a second locale prefix', () => {
  // `Link` from @/navigation prefixes the locale itself, so `/${locale}/…` on it
  // renders /<loc>/<loc>/… — a 404. Found live on /projects/ (vanity, bathtub,
  // toilet cost links, all 14 locales) and the kitchen cost guide.
  it('no <Link href={`/${locale}…`}> and no href: `/${locale}…` data in Link files', () => {
    const offenders: string[] = [];
    for (const f of [...tsxFiles('components'), ...tsxFiles('app')]) {
      const src = readFileSync(f, 'utf8');
      if (!/import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*'@\/navigation'/.test(src)) continue;
      for (const m of src.matchAll(/href=\{`\/\$\{locale\}/g)) {
        const before = src.slice(0, m.index);
        const tag = before.slice(before.lastIndexOf('<')).match(/^<(\w+)/)?.[1];
        if (tag === 'Link') offenders.push(`${f}: <Link href={\`/\${locale}…`);
      }
      const dataHrefs = src.match(/href:\s*`\/\$\{locale\}\//g) ?? [];
      for (let i = 0; i < dataHrefs.length; i++) offenders.push(`${f}: href: \`/\${locale}/…\``);
    }
    expect(offenders).toEqual([]);
  });
});

describe('"View all projects" never links to a missing category', () => {
  it('RelatedProjectsSection: no categorySlug → the /projects listing', async () => {
    const { default: RelatedProjectsSection } = await import('@/components/RelatedProjectsSection');
    const project = { slug: 'p1', service_type: 'heat-pump-hvac' } as never;
    const withCat = renderToStaticMarkup(<RelatedProjectsSection heading="h" projects={[project]} categorySlug="kitchen" />);
    expect(withCat).toContain('href="/projects/kitchen"');
    const noCat = renderToStaticMarkup(<RelatedProjectsSection heading="h" projects={[project]} />);
    expect(noCat).toContain('href="/projects"');
    expect(noCat).not.toContain('/projects/heat-pump-hvac');
  });

  it('the service hub passes a category only when /projects/<service>/ exists', () => {
    const page = readFileSync('components/pages/ServiceDetailPage.tsx', 'utf8');
    expect(page).toContain('categorySlug={hasProjectCategory ? serviceSlug : undefined}');
    const route = readFileSync('app/[locale]/services/[service-slug]/page.tsx', 'utf8');
    expect(route).toContain('hasProjectCategory={(await getCategorySlugs()).includes(serviceSlug)}');
  });

  it('TEST A template is untouched: ServiceLocationPage still passes categorySlug={serviceSlug}', () => {
    // Its 404 (/projects/heat-pump-hvac/ etc.) is fixed by the route-level
    // redirect below instead, so the 14 test-A pages' HTML does not change.
    const src = readFileSync('components/pages/ServiceLocationPage.tsx', 'utf8');
    expect(src).toContain('categorySlug={serviceSlug}');
  });
});

describe('/projects/<service>/ for a service with no category → the service page', () => {
  const callPage = async (slug: string, locale = 'en') => {
    const { default: Page } = await import('@/app/[locale]/projects/[slug]/page');
    return Page({ params: Promise.resolve({ locale, slug }) });
  };

  it('serviceRedirectFor', async () => {
    const { serviceRedirectFor } = await import('@/lib/projects/service-redirect');
    const services = [{ slug: 'heat-pump-hvac' }, { slug: 'kitchen' }];
    expect(serviceRedirectFor('heat-pump-hvac', services)).toBe('heat-pump-hvac');
    expect(serviceRedirectFor('no-such-thing', services)).toBeNull();
  });

  it.each(['heat-pump-hvac', 'critical-load-panel', 'realtor'])('%s redirects permanently (every locale)', async (slug) => {
    for (const locale of ['en', 'zh', 'ja']) {
      await expect(callPage(slug, locale)).rejects.toThrow(`REDIRECT /${locale}/services/${slug}/`);
    }
  });

  it('a real category or project still wins; an unknown slug still 404s', async () => {
    // Category / project branches render (their props are thin mocks here, so
    // only assert they never reach the redirect or the 404).
    for (const slug of ['kitchen', 'kitchen-one']) {
      const err = await callPage(slug).then(() => null, (e: Error) => e);
      expect(String(err?.message ?? '')).not.toMatch(/REDIRECT|NOT_FOUND/);
    }
    await expect(callPage('no-such-thing')).rejects.toThrow('NOT_FOUND');
    expect(nav.permanentRedirect).not.toHaveBeenCalled();
  });
});

describe('service hubs list REAL projects, not the legacy static list', () => {
  // lib/data/projects.ts holds a pre-DB static list whose slugs
  // (coquitlam-white-shaker-cabinets, cabinet-refacing-richmond, …) no longer
  // exist; the hub's "Our Projects" cards linked there in all 14 locales.
  it('ServiceDetailPage takes relatedProjects from the route; the route reads published DB rows', () => {
    const page = readFileSync('components/pages/ServiceDetailPage.tsx', 'utf8');
    expect(page).not.toMatch(/getAllProjectsLocalized/);
    expect(page).toMatch(/relatedProjects = \[\]/);
    const route = readFileSync('app/[locale]/services/[service-slug]/page.tsx', 'utf8');
    expect(route).toMatch(/getProjectsFromDb\(\)/);
    expect(route).toMatch(/\.filter\(\(p\) => p\.service_type === serviceSlug\)/);
    // Price handling on hubs is out of this PR's scope (DI-15): no new filter here.
    expect(route).not.toMatch(/strip-prices|omit-budget/);
    expect(route).toContain('relatedProjects={relatedProjects}');
  });
});

describe('no code links to the nonexistent Port Moody home guide', () => {
  it('only the TEST A template (ServiceLocationPage, left untouched) still names it; the 301 covers it', () => {
    const hits = [...tsxFiles('components'), ...tsxFiles('app')]
      .concat(['components/areas/areaPageData.ts', 'components/services/serviceDetailLinks.ts'])
      .filter((f) => readFileSync(f, 'utf8').includes('port-moody-home-renovation-guide-2026'));
    expect(hits).toEqual(['components/pages/ServiceLocationPage.tsx']);
  });
});
