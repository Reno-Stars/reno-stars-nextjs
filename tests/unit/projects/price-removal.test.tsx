import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Project-area price removal, part 1 (Ryan 11-24 14:41, via Captain).
 * The /projects/ list, category, detail and whole-house pages publish no
 * prices: no Budget cell, no budget_range in the client payload, no JSON-LD
 * offers, no budget filter, and the 3 budget-tier landing pages 301 away.
 */

vi.mock('@/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({}),
  getPathname: () => '/',
}));
vi.mock('@/components/OptimizedImage', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => React.createElement('img', { alt: props.alt, src: props.src }),
}));
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
  setRequestLocale: () => {},
}));
// The real next-intl middleware pulls Next runtime internals that do not
// resolve under vitest; the redirect under test returns before it is reached.
vi.mock('next-intl/middleware', () => ({ default: () => () => new Response(null) }));
vi.mock('@/lib/db/queries', () => ({
  getCategoriesLocalized: async () => [{ serviceType: 'kitchen', en: 'Kitchen', zh: '厨房' }],
}));

import { locales } from '@/i18n/config';
import { retiredBudgetRedirectPath, RETIRED_BUDGET_TIERS } from '@/lib/projects/retired-budget-pages';
import { omitBudget, omitSiteBudget } from '@/lib/projects/omit-budget';
import { slimProjectForListing, slimSiteForListing } from '@/lib/data/listing-payload';
import ProjectSchema from '@/components/structured-data/ProjectSchema';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import type { Company, Project, SiteWithProjects } from '@/lib/types';

const BUDGET = '$25,000 - $27,000';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    slug: 'kitchen-renovation-coquitlam',
    title: { en: 'Kitchen Renovation', zh: '厨房装修' },
    description: { en: 'A kitchen.', zh: '厨房。' },
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Coquitlam',
    images: [],
    hero_image: '',
    budget_range: BUDGET,
    duration: { en: '5-6 weeks', zh: '5-6周' },
    ...overrides,
  } as Project;
}

const company = {
  name: 'Reno Stars',
  phone: '778-960-7999',
  email: 'info@example.com',
  address: '1 Test St',
} as unknown as Company;

describe('budget landing pages are retired (301 → /{locale}/projects/)', () => {
  it('maps all 42 locale × tier pages, with or without the trailing slash', () => {
    let n = 0;
    for (const l of locales) {
      for (const tier of RETIRED_BUDGET_TIERS) {
        expect(retiredBudgetRedirectPath(`/${l}/projects/budget/${tier}/`)).toBe(`/${l}/projects/`);
        expect(retiredBudgetRedirectPath(`/${l}/projects/budget/${tier}`)).toBe(`/${l}/projects/`);
        n++;
      }
    }
    expect(n).toBe(42);
  });

  it('leaves every other path alone', () => {
    for (const p of [
      '/en/projects/',
      '/en/projects/kitchen/',
      '/en/projects/budget-friendly-condo-renovation-richmond/',
      '/en/projects/budget/other-tier/',
      '/xx/projects/budget/under-30k/',
      '/en/services/kitchen/richmond/',
    ]) {
      expect(retiredBudgetRedirectPath(p)).toBeNull();
    }
  });

  it('proxy answers a real 301 to the locale listing', async () => {
    const { NextRequest } = await import('next/server');
    const { default: proxy } = await import('@/proxy');
    for (const path of ['/en/projects/budget/under-30k/', '/zh-Hant/projects/budget/60k-plus/']) {
      const res = proxy(new NextRequest(`https://www.reno-stars.com${path}`));
      expect(res.status).toBe(301);
      const loc = new URL(res.headers.get('location')!);
      expect(loc.pathname).toBe(`/${path.split('/')[1]}/projects/`);
    }
  });

  it('the project-hubs sitemap no longer lists them', () => {
    const src = readFileSync('lib/sitemap/sections.ts', 'utf8');
    expect(src).not.toMatch(/projects\/budget\//);
  });
});

describe('a legacy ?budget= link is ignored, not an error', () => {
  it('generateMetadata drops it from title, description and canonical', async () => {
    const { generateMetadata } = await import('@/app/[locale]/projects/page');
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
      searchParams: Promise.resolve({ budget: 'under-10k' } as Record<string, string>),
    });
    const all = JSON.stringify(meta);
    expect(all).not.toMatch(/budget/i);
    expect(all).not.toMatch(/\$\d/);
    expect(String(meta.alternates?.canonical)).toMatch(/\/en\/projects\/$/);
  });

  it('the listing page source no longer reads the param or renders the filter', () => {
    const page = readFileSync('app/[locale]/projects/page.tsx', 'utf8');
    expect(page).not.toMatch(/sp\.budget|initialBudget|budget-presets/);
    const grid = readFileSync('components/pages/ProjectsPage.tsx', 'utf8');
    expect(grid).not.toMatch(/BudgetRangeSlider|BUDGET_PRESETS|\?budget=|budget_range|totalBudget/);
    // "Researching specific costs?" keeps its links but carries no amounts.
    expect(grid).not.toMatch(/\$\d/);
    expect(grid).toContain('Vanity cost guide');
  });
});

