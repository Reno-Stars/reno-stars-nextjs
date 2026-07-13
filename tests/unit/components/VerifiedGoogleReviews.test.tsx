import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import VerifiedGoogleReviews from '@/components/projects/VerifiedGoogleReviews';
import {
  formatReviewerName,
  relativeReviewDate,
  relativeGoogleReviewTime,
  flooredReviewCount,
  reviewDateToSchemaDate,
  type ProjectReviewDisplay,
} from '@/lib/project-reviews';
import { GOOGLE_REVIEWS_URL } from '@/lib/company-config';

const enReview: ProjectReviewDisplay = {
  authorName: 'Lisa Jung',
  rating: 5,
  body: 'This is our second project with Reno Stars, and once again the experience was excellent.',
  bodyLang: 'en',
  reviewDate: '2026-06-01',
  sourceUrl: null,
};

const zhReview: ProjectReviewDisplay = {
  authorName: 'Zoe Chen',
  rating: 5,
  body: '真心大推Reno Stars!!! 我们家刚装潢完成了三间浴室，成果真的太满意了！',
  bodyLang: 'zh',
  reviewDate: '2026-01-01',
  sourceUrl: null,
};

describe('formatReviewerName', () => {
  it('abbreviates to first name + last initial, preserving casing as written', () => {
    expect(formatReviewerName('Lisa Jung')).toBe('Lisa J.');
    expect(formatReviewerName('shane groves')).toBe('shane g.');
  });

  it('returns single-word names unchanged', () => {
    expect(formatReviewerName('Murphy')).toBe('Murphy');
  });
});

describe('reviewDateToSchemaDate', () => {
  it('truncates to month precision (YYYY-MM)', () => {
    expect(reviewDateToSchemaDate('2026-06-01')).toBe('2026-06');
  });
});

describe('relativeReviewDate', () => {
  const now = new Date('2026-07-10T00:00:00Z');

  it('formats month-granularity relative labels', () => {
    expect(relativeReviewDate('2026-06-01', 'en', now)).toBe('last month');
    expect(relativeReviewDate('2026-01-01', 'en', now)).toBe('6 months ago');
  });

  it('rolls to years after 12 months and localizes', () => {
    expect(relativeReviewDate('2025-01-01', 'en', now)).toBe('last year');
    expect(relativeReviewDate('2026-01-01', 'zh', now)).toBe('6个月前');
  });

  it('never returns a future label and survives unknown locales', () => {
    expect(relativeReviewDate('2026-09-01', 'en', now)).toBe('this month');
    expect(relativeReviewDate('2026-01-01', 'xx-INVALID' as string, now)).toContain('month');
  });
});

describe('relativeGoogleReviewTime', () => {
  const now = new Date('2026-07-10T00:00:00Z');

  it('formats day / month / year granularity from a full publish timestamp', () => {
    expect(relativeGoogleReviewTime('2026-07-08T00:00:00Z', 'en', now)).toBe('2 days ago');
    expect(relativeGoogleReviewTime('2026-05-01T00:00:00Z', 'en', now)).toBe('2 months ago');
    expect(relativeGoogleReviewTime('2024-07-10T00:00:00Z', 'en', now)).toBe('2 years ago');
  });

  it('localizes across the 14 locales (regression: no English en-US fallback on ja/ko/es)', () => {
    // The old TestimonialsSection copy had a 2-entry map and fell back to
    // en-US on non-en/zh locales (H4). These must render in the target script.
    expect(relativeGoogleReviewTime('2026-05-01T00:00:00Z', 'ja', now)).toBe('2 か月前');
    expect(relativeGoogleReviewTime('2026-05-01T00:00:00Z', 'zh', now)).toBe('2个月前');
    // zh-Hant + tl need the shared INTL_LOCALE_MAP remap (zh-TW / fil).
    expect(relativeGoogleReviewTime('2026-05-01T00:00:00Z', 'zh-Hant', now)).toBe('2 個月前');
    // ko/es must NOT be English — assert they differ from the en rendering.
    expect(relativeGoogleReviewTime('2026-05-01T00:00:00Z', 'ko', now)).not.toBe('2 months ago');
    expect(relativeGoogleReviewTime('2026-05-01T00:00:00Z', 'es', now)).not.toBe('2 months ago');
  });

  it('returns empty string for missing / unparseable input', () => {
    expect(relativeGoogleReviewTime('', 'en', now)).toBe('');
    expect(relativeGoogleReviewTime('not-a-date', 'en', now)).toBe('');
  });
});

describe('flooredReviewCount', () => {
  it('floors a live count to the nearest 5 for the "N+" style (77 → 75)', () => {
    expect(flooredReviewCount(77)).toBe(75);
    expect(flooredReviewCount(80)).toBe(80);
    expect(flooredReviewCount(83)).toBe(80);
  });

  it('returns 0 when the count is absent or too small to round up (no "0+")', () => {
    expect(flooredReviewCount(undefined)).toBe(0);
    expect(flooredReviewCount(null)).toBe(0);
    expect(flooredReviewCount(0)).toBe(0);
    expect(flooredReviewCount(4)).toBe(0);
  });
});

describe('VerifiedGoogleReviews', () => {
  it('renders nothing when there are no reviews', () => {
    expect(renderToStaticMarkup(<VerifiedGoogleReviews reviews={[]} locale="en" />)).toBe('');
  });

  it('renders the verbatim body, 5 gold stars, abbreviated author, and Google link', () => {
    const html = renderToStaticMarkup(<VerifiedGoogleReviews reviews={[enReview]} locale="en" />);
    expect(html).toContain('Verified Google Review');
    expect(html).toContain('second project with Reno Stars');
    expect(html).toContain('Lisa J.');
    expect(html).not.toContain('Lisa Jung'); // full surname never shown
    expect(html).toContain('aria-label="5/5"');
    expect(html).toContain(GOOGLE_REVIEWS_URL);
    expect(html).toContain('Read our reviews on Google');
  });

  it('shows a zh review verbatim (untranslated) on non-zh locales, tagged with lang', () => {
    const html = renderToStaticMarkup(<VerifiedGoogleReviews reviews={[zhReview]} locale="en" />);
    expect(html).toContain('真心大推Reno Stars!!!');
    expect(html).toContain('lang="zh"');
    expect(html).toContain('Verified Google Review'); // chrome stays in page locale
  });

  it('localizes the card chrome on zh and falls back to EN labels on unknown locales', () => {
    const zhHtml = renderToStaticMarkup(<VerifiedGoogleReviews reviews={[zhReview]} locale="zh" />);
    expect(zhHtml).toContain('Google 认证客户评价');
    const unknown = renderToStaticMarkup(<VerifiedGoogleReviews reviews={[enReview]} locale="xx" />);
    expect(unknown).toContain('Verified Google Review');
  });

  it('renders one card per review when a project has multiple reviews', () => {
    const html = renderToStaticMarkup(
      <VerifiedGoogleReviews reviews={[enReview, zhReview]} locale="en" />,
    );
    expect(html.match(/<article/g)?.length).toBe(2);
  });
});
