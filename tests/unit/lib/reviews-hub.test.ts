import { describe, it, expect } from 'vitest';
import {
  buildReviewsHub,
  dedupeHubReviews,
  groupReviewsByCity,
  isDuplicateReview,
  stripProvince,
  textSimilarity,
  type HubReview,
} from '@/lib/reviews-hub';
import type { GoogleReview } from '@/lib/types';

function makeHubReview(overrides: Partial<HubReview> = {}): HubReview {
  return {
    kind: 'project',
    authorName: 'Lisa Jung',
    rating: 5,
    body: 'This is our second project with Reno Stars, and once again the team delivered beautiful work on time.',
    bodyLang: 'en',
    reviewDate: '2026-06-01',
    sourceUrl: null,
    projectSlug: 'kitchen-renovation-richmond',
    city: 'Richmond',
    ...overrides,
  };
}

function makeGoogleReview(overrides: Partial<GoogleReview> = {}): GoogleReview {
  return {
    authorName: 'Marco Or',
    authorUri: 'https://www.google.com/maps/contrib/1',
    authorPhotoUri: '',
    rating: 5,
    text: 'Really enjoyed working with Reno Stars, heard good things about them before meeting the team.',
    languageCode: 'en',
    publishTime: '2026-04-01T20:25:15Z',
    relativePublishTime: '3 months ago',
    ...overrides,
  } as GoogleReview;
}

describe('stripProvince', () => {
  it('strips a ", BC" suffix from testimonial locations', () => {
    expect(stripProvince('Richmond, BC')).toBe('Richmond');
    expect(stripProvince('Vancouver, B.C.')).toBe('Vancouver');
    expect(stripProvince('Burnaby')).toBe('Burnaby');
  });
});

describe('textSimilarity', () => {
  it('is 1 for identical texts and ~0 for unrelated texts', () => {
    const a = 'Great kitchen renovation from a professional team';
    expect(textSimilarity(a, a)).toBe(1);
    expect(textSimilarity(a, 'Completely unrelated words about plumbing pipes')).toBeLessThan(0.2);
  });

  it('scores a trimmed copy of the same review high', () => {
    const full = 'The team was punctual, professional and the kitchen looks amazing. Highly recommend Reno Stars to anyone.';
    const trimmed = 'The team was punctual, professional and the kitchen looks amazing.';
    expect(textSimilarity(full, trimmed)).toBeGreaterThanOrEqual(0.6);
  });
});

describe('isDuplicateReview', () => {
  const base = makeHubReview();

  it('flags same author + identical text', () => {
    expect(isDuplicateReview(base, makeHubReview({ kind: 'google' }))).toBe(true);
  });

  it('flags same author when one text contains the other', () => {
    const shorter = makeHubReview({ body: base.body.slice(0, 60) });
    expect(isDuplicateReview(base, shorter)).toBe(true);
  });

  it('does NOT flag different authors with the same text', () => {
    expect(isDuplicateReview(base, makeHubReview({ authorName: 'Someone Else' }))).toBe(false);
  });

  it('does NOT flag the same author with a genuinely different review', () => {
    const other = makeHubReview({
      body: 'A totally separate bathroom project finished two years earlier with different scope and different crew members involved throughout.',
    });
    expect(isDuplicateReview(base, other)).toBe(false);
  });

  it('matches author names case/whitespace-insensitively', () => {
    expect(isDuplicateReview(base, makeHubReview({ authorName: '  lisa   JUNG ' }))).toBe(true);
  });
});

describe('dedupeHubReviews', () => {
  it('prefers the project copy over google and testimonial copies', () => {
    const project = makeHubReview({ kind: 'project' });
    const google = makeHubReview({ kind: 'google', projectSlug: null, googleIndex: 0 });
    const testimonial = makeHubReview({ kind: 'testimonial', projectSlug: null });
    const result = dedupeHubReviews([google, testimonial, project]);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('project');
    expect(result[0].projectSlug).toBe('kitchen-renovation-richmond');
  });

  it('collapses one-row-per-project duplicates of a multi-project job', () => {
    const kitchenRow = makeHubReview({ projectSlug: 'kitchen-renovation' });
    const bathroomRow = makeHubReview({ projectSlug: 'bathroom-renovation' });
    const result = dedupeHubReviews([kitchenRow, bathroomRow]);
    expect(result).toHaveLength(1);
  });

  it('keeps distinct reviews from distinct authors', () => {
    const a = makeHubReview();
    const b = makeHubReview({ authorName: 'Zoe Chen', body: '真心大推Reno Stars!!! 我们家刚装潢完成了三间浴室，成果真的太满意了！', bodyLang: 'zh' });
    expect(dedupeHubReviews([a, b])).toHaveLength(2);
  });
});