describe('detail pages render no Budget cell', () => {
  it('ProjectDetailPage shows duration but no budget, even if one is passed', () => {
    const html = renderToStaticMarkup(
      <ProjectDetailPage
        locale="en"
        project={makeProject()}
        relatedProjects={[]}
        company={company}
        share={{ url: 'https://www.reno-stars.com/en/projects/x/', title: 'x' }}
      />,
    );
    expect(html).not.toContain(BUDGET);
    expect(html).not.toContain('modal.budget');
    expect(html).toContain('5-6 weeks');
  });

  it('SiteDetailPage source has no budget cell or child-row amount', () => {
    const src = readFileSync('components/pages/SiteDetailPage.tsx', 'utf8');
    expect(src).not.toMatch(/budget_range|totalBudget/);
  });
});

describe('no budget_range reaches the client from the projects routes', () => {
  it('omitBudget removes the key (not just its value)', () => {
    const out = omitBudget(makeProject());
    expect('budget_range' in out).toBe(false);
    expect(out.slug).toBe('kitchen-renovation-coquitlam');
  });

  it('omitSiteBudget strips the site and every child project', () => {
    const site = {
      slug: 's',
      budget_range: '$240,000 - $270,000',
      projects: [makeProject(), makeProject({ slug: 'b' })],
    } as unknown as SiteWithProjects;
    const out = omitSiteBudget(site);
    expect(JSON.stringify(out)).not.toContain('budget_range');
  });

  it('listing payloads drop it for projects, sites and child rows', () => {
    const project = slimProjectForListing(makeProject(), 'en');
    expect('budget_range' in project).toBe(false);
    const site = slimSiteForListing(
      {
        slug: 's',
        title: { en: 'Site' },
        description: { en: 'd' },
        budget_range: '$240,000 - $270,000',
        projects: [makeProject()],
        aggregated: { allImages: [], allServiceScopes: { en: [] }, allExternalProducts: [] },
      } as unknown as SiteWithProjects,
      'en',
    );
    expect(JSON.stringify(site)).not.toContain('budget_range');
  });

  it('the [slug] route wraps every client hand-off in omitBudget', () => {
    const src = readFileSync('app/[locale]/projects/[slug]/page.tsx', 'utf8');
    expect(src).toContain('projects={allProjects.map(omitBudget)}');
    expect(src).toContain('project={omitBudget(project)}');
    expect(src).toContain('omitBudget(getLocalizedProject(p, locale as Locale))');
    expect(src).toContain('site={omitSiteBudget(localizedSite)}');
    expect(src).not.toMatch(/budgetRange=/);
  });
});

describe('project JSON-LD has no offers', () => {
  it('emits no offers / priceSpecification', () => {
    const html = renderToStaticMarkup(
      <ProjectSchema
        company={company}
        name="Kitchen Renovation"
        description="A kitchen."
        image="https://example.com/i.jpg"
        url="/en/projects/kitchen-renovation-coquitlam/"
        duration="5-6 weeks"
        location="Coquitlam"
        serviceType="Kitchen"
      />,
    );
    expect(html).not.toMatch(/offers|priceSpecification|PriceSpecification|priceCurrency/);
    expect(html).toContain('5-6 weeks');
  });
});
