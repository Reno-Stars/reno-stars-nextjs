import { describe, it, expect } from 'vitest';
import { serpRatingParams } from '@/lib/google-reviews';

// The homepage <title> leads with the live Google rating (metadata.home.titleRated).
// That is only honest while the number is real, so this guard is the thing standing
// between us and publishing a fabricated rating to every crawler.
//
// getGoogleReviews() degrades to `{ rating: 0, userRatingCount: 0, reviews: [] }`
// when the Places API AND the DB cache row are both unavailable — a state that
// produces no error and no log the title renderer can see. Without the guard that
// silently ships "0.0-Star Vancouver Renovation Contractor".
//
// Tested as a REFUSAL, not as an outcome: every case below asserts that an
// un-credible payload yields null, so a future change that widens the accept path
// fails here rather than shipping the claim.
describe('serpRatingParams — refuses to hand a title any rating it cannot stand behind', () => {
  it('refuses the empty payload getGoogleReviews returns when every source failed', () => {
    expect(serpRatingParams({ rating: 0, userRatingCount: 0 })).toBeNull();
  });

  it('refuses a real rating that has too few reviews to be credible', () => {
    expect(serpRatingParams({ rating: 5, userRatingCount: 2 })).toBeNull();
    expect(serpRatingParams({ rating: 5, userRatingCount: 9 })).toBeNull();
  });

  it('refuses a well-reviewed rating that is too low for the "N-Star" phrasing', () => {
    expect(serpRatingParams({ rating: 4.4, userRatingCount: 500 })).toBeNull();
    expect(serpRatingParams({ rating: 3.1, userRatingCount: 500 })).toBeNull();
  });

  it('refuses non-finite / non-integer junk rather than coercing it', () => {
    expect(serpRatingParams({ rating: NaN, userRatingCount: 78 })).toBeNull();
    expect(serpRatingParams({ rating: Infinity, userRatingCount: 78 })).toBeNull();
    expect(serpRatingParams({ rating: 5, userRatingCount: 12.5 })).toBeNull();
    expect(serpRatingParams({ rating: 5, userRatingCount: NaN })).toBeNull();
  });

  it('accepts the live payload and formats it for ICU interpolation', () => {
    // The values the site actually serves today (AggregateRating on /en/: 5 / 78).
    // `rating` must render "5.0", not "5" — the title reads "{rating}-Star".
    expect(serpRatingParams({ rating: 5, userRatingCount: 78 })).toEqual({
      rating: '5.0',
      reviewCount: '78',
    });
  });

  it('accepts the boundary and reports a non-integer rating to one decimal', () => {
    expect(serpRatingParams({ rating: 4.5, userRatingCount: 10 })).toEqual({
      rating: '4.5',
      reviewCount: '10',
    });
    expect(serpRatingParams({ rating: 4.87, userRatingCount: 214 })).toEqual({
      rating: '4.9',
      reviewCount: '214',
    });
  });
});
