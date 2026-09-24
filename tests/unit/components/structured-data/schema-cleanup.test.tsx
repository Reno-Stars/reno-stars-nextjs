/**
 * JSON-LD cleanup from the 2026-09-24 SEO audit.
 *
 * Every assertion here was red on origin/main before the fix:
 *   - HowTo markup was emitted by 4 cost guides, /workflow and project blocks
 *     (Google retired HowTo rich results in Sept 2023).
 *   - aggregateRating was repeated on Service / Project provider nodes on top
 *     of the layout Organization.
 *   - Google Maps reviews were marked up as `review[]` on the business
 *     (third-party reviews may not be marked up as the business's own).
 *   - Service `description` carried the raw ~7.7KB markdown long_description.
 *   - "Reno Stars Team" was typed as a Person.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import LocalBusinessSchema from '@/components/structured-data/LocalBusinessSchema';
import ServiceSchema from '@/components/structured-data/ServiceSchema';
import ProjectSchema from '@/components/structured-data/ProjectSchema';
import ArticleSchema from '@/components/structured-data/ArticleSchema';
import ArticleJsonLd from '@/components/structured-data/ArticleJsonLd';
import BreadcrumbSchema from '@/components/structured-data/BreadcrumbSchema';
import FAQSchema from '@/components/structured-data/FAQSchema';
import WebSiteSchema from '@/components/structured-data/WebSiteSchema';
import { getBaseUrl } from '@/lib/utils';
import type { Company, GoogleReview, ServiceArea, SocialLink } from '@/lib/types';

const ROOT = path.resolve(__dirname, '../../../..');

const company = {
  name: 'Reno Stars',
  logo: 'https://example.com/logo.png',
  phone: '778-960-7999',
  email: 'info@reno-stars.com',
  address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
  geo: { latitude: 49.16627, longitude: -123.13382 },
  liabilityCoverage: '$5M',
  yearsExperience: '20',
  teamSize: 17,
  tagline: 'Where Renovation Starts',
} as unknown as Company;

const socialLinks: SocialLink[] = [{ url: 'https://example.com/social', platform: 'facebook' } as unknown as SocialLink];
const areas: ServiceArea[] = [{ slug: 'vancouver', name: { en: 'Vancouver', zh: '温哥华' } } as unknown as ServiceArea];
const reviews: GoogleReview[] = [
  {
    authorName: 'Test User',
    authorUri: 'https://example.com/user',
    authorPhotoUri: '',
    rating: 5,
    text: 'Great work',
    languageCode: 'en',
    publishTime: '2025-01-01T00:00:00Z',
    relativePublishTime: '1 month ago',
  },
];

// Props the pages passed before this cleanup. Spread untyped so the test keeps
// proving the COMPONENT refuses them — a caller re-adding them must not bring
// back a second aggregateRating or the third-party review array.
const legacyRating = { googleRating: 4.9, googleReviewCount: 69 } as Record<string, unknown>;
const legacyReviews = { reviews, locale: 'en' } as Record<string, unknown>;

/** A long_description as authored in the services table: markdown, ~7.7KB. */
const MARKDOWN_LONG_DESCRIPTION = [
  '## Kitchen Renovation in [Vancouver](/en/areas/vancouver/)',
  '',
  '**Reno Stars** delivers *complete* kitchen renovations across Metro Vancouver — from `layout` changes to custom cabinetry.',
  '',
  '### What is included',
  '- Design consultation and 3D renderings',
  '- Permit handling with the [City of Vancouver](https://vancouver.ca/)',
  '* Cabinet, countertop and backsplash installation',
  '1. Electrical and plumbing upgrades',
  '',
  '> Every project is backed by our warranty.',
  '',
  '![Kitchen](https://example.com/k.jpg)',
  '',
  ...Array.from({ length: 60 }, (_, i) => `Paragraph ${i} with **bold** text and a [link](/en/projects/p-${i}/) about quartz countertops & islands.`),
].join('\n');

function extractJsonLd(html: string): Array<Record<string, unknown>> {
  const matches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) ?? [];
  return matches.map((script) => {
    const inner = script.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    return JSON.parse(inner.replace(/\\u003c/g, '<'));
  });
}

/** Every object node anywhere in the JSON-LD graph. */
function allNodes(roots: unknown[]): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  const visit = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (v && typeof v === 'object') {
      out.push(v as Record<string, unknown>);
      Object.values(v as Record<string, unknown>).forEach(visit);
    }
  };
  roots.forEach(visit);
  return out;
}

function typesOf(node: Record<string, unknown>): string[] {
  const t = node['@type'];
  return Array.isArray(t) ? (t as string[]) : typeof t === 'string' ? [t] : [];
}

const layout = (
  <>
    <WebSiteSchema locale="en" />
    <LocalBusinessSchema company={company} socialLinks={socialLinks} areas={areas} googleRating={4.9} googleReviewCount={69} {...legacyReviews} />
  </>
);

function walkSource(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walkSource(p, acc);
    else if (/\.(ts|tsx)$/.test(name)) acc.push(p);
  }
  return acc;
}

describe('HowTo markup is gone (deprecated by Google, Sept 2023)', () => {
  it('no source file emits a HowTo JSON-LD node or mounts HowToSchema', () => {
    const offenders: string[] = [];
    for (const dir of ['app', 'components', 'lib']) {
      for (const file of walkSource(path.join(ROOT, dir))) {
        const src = readFileSync(file, 'utf8');
        if (/['"]@type['"]\s*:\s*['"]HowTo/.test(src) || /\bHowToSchema\b/.test(src)) {
          offenders.push(path.relative(ROOT, file));
        }
      }
    }
    expect(offenders).toEqual([]);
    expect(existsSync(path.join(ROOT, 'components/structured-data/HowToSchema.tsx'))).toBe(false);
  });
});

