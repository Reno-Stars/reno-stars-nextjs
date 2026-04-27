import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LocalBusinessSchema from '@/components/structured-data/LocalBusinessSchema';
import LocalBusinessAreaSchema from '@/components/structured-data/LocalBusinessAreaSchema';
import WebSiteSchema from '@/components/structured-data/WebSiteSchema';
import BreadcrumbSchema from '@/components/structured-data/BreadcrumbSchema';
import FAQSchema from '@/components/structured-data/FAQSchema';
import ServiceSchema from '@/components/structured-data/ServiceSchema';
import ProjectSchema from '@/components/structured-data/ProjectSchema';
import ArticleSchema from '@/components/structured-data/ArticleSchema';
import ContactPageSchema from '@/components/structured-data/ContactPageSchema';
import HowToSchema from '@/components/structured-data/HowToSchema';
import ProjectCategorySchema from '@/components/structured-data/ProjectCategorySchema';
import type { Company, GoogleReview, ServiceArea, SocialLink } from '@/lib/types';

const company: Company = {
  name: 'Reno Stars',
  logo: 'https://example.com/logo.png',
  phone: '778-960-7999',
  email: 'info@reno-stars.com',
  address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
  geo: { latitude: 49.16627, longitude: -123.13382 },
  liabilityCoverage: '$5M',
  foundingYear: 2007,
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

/** Extract every parsed JSON-LD object from a rendered HTML string. */
function extractJsonLd(html: string): unknown[] {
  const matches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) ?? [];
  return matches.map((script) => {
    const inner = script.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    return JSON.parse(inner.replace(/\\u003c/g, '<'));
  });
}

/** Walk every node and collect (@id, @type) pairs that share an @id across distinct nodes. */
function collectIdConflicts(nodes: unknown[]): Map<string, Set<string>> {
  const idToTypes = new Map<string, Set<string>>();
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const id = typeof obj['@id'] === 'string' ? (obj['@id'] as string) : null;
      const type = typeof obj['@type'] === 'string' ? (obj['@type'] as string) : null;
      if (id && type) {
        if (!idToTypes.has(id)) idToTypes.set(id, new Set());
        idToTypes.get(id)!.add(type);
      }
      Object.values(obj).forEach(visit);
    }
  };
  nodes.forEach(visit);
  return idToTypes;
}

/** Render a tree and return all top-level JSON-LD nodes. */
function renderAndExtract(tree: React.ReactElement): unknown[] {
  return extractJsonLd(renderToStaticMarkup(tree));
}

describe('structured-data: no duplicate @id collisions', () => {
  it('homepage layout (LocalBusinessSchema + WebSiteSchema + BreadcrumbSchema + FAQSchema) has unique @ids', () => {
    const tree = (
      <>
        <WebSiteSchema locale="en" />
        <LocalBusinessSchema
          company={company}
          socialLinks={socialLinks}
          areas={areas}
          googleRating={5}
          googleReviewCount={69}
          reviews={reviews}
        />
        <BreadcrumbSchema items={[{ name: 'Home', url: '/en/' }]} />
        <FAQSchema faqs={[{ question: 'Q', answer: 'A' }]} />
      </>
    );
    const nodes = renderAndExtract(tree);
    const idMap = collectIdConflicts(nodes);
    for (const [id, types] of idMap) {
      expect(types.size, `@id "${id}" is reused by multiple @types: ${[...types].join(', ')}`).toBe(1);
    }
  });

  it('emits at most one aggregateRating per @id', () => {
    const tree = (
      <LocalBusinessSchema
        company={company}
        socialLinks={socialLinks}
        areas={areas}
        googleRating={5}
        googleReviewCount={69}
        reviews={reviews}
      />
    );
    const html = renderToStaticMarkup(tree);
    const aggregateCount = (html.match(/"aggregateRating"/g) ?? []).length;
    expect(aggregateCount).toBe(1);
  });

  it('LocalBusinessSchema embeds Google reviews under the same organization @id', () => {
    const html = renderToStaticMarkup(
      <LocalBusinessSchema
        company={company}
        socialLinks={socialLinks}
        areas={areas}
        googleRating={5}
        googleReviewCount={69}
        reviews={reviews}
      />,
    );
    const [node] = extractJsonLd(html) as [Record<string, unknown>];
    expect(node['@id']).toMatch(/#organization$/);
    expect(Array.isArray(node.review)).toBe(true);
    expect((node.review as unknown[]).length).toBe(1);
    expect(node.aggregateRating).toBeDefined();
  });

  it('area page (LocalBusinessAreaSchema) uses a distinct @id from the layout organization', () => {
    const layoutTree = (
      <LocalBusinessSchema
        company={company}
        socialLinks={socialLinks}
        areas={areas}
        googleRating={5}
        googleReviewCount={69}
      />
    );
    const areaTree = (
      <LocalBusinessAreaSchema
        company={company}
        areaName="Vancouver"
        areaSlug="vancouver"
        locale="en"
        services={['Kitchen Renovation']}
        googleRating={5}
        googleReviewCount={69}
      />
    );
    const nodes = [...renderAndExtract(layoutTree), ...renderAndExtract(areaTree)];
    const ids = nodes
      .map((n) => (n as Record<string, unknown>)['@id'])
      .filter((v): v is string => typeof v === 'string');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every page-level schema component renders without colliding with /#organization', () => {
    const layoutTree = (
      <LocalBusinessSchema
        company={company}
        socialLinks={socialLinks}
        areas={areas}
        googleRating={5}
        googleReviewCount={69}
      />
    );
    const layoutNodes = renderAndExtract(layoutTree);
    const orgId = (layoutNodes[0] as Record<string, unknown>)['@id'] as string;

    const pageSchemas: React.ReactElement[] = [
      <BreadcrumbSchema key="b" items={[{ name: 'Home', url: '/' }]} />,
      <FAQSchema key="f" faqs={[{ question: 'Q', answer: 'A' }]} />,
      <ServiceSchema key="s" company={company} serviceName="Kitchen" serviceDescription="desc" url="/en/services/kitchen/" />,
      <ProjectSchema key="p" company={company} name="Project" description="desc" image="https://example.com/i.jpg" url="/en/projects/example/" />,
      <ArticleSchema key="a" company={company} headline="Title" description="desc" datePublished="2025-01-01" image="https://example.com/i.jpg" url="/en/blog/x/" />,
      <ContactPageSchema key="c" company={company} areaNames={['Vancouver']} locale="en" />,
      <HowToSchema key="h" name="How" description="desc" steps={[{ name: 'step', text: 'do' }]} />,
      <ProjectCategorySchema key="pc" categoryName="Kitchen" locale="en" projects={[{ slug: 'x', title: { en: 'X', zh: 'X' } }]} />,
      <LocalBusinessAreaSchema key="lba" company={company} areaName="Vancouver" areaSlug="vancouver" locale="en" services={['Kitchen']} />,
    ];

    for (const el of pageSchemas) {
      const nodes = renderAndExtract(el);
      const ids = collectIdConflicts(nodes);
      expect(ids.has(orgId), `${el.type.toString()} must not declare @id="${orgId}"`).toBe(false);
    }
  });
});
