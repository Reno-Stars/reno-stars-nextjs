import { describe, it, expect } from 'vitest';
import {
  buildReviewsHub,
  dedupeHubReviews,
  groupReviewsByCity,
  groupReviewsByServiceType,
  isDuplicateReview,
  isFabricatedTestimonial,
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
    serviceType: 'kitchen',
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

  it('scores short zh near-duplicates high via CJK character shingles', () => {
    // One-character difference (满意 vs 满足) in an otherwise identical short zh
    // review. Whitespace tokenization would score 0 (each string is a single
    // token); character bigrams keep the overlap high.
    const a = '这次厨房装修非常满意';
    const b = '这次厨房装修非常满足';
    expect(textSimilarity(a, b)).toBeGreaterThanOrEqual(0.5);
    // Two genuinely different short zh reviews still score low.
    expect(textSimilarity(a, '浴室防水做得很好水电也没问题')).toBeLessThan(0.3);
  });
});

describe('isFabricatedTestimonial', () => {
  it('flags the 3 fabricated seed placeholders (Sarah M./David L./Jennifer K.)', () => {
    expect(isFabricatedTestimonial('Sarah M.', 'Reno Stars transformed our outdated kitchen into a modern masterpiece. The attention to detail was incredible!')).toBe(true);
    expect(isFabricatedTestimonial('David L.', 'Professional team from start to finish. Our bathroom renovation exceeded all expectations.')).toBe(true);
    expect(isFabricatedTestimonial('Jennifer K.', "Best renovation experience we've had. On time, on budget, and the quality is outstanding.")).toBe(true);
  });

  it('does NOT flag a genuine testimonial (real name OR different quote)', () => {
    expect(isFabricatedTestimonial('Real Client', 'Actual verified quote about our kitchen renovation.')).toBe(false);
    // Same placeholder name but a different (genuine) quote is not excluded.
    expect(isFabricatedTestimonial('Sarah M.', 'A completely different, genuine review from a real Sarah.')).toBe(false);
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

  it('dedupes a short zh near-duplicate one character apart (same author)', () => {
    const project = makeHubReview({ authorName: 'Zoe Chen', body: '这次厨房装修非常满意', bodyLang: 'zh' });
    const googleCopy = makeHubReview({ kind: 'google', authorName: 'Zoe Chen', body: '这次厨房装修非常满足', bodyLang: 'zh', googleIndex: 0 });
    expect(isDuplicateReview(project, googleCopy)).toBe(true);
    // A genuinely different zh review by the same author is NOT a duplicate.
    const different = makeHubReview({ authorName: 'Zoe Chen', body: '浴室防水做得很好水电也没问题', bodyLang: 'zh' });
    expect(isDuplicateReview(project, different)).toBe(false);
  });

  it('matches a zh verbatim body against its EN google copy via altBodies', () => {
    const zhBody = '真心大推Reno Stars!!! 我们家刚装潢完成了三间浴室，成果真的太满意了！';
    const projectCopy = makeHubReview({ authorName: 'Zoe Chen', body: zhBody, bodyLang: 'zh' });
    const googleCopy = makeHubReview({
      kind: 'google',
      authorName: 'Zoe Chen',
      body: 'Highly recommend Reno Stars!!! We just finished renovating three bathrooms and we are so happy with the result!',
      bodyLang: 'en',
      altBodies: [zhBody],
    });
    // Sanity: without the altBodies variant the EN translation cannot match.
    expect(isDuplicateReview(projectCopy, { ...googleCopy, altBodies: undefined })).toBe(false);
    expect(isDuplicateReview(projectCopy, googleCopy)).toBe(true);
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

  it('collapses case/space city variants into ONE group with a canonical name (#13)', () => {
    const reviews = [
      makeHubReview({ city: 'Burnaby', authorName: 'A One', body: 'unique a' }),
      makeHubReview({ city: 'burnaby ', authorName: 'B Two', body: 'unique b' }),
      makeHubReview({ city: ' BURNABY', authorName: 'C Three', body: 'unique c' }),
    ];
    const groups = groupReviewsByCity(reviews);
    expect(groups).toHaveLength(1);
    // Canonical display = the first non-empty original, trimmed.
    expect(groups[0].city).toBe('Burnaby');
    expect(groups[0].reviews).toHaveLength(3);
  });
});

describe('groupReviewsByServiceType', () => {
  it('groups by service type, biggest group first (ties: type name)', () => {
    const reviews = [
      makeHubReview({ serviceType: 'bathroom', authorName: 'Zoe Chen', body: 'unique bathroom review text' }),
      makeHubReview({ serviceType: 'kitchen', authorName: 'A One', body: 'unique one', reviewDate: '2026-01-01' }),
      makeHubReview({ serviceType: 'kitchen', authorName: 'B Two', body: 'unique two', reviewDate: '2026-06-01' }),
      makeHubReview({ serviceType: 'commercial', authorName: 'C Three', body: 'unique three' }),
    ];
    const groups = groupReviewsByServiceType(reviews);
    // kitchen (2) first, then bathroom/commercial (1 each) alphabetically.
    expect(groups.map((g) => g.serviceType)).toEqual(['kitchen', 'bathroom', 'commercial']);
    // Newest first inside a group.
    expect(groups[0].reviews.map((r) => r.authorName)).toEqual(['B Two', 'A One']);
  });

  it('skips reviews without a serviceType — no "unknown type" bucket', () => {
    const reviews = [
      makeHubReview({ serviceType: 'kitchen' }),
      makeHubReview({ serviceType: null, authorName: 'Unlinked U', body: 'unlinked review text' }),
      makeHubReview({ kind: 'testimonial', serviceType: undefined, projectSlug: null, authorName: 'Testi T', body: 'legacy testimonial text' }),
    ];
    const groups = groupReviewsByServiceType(reviews);
    expect(groups).toHaveLength(1);
    expect(groups[0].serviceType).toBe('kitchen');
    expect(groups[0].reviews).toHaveLength(1);
  });

  it('places a multi-project review under BOTH of its service types (#1)', () => {
    // One reviewer, two rows (one per project) — a kitchen AND a bathroom.
    const kitchenRow = makeHubReview({ authorName: 'Henry Wang', serviceType: 'kitchen', projectSlug: 'k', body: 'partial home reno, very happy' });
    const bathroomRow = makeHubReview({ authorName: 'Henry Wang', serviceType: 'bathroom', projectSlug: 'b', body: 'partial home reno, very happy' });
    const groups = groupReviewsByServiceType([kitchenRow, bathroomRow]);
    expect(groups.map((g) => g.serviceType).sort()).toEqual(['bathroom', 'kitchen']);
    expect(groups.find((g) => g.serviceType === 'kitchen')!.reviews).toHaveLength(1);
    expect(groups.find((g) => g.serviceType === 'bathroom')!.reviews).toHaveLength(1);
  });

  it('dedupes duplicates of the same review WITHIN a single type', () => {
    // Two same-type rows with identical author+body collapse to one card.
    const a = makeHubReview({ authorName: 'Henry Wang', serviceType: 'kitchen', projectSlug: 'k1', body: 'identical body text here' });
    const b = makeHubReview({ authorName: 'Henry Wang', serviceType: 'kitchen', projectSlug: 'k2', body: 'identical body text here' });
    const groups = groupReviewsByServiceType([a, b]);
    expect(groups).toHaveLength(1);
    expect(groups[0].reviews).toHaveLength(1);
  });
});

describe('buildReviewsHub', () => {
  it('merges the three sources, dedupes, and reports surviving google indices', () => {
    const projectRows = [
      // Multi-project review: one row per project (kitchen AND bathroom).
      { authorName: 'Henry Wang', rating: 5, body: 'We worked with Reno Stars Construction on a partial renovation of our home and are very happy with the result.', bodyLang: 'en', reviewDate: '2026-01-01', sourceUrl: null, source: 'google', projectSlug: 'kitchen-a', city: 'Richmond', serviceType: 'kitchen' },
      { authorName: 'Henry Wang', rating: 5, body: 'We worked with Reno Stars Construction on a partial renovation of our home and are very happy with the result.', bodyLang: 'en', reviewDate: '2026-01-01', sourceUrl: null, source: 'google', projectSlug: 'bathroom-b', city: 'Richmond', serviceType: 'bathroom' },
      { authorName: 'Zoe Chen', rating: 5, body: '真心大推Reno Stars!!! 我们家刚装潢完成了三间浴室，成果真的太满意了！', bodyLang: 'zh', reviewDate: '2026-01-01', sourceUrl: null, source: 'google', projectSlug: 'three-bathroom-delta', city: 'Delta', serviceType: 'bathroom' },
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

    expect(hub.googleIndices).toEqual([1]); // only Marco Or survives as google
    const cities = hub.cityGroups.map((g) => g.city);
    expect(cities).toContain('Richmond');
    expect(cities).toContain('Delta');
    expect(cities).toContain('Vancouver'); // ', BC' stripped from testimonial
    // CITY grouping uses the globally-deduped survivors: Henry's two Richmond
    // rows collapse to ONE card.
    const richmond = hub.cityGroups.find((g) => g.city === 'Richmond')!;
    expect(richmond.reviews).toHaveLength(1);
    expect(richmond.reviews[0].kind).toBe('project');
    expect(richmond.reviews[0].source).toBe('google');
    const vancouver = hub.cityGroups.find((g) => g.city === 'Vancouver')!;
    expect(vancouver.reviews[0].kind).toBe('testimonial');
    expect(vancouver.reviews[0].translations?.zh).toBe('译文');

    // TYPE grouping uses the per-project rows: Henry's review spans a kitchen
    // AND a bathroom project, so it appears under BOTH type groups (#1). The
    // testimonial (Sarah) and the google survivor (Marco) have no serviceType,
    // so they never enter a type group.
    // bathroom = { Henry, Zoe } (2), kitchen = { Henry } (1) → bathroom first.
    expect(hub.typeGroups.map((g) => g.serviceType)).toEqual(['bathroom', 'kitchen']);
    const kitchen = hub.typeGroups.find((g) => g.serviceType === 'kitchen')!;
    expect(kitchen.reviews.map((r) => r.authorName)).toEqual(['Henry Wang']);
    const bathroom = hub.typeGroups.find((g) => g.serviceType === 'bathroom')!;
    expect(bathroom.reviews.map((r) => r.authorName)).toEqual(['Henry Wang', 'Zoe Chen']);
  });

  it('dedupes a zh project review against its EN-translated google cache copy', () => {
    const zhBody = '真心大推Reno Stars!!! 我们家刚装潢完成了三间浴室，成果真的太满意了！';
    const projectRows = [
      { authorName: 'Zoe Chen', rating: 5, body: zhBody, bodyLang: 'zh', reviewDate: '2026-01-01', sourceUrl: null, source: 'google', projectSlug: 'three-bathroom-delta', city: 'Delta' },
    ];
    const googleReviews = [
      // The Places API (languageCode=en) returns the EN machine translation as
      // `text` and keeps the verbatim zh original in `originalText`.
      makeGoogleReview({
        authorName: 'Zoe Chen',
        text: 'Highly recommend Reno Stars!!! We just finished renovating three bathrooms and we are so happy with the result!',
        originalText: zhBody,
      }),
      makeGoogleReview({ authorName: 'Marco Or' }),
    ];

    const hub = buildReviewsHub({ projectReviews: projectRows, googleReviews, testimonials: [] });

    // Zoe's google copy is deduped away; the project copy (with its case-study
    // link) wins. Only Marco Or survives from the google source.
    expect(hub.googleIndices).toEqual([1]);
    const delta = hub.cityGroups.find((g) => g.city === 'Delta')!;
    expect(delta.reviews).toHaveLength(1);
    expect(delta.reviews[0].kind).toBe('project');
  });
});
