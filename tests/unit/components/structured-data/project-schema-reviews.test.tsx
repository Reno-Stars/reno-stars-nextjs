import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ProjectSchema from '@/components/structured-data/ProjectSchema';
import type { Company } from '@/lib/types';
import type { ProjectReviewDisplay } from '@/lib/project-reviews';

const company = {
  name: 'Reno Stars',
  phone: '778-960-7999',
  // `address` is required on Company and is what ProjectSchema's provider
  // node parses into PostalAddress sub-fields. Kept in this partial fixture
  // because omitting it made the component throw rather than fail a claim.
  address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
} as unknown as Company;

const reviews: ProjectReviewDisplay[] = [
  {
    authorName: 'Zoe Chen',
    rating: 5,
    body: '真心大推Reno Stars!!!',
    bodyLang: 'zh',
    reviewDate: '2026-01-01',
    sourceUrl: null,
  },
];

function extractJsonLd(html: string): Record<string, unknown> {
  const m = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  return JSON.parse((m?.[1] ?? '{}').replace(/\\u003c/g, '<'));
}

function render(extra?: Record<string, unknown>) {
  return extractJsonLd(
    renderToStaticMarkup(
      <ProjectSchema
        company={company}
        name="Three and a Half Bathroom Renovation in Delta"
        description="Three bathrooms renovated in a Delta townhouse."
        image="https://example.com/hero.jpg"
        location="Delta"
        url="/en/projects/three-bathroom-renovation-delta/"
        locale="en"
        {...extra}
      />,
    ),
  );
}

describe('ProjectSchema review emission', () => {
  it('attaches Review objects to the mainEntity Service', () => {
    const s = render({ reviews });
    const mainEntity = s.mainEntity as Record<string, unknown>;
    const emitted = mainEntity.review as Array<Record<string, unknown>>;
    expect(emitted).toHaveLength(1);
    expect(emitted[0]['@type']).toBe('Review');
    expect(emitted[0].reviewBody).toBe('真心大推Reno Stars!!!');
    // `datePublished` must be absent. review_date is month-precision (day is
    // always a '01' placeholder) and Schema.org types datePublished as
    // xsd:date, so the old 'YYYY-MM' output was rejected as invalid
    // structured data — and 'YYYY-MM-01' would fabricate a day we don't know.
    expect(emitted[0]).not.toHaveProperty('datePublished');
    // Author abbreviated the same way as the on-page card
    expect(emitted[0].author).toEqual({ '@type': 'Person', name: 'Zoe C.' });
    expect(emitted[0].reviewRating).toEqual({
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it('does not derive aggregateRating from project reviews', () => {
    const s = render({ reviews });
    const mainEntity = s.mainEntity as Record<string, unknown>;
    expect(mainEntity.aggregateRating).toBeUndefined();
    // Provider aggregate stays absent unless the pre-existing Google
    // business-wide rating props are passed (unchanged behaviour).
    const provider = (mainEntity as { provider?: Record<string, unknown> }).provider;
    expect(provider?.aggregateRating).toBeUndefined();
  });

  it('omits the review key entirely when there are no reviews', () => {
    const s = render();
    const mainEntity = s.mainEntity as Record<string, unknown>;
    expect('review' in mainEntity).toBe(false);
  });

  // Regression guard: the provider is a HomeAndConstructionBusiness, i.e. a
  // LocalBusiness subtype, so Google requires `address` on it. Shipping it
  // without one flagged all 65 project pages as invalid structured data, and
  // an aggregateRating on an addressless business suppresses star results.
  it('gives the provider a complete PostalAddress', () => {
    const s = render({ reviews });
    const mainEntity = s.mainEntity as Record<string, unknown>;
    const provider = mainEntity.provider as Record<string, unknown>;
    expect(provider['@type']).toBe('HomeAndConstructionBusiness');
    expect(provider.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '21300 Gordon Way, Unit 188',
      addressLocality: 'Richmond',
      addressRegion: 'BC',
      postalCode: 'V6W 1M2',
      addressCountry: 'CA',
    });
  });

  // Regression guard for the FABRICATION path, which is worse than the defect
  // above. `parseAddress('')` does not yield an empty address — it yields a
  // blank street/locality plus the HARDCODED fallback 'BC' / 'V6W 1M2'. And
  // COMPANY_FALLBACK.address IS '', served whenever the company query errors on
  // a cache miss while projects still render from their own warm cache. Emitting
  // unconditionally would publish a rated LocalBusiness at a postal code nobody
  // supplied — and ISR (7-day floor) would bake it into 65 projects x 14 locales.
  // Omitting the node is recoverable; a wrong address is unfalsifiable from the
  // page.
  it('omits the provider address entirely when the company address is empty', () => {
    const s = render({ reviews, company: { ...company, address: '' } });
    const mainEntity = s.mainEntity as Record<string, unknown>;
    const provider = mainEntity.provider as Record<string, unknown>;
    expect('address' in provider).toBe(false);
    // and specifically never the invented postal code
    expect(JSON.stringify(provider)).not.toContain('V6W 1M2');
  });

  it('omits the provider address when the parse yields no locality', () => {
    const s = render({ reviews, company: { ...company, address: '21300 Gordon Way' } });
    const mainEntity = s.mainEntity as Record<string, unknown>;
    const provider = mainEntity.provider as Record<string, unknown>;
    expect('address' in provider).toBe(false);
  });

  // Page-level schemas must not restate the layout org node's @id — a second
  // node carrying /#organization with a different property set is a duplicate
  // entity, not a consolidation. Mirrors no-duplicate-ids.test.tsx.
  it('does not give the provider the layout org @id', () => {
    const s = render({ reviews });
    const mainEntity = s.mainEntity as Record<string, unknown>;
    const provider = mainEntity.provider as Record<string, unknown>;
    expect(provider).not.toHaveProperty('@id');
  });
});
