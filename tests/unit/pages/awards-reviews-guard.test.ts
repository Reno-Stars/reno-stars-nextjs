import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf-8');

/**
 * `getGoogleReviews()` returns EMPTY_RESULT (rating 0, userRatingCount 0) when
 * GOOGLE_PLACES_API_KEY is absent AND the google_reviews_cache row is missing —
 * exactly the state the 2026-08-14 cluster migration produced for 25 runtime
 * variables. Unguarded, /awards/ publicly advertises "0 out of 5 on Google, from
 * 0 reviews" under a heading that calls it recognition we have.
 *
 * Every other consumer already guards on count > 0. This pins that AwardsPage
 * does too, so the next component to render a rating inherits the rule instead
 * of rediscovering it during an outage.
 */
describe('Google rating renders only when there are reviews', () => {
  const CONSUMERS = [
    'components/pages/AwardsPage.tsx',
    'components/pages/ReviewsPage.tsx',
    'components/pages/AreaPage.tsx',
    'components/home/TestimonialsSection.tsx',
  ];

  it.each(CONSUMERS)('%s guards its rating on a positive review count', (file) => {
    const src = read(file);
    expect(src).toMatch(/(googleReviewCount|userRatingCount|reviewCount)\s*>\s*0/);
  });
});

/**
 * Google requires FAQPage markup to describe content VISIBLE on the page. The
 * route's JSON-LD and the component's rendered <dl> were two hand-kept copies of
 * the same list, so adding a question to one alone either emits an invisible
 * answer (policy violation) or drops it from the rich result.
 */
describe('transparent-pricing FAQ markup matches what is rendered', () => {
  it('the route imports the key list instead of redeclaring it', () => {
    const route = read('app/[locale]/transparent-pricing/page.tsx');
    expect(route).toMatch(/import TransparentPricingPage, \{ FAQ_KEYS \}/);
    expect(route).not.toMatch(/^const FAQ_KEYS/m);
  });

  it('the component exports exactly one FAQ key list', () => {
    const component = read('components/pages/TransparentPricingPage.tsx');
    expect(component.match(/FAQ_KEYS\s*=/g)).toHaveLength(1);
    expect(component).toMatch(/export const FAQ_KEYS/);
  });
});