describe('groupReviewsByCity', () => {
  it('groups by city, biggest group first, unknown city last', () => {
    const reviews = [
      makeHubReview({ city: 'Delta', authorName: 'Zoe Chen', body: 'unique delta review text' }),
      makeHubReview({ city: 'Richmond', authorName: 'A One', body: 'unique one', reviewDate: '2026-01-01' }),
      makeHubReview({ city: 'Richmond', authorName: 'B Two', body: 'unique two', reviewDate: '2026-06-01' }),
      makeHubReview({ city: null, authorName: 'C Three', body: 'unique three' }),
    ];
    const groups = groupReviewsByCity(reviews);
    expect(groups.map((g) => g.city)).toEqual(['Richmond', 'Delta', null]);
    // Newest first inside a group.
    expect(groups[0].reviews.map((r) => r.authorName)).toEqual(['B Two', 'A One']);
  });
});

describe('buildReviewsHub', () => {
  it('merges the three sources, dedupes, and reports surviving google indices', () => {
    const projectRows = [
      // Multi-project duplicate → collapses to one.
      { authorName: 'Henry Wang', rating: 5, body: 'We worked with Reno Stars Construction on a partial renovation of our home and are very happy with the result.', bodyLang: 'en', reviewDate: '2026-01-01', sourceUrl: null, projectSlug: 'kitchen-a', city: 'Richmond' },
      { authorName: 'Henry Wang', rating: 5, body: 'We worked with Reno Stars Construction on a partial renovation of our home and are very happy with the result.', bodyLang: 'en', reviewDate: '2026-01-01', sourceUrl: null, projectSlug: 'bathroom-b', city: 'Richmond' },
      { authorName: 'Zoe Chen', rating: 5, body: '真心大推Reno Stars!!! 我们家刚装潢完成了三间浴室，成果真的太满意了！', bodyLang: 'zh', reviewDate: '2026-01-01', sourceUrl: null, projectSlug: 'three-bathroom-delta', city: 'Delta' },
    ];
    const googleReviews = [
      // Duplicates Henry Wang's project review → project copy wins.
      makeGoogleReview({ authorName: 'Henry Wang', text: 'We worked with Reno Stars Construction on a partial renovation of our home and are very happy with the result.' }),
      makeGoogleReview({ authorName: 'Marco Or' }),
    ];
    const testimonials = [
      { name: 'Sarah M.', rating: 5, textEn: 'Reno Stars transformed our outdated kitchen into a modern masterpiece.', location: 'Vancouver, BC', translations: { zh: '译文' } },
    ];

    const hub = buildReviewsHub({ projectReviews: projectRows, googleReviews, testimonials });

    // Henry Wang: 2 project rows + 1 google copy → 1 survivor (project).
    // Unique total: Henry + Zoe + Marco + Sarah = 4.
    expect(hub.uniqueCount).toBe(4);
    expect(hub.googleIndices).toEqual([1]); // only Marco Or survives as google
    const cities = hub.cityGroups.map((g) => g.city);
    expect(cities).toContain('Richmond');
    expect(cities).toContain('Delta');
    expect(cities).toContain('Vancouver'); // ', BC' stripped from testimonial
    const richmond = hub.cityGroups.find((g) => g.city === 'Richmond')!;
    expect(richmond.reviews).toHaveLength(1);
    expect(richmond.reviews[0].kind).toBe('project');
    const vancouver = hub.cityGroups.find((g) => g.city === 'Vancouver')!;
    expect(vancouver.reviews[0].kind).toBe('testimonial');
    expect(vancouver.reviews[0].translations?.zh).toBe('译文');
  });
});
