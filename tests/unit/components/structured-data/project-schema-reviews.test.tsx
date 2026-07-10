import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ProjectSchema from '@/components/structured-data/ProjectSchema';
import type { Company } from '@/lib/types';
import type { ProjectReviewDisplay } from '@/lib/project-reviews';

const company = {
  name: 'Reno Stars',
  phone: '778-960-7999',
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
    // Month-precision date — no fabricated day
    expect(emitted[0].datePublished).toBe('2026-01');
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
});
