import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { TEXT_MUTED } from '@/lib/theme';
import { type ProjectReviewDisplay } from '@/lib/project-reviews';
import ReviewQuoteCard, { ALL_REVIEWS_LABELS } from '@/components/reviews/ReviewQuoteCard';

/**
 * "Verified Google Review" card(s) on a project detail page.
 *
 * Thin wrapper over the shared <ReviewQuoteCard> (see that component for the
 * verbatim-quote / never-machine-translate rules and the self-contained
 * 14-locale label technique). Adds a quiet "All reviews" link to the /reviews
 * hub below the cards. No hooks — usable from both server and client
 * components (currently rendered inside the ProjectDetailPage client
 * component).
 */

interface VerifiedGoogleReviewsProps {
  reviews: ProjectReviewDisplay[];
  locale: string;
}

export default function VerifiedGoogleReviews({ reviews, locale }: VerifiedGoogleReviewsProps) {
  if (reviews.length === 0) return null;
  const allReviewsLabel = ALL_REVIEWS_LABELS[locale] ?? ALL_REVIEWS_LABELS.en;

  return (
    <div className="mb-8" data-testid="verified-google-reviews">
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewQuoteCard
            key={`${review.authorName}-${review.reviewDate}`}
            review={review}
            locale={locale}
          />
        ))}
      </div>
      <div className="mt-3 text-right">
        <Link
          href={`/${locale}/reviews/`}
          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
          style={{ color: TEXT_MUTED }}
        >
          {allReviewsLabel} <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