describe('aggregateRating lives only on the layout Organization', () => {
  it('service page composition (layout + Service + FAQ + Breadcrumb) has exactly one aggregateRating, on /#organization', () => {
    const html = renderToStaticMarkup(
      <>
        {layout}
        <BreadcrumbSchema items={[{ name: 'Home', url: '/en/' }]} />
        <ServiceSchema company={company} serviceName="Kitchen Renovation" url="/en/services/kitchen/" areaServed={['Vancouver']} {...legacyRating} />
        <FAQSchema faqs={[{ question: 'Q', answer: 'A' }]} />
      </>,
    );
    const rated = allNodes(extractJsonLd(html)).filter((n) => 'aggregateRating' in n);
    expect(rated).toHaveLength(1);
    expect(rated[0]['@id']).toMatch(/\/#organization$/);
  });

  it('project page composition (layout + Project + Service) has exactly one aggregateRating', () => {
    const html = renderToStaticMarkup(
      <>
        {layout}
        <ProjectSchema company={company} name="P" description="d" image="https://example.com/i.jpg" url="/en/projects/p/" {...legacyRating} />
        <ServiceSchema company={company} serviceName="Kitchen" url="/en/projects/p/" {...legacyRating} />
      </>,
    );
    expect(allNodes(extractJsonLd(html)).filter((n) => 'aggregateRating' in n)).toHaveLength(1);
  });

  it('Service provider references the main business by @id instead of redeclaring it', () => {
    const [service] = extractJsonLd(renderToStaticMarkup(
      <ServiceSchema company={company} serviceName="Kitchen" url="/en/services/kitchen/" />,
    ));
    expect(service.provider).toEqual({ '@id': `${getBaseUrl()}/#organization` });
  });
});

describe('Google Maps reviews are not marked up as the business\'s own reviews', () => {
  it('LocalBusinessSchema emits no review[] even when reviews are passed', () => {
    const [, org] = extractJsonLd(renderToStaticMarkup(layout));
    expect(org['@id']).toMatch(/\/#organization$/);
    expect(org).not.toHaveProperty('review');
    expect(org.aggregateRating).toBeDefined();
    expect(allNodes([org]).some((n) => typesOf(n).includes('Review'))).toBe(false);
  });
});

describe('Service description is plain text', () => {
  it('strips markdown from long_description and truncates at a word boundary (<= 320 chars)', () => {
    const [service] = extractJsonLd(renderToStaticMarkup(
      <ServiceSchema company={company} serviceName="Kitchen" serviceDescription={MARKDOWN_LONG_DESCRIPTION} url="/en/services/kitchen/" />,
    ));
    const d = service.description as string;
    expect(typeof d).toBe('string');
    expect(d.length).toBeGreaterThan(100);
    expect(d.length).toBeLessThanOrEqual(320);
    expect(d).not.toMatch(/#/);
    expect(d).not.toMatch(/\*\*|__|`/);
    expect(d).not.toMatch(/\]\(|!\[|\[/);
    expect(d).not.toMatch(/(^|\n)\s*([-*>]|\d+\.)\s/);
    expect(d).not.toMatch(/\n/);
    expect(d.startsWith('Kitchen Renovation in Vancouver. Reno Stars delivers complete kitchen')).toBe(true);
    // Truncated at a word boundary: ends in an ellipsis directly after a whole word.
    expect(d).toMatch(/\S…$/);
    expect(d).toContain('Reno Stars');
  });

  it('leaves a short plain description untouched', () => {
    const [service] = extractJsonLd(renderToStaticMarkup(
      <ServiceSchema company={company} serviceName="Kitchen" serviceDescription="Kitchen renovations in Vancouver." url="/en/services/kitchen/" />,
    ));
    expect(service.description).toBe('Kitchen renovations in Vancouver.');
  });
});

describe('ArticleSchema author', () => {
  const render = (authorName?: string) => extractJsonLd(renderToStaticMarkup(
    <ArticleSchema company={company} headline="H" description="d" url="/en/guides/x/" authorName={authorName} />,
  ))[0];

  it('types the company team as the Organization (by @id), never a Person', () => {
    for (const name of ['Reno Stars Team', 'reno stars team', 'Reno Stars', undefined]) {
      const author = render(name).author as Record<string, unknown>;
      expect(author['@type'], `author for ${String(name)}`).not.toBe('Person');
      expect(author['@id']).toBe(`${getBaseUrl()}/#organization`);
    }
  });

  it('ArticleJsonLd (blog posts) applies the same rule', () => {
    const [team] = extractJsonLd(renderToStaticMarkup(
      <ArticleJsonLd company={company} headline="H" description="d" url="/en/blog/x/" authorName="Reno Stars Team" />,
    ));
    expect(team.author).toEqual({ '@id': `${getBaseUrl()}/#organization` });
    const [person] = extractJsonLd(renderToStaticMarkup(
      <ArticleJsonLd company={company} headline="H" description="d" url="/en/blog/x/" authorName="Hongming Wang" />,
    ));
    expect(person.author).toEqual({ '@type': 'Person', name: 'Hongming Wang' });
  });

  it('keeps a real named author as a Person', () => {
    expect(render('Hongming Wang').author).toEqual({ '@type': 'Person', name: 'Hongming Wang' });
  });
});
