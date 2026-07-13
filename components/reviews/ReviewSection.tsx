import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { AreaReviewDisplay } from '@/lib/project-reviews';
import { GOLD, SURFACE, TEXT, TEXT_MID } from '@/lib/theme';
import ReviewQuoteCard, {
  ALL_REVIEWS_LABELS,
  SEE_PROJECT_LABELS,
} from '@/components/reviews/ReviewQuoteCard';

/**
 * Shared "up to 3 verified client reviews, each linking to its case study"
 * section — the single implementation behind AreaClientReviews ("What {city}
 * clients say") and ServiceClientReviews ("What our {service} clients say"),
 * which were byte-identical apart from the composed heading (dedup #16-21a).
 *
 * The caller passes the already-composed, already-localized `heading`; this
 * component owns the layout, the quiet "All reviews" → /reviews link, the card
 * grid and the per-card "See this project" footer. Renders nothing when there
 * are no reviews. Quotes are verbatim (original language + `lang` attr via the
 * shared card — NEVER machine-translated). No hooks — safe from server or
 * client components. Deliberately NO Review schema markup (it lives on the
 * project pages; duplicating the same reviews on a second entity risks spam).
 */

interface ReviewSectionProps {
  /** Already-composed + localized section heading. */
  heading: string;
  reviews: AreaReviewDisplay[];
  locale: string;
  /** data-testid on the <section> (preserves each caller's existing hook). */
  testId: string;
}

export default function ReviewSection({ heading, reviews, locale, testId }: ReviewSectionProps) {
  if (reviews.length === 0) return null;

  const seeProject = SEE_PROJECT_LABELS[locale] ?? SEE_PROJECT_LABELS.en;
  const allReviews = ALL_REVIEWS_LABELS[locale] ?? ALL_REVIEWS_LABELS.en;

  return (
    <section
      className="py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: SURFACE }}
      data-testid={testId}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <h2 className="text-2xl font-bold" style={{ color: TEXT }}>
            {heading}
          </h2>
          <Link
            href={`/${locale}/reviews/`}
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: TEXT_MID }}
          >
            {allReviews} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className={`grid gap-6 ${reviews.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:max-w-xl'}`}>
          {reviews.map((review, idx) => (
            <ReviewQuoteCard
              // idx guards against legitimate collisions (same author + same
              // project, e.g. a follow-up review); the list is static per render.
              key={`${review.authorName}-${review.projectSlug}-${idx}`}
              review={review}
              locale={locale}
              eyebrowTag="div"
              footerExtra={
                <div className="mt-3">
                  <Link
                    href={`/${locale}/projects/${review.projectSlug}/`}
                    className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                    style={{ color: GOLD }}
                  >
                    {seeProject} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
