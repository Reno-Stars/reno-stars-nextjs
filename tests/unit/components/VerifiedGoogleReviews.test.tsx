import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import VerifiedGoogleReviews from '@/components/projects/VerifiedGoogleReviews';
import {
  formatReviewerName,
  relativeReviewDate,
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
