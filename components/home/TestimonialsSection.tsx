import { Star } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { GoogleReview, GooglePlaceRating } from '@/lib/types';
import { GOLD, SURFACE, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';
import GoogleAvatar from './GoogleAvatar';
import Marquee from './Marquee';
import { computeMarqueeParams } from './marquee-utils';

interface TestimonialsSectionProps {
  googleReviews: GooglePlaceRating;
  locale: Locale;
  translations: {
    title: string;
    subtitle: string;
  };
}

/** Map app locales to valid Intl.RelativeTimeFormat locales */
const INTL_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
};

function getRelativeTime(publishTime: string, locale: string): string {
  if (!publishTime) return '';
  const timestamp = new Date(publishTime).getTime();
  if (isNaN(timestamp)) return '';
  const MS_PER_DAY = 86_400_000;
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / MS_PER_DAY);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  const intlLocale = INTL_LOCALE_MAP[locale] || 'en-US';
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });
  if (years > 0) return rtf.format(-years, 'year');
  if (months > 0) return rtf.format(-months, 'month');
  if (days > 0) return rtf.format(-days, 'day');
  return rtf.format(0, 'day');
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
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
          &ldquo;{review.text}&rdquo;
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 min-w-0">
            <GoogleAvatar src={review.authorPhotoUri} name={review.authorName} />
            <div className="min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: TEXT }}>{review.authorName}</div>
              <div className="text-xs" style={{ color: TEXT_MUTED }}>
                {review.publishTime ? getRelativeTime(review.publishTime, locale) : review.relativePublishTime}
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
  const reviews = googleReviews.reviews;
  if (reviews.length === 0) return null;

  // CARD_WIDTH = sm:w-80 (320px) + gap-5 (20px)
  const { repeatCount, duration } = computeMarqueeParams(reviews.length, 340, 6);

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="py-14" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 id="testimonials-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
        <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
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
