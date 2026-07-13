import { Star } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { GoogleReview, GooglePlaceRating } from '@/lib/types';
import { GOLD, SURFACE, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';
import GoogleAvatar from './GoogleAvatar';
import GoogleIcon from '@/components/reviews/GoogleIcon';
import Marquee from './Marquee';
import { computeMarqueeParams } from './marquee-utils';
import { relativeGoogleReviewTime } from '@/lib/project-reviews';

interface TestimonialsSectionProps {
  googleReviews: GooglePlaceRating;
  locale: Locale;
  translations: {
    title: string;
    subtitle: string;
  };
}

function ReviewCard({ review, locale }: { review: GoogleReview; locale: Locale }) {
  return (
    <div className="w-72 sm:w-80 shrink-0 rounded-2xl p-4 sm:p-5 relative flex flex-col" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
      <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-r-full" style={{ backgroundColor: GOLD }} />
      <div className="pl-4 flex flex-col flex-1">
        <div className="flex gap-0.5 mb-3" role="img" aria-label="5/5">
          {[0, 1, 2, 3, 4].map((j) => (
            <Star key={j} className="w-3.5 h-3.5" aria-hidden="true" style={{ fill: GOLD, color: GOLD }} />
          ))}
        </div>
        <p className="text-sm leading-relaxed italic mb-4 line-clamp-5 flex-1" style={{ color: TEXT_MID }}>
          &ldquo;{review.translations?.[locale] ?? review.text}&rdquo;
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 min-w-0">
            <GoogleAvatar src={review.authorPhotoUri} name={review.authorName} />
            <div className="min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: TEXT }}>{review.authorName}</div>
              <div className="text-xs" style={{ color: TEXT_MUTED }}>
                {review.publishTime ? relativeGoogleReviewTime(review.publishTime, locale) : review.relativePublishTime}
              </div>
            </div>
          </div>
          {review.authorUri && (
            <a href={review.authorUri} target="_blank" rel="noopener noreferrer" aria-label={`${review.authorName} on Google`} className="shrink-0 ml-2">
              <GoogleIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection({ googleReviews, locale, translations: t }: TestimonialsSectionProps) {
  // Show all five-star reviews on every locale. Per-locale translated text
  // comes from `review.translations?.[locale]` populated by `pnpm reviews:cache`
  // (Stage 1 of Hongming Option 1, shipped in PR #83). When a locale lacks a
  // translation for a given review, we render the EN source (`review.text`) —
  // better than hiding the section entirely. The earlier `locale === 'zh'`
  // filter (drop reviews lacking `textZh`) was the structural root cause of
  // the /zh/ testimonials-section blank diagnosed 2026-05-28T1340Z; this
  // refactor closes that finding.
  const reviews = googleReviews.reviews;
  if (reviews.length === 0) return null;

  // CARD_WIDTH = sm:w-80 (320px) + gap-5 (20px)
  const { repeatCount, duration } = computeMarqueeParams(reviews.length, 340, 6);

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="py-14" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 id="testimonials-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
        <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
        {/* /reviews/ inbound link — parallel to AreaPage 62350e1 +
            ServiceDetailPage 7a8d289. Homepage is the #1-indexed page on the
            site; pre-fix it had ZERO body-content references to /reviews/.
            The marquee below renders ~5-10 sampled review cards but doesn't
            link to the full collection. This adds the discoverable "See all
            ${count} Google reviews →" CTA next to the section subtitle. */}
        {googleReviews.userRatingCount > 0 && (
          <p className="text-sm mt-2">
            <Link
              href="/reviews"
              className="font-semibold underline hover:no-underline inline-flex items-center gap-1"
              style={{ color: GOLD }}
            >
              <Star className="w-3.5 h-3.5" style={{ fill: GOLD, color: GOLD }} aria-hidden />
              {googleReviews.rating.toFixed(1)} · See all {googleReviews.userRatingCount} Google reviews →
            </Link>
          </p>
        )}
      </div>
      <div
        className="overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label={t.title}
      >
        <div id="testimonials-track" className="flex gap-5 w-max px-4 py-4">
          {reviews.map((review) => (
            <ReviewCard key={review.authorUri} review={review} locale={locale} />
          ))}
        </div>
      </div>
      <Marquee trackId="testimonials-track" repeatCount={repeatCount} duration={duration} />
    </section>
  );
}
