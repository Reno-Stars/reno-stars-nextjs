import { Star, ExternalLink } from 'lucide-react';
import { GOLD, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';
import { GOOGLE_REVIEWS_URL } from '@/lib/company-config';
import {
  formatReviewerName,
  relativeReviewDate,
  type ProjectReviewDisplay,
} from '@/lib/project-reviews';

/**
 * "Verified Google Review" card(s) on a project detail page.
 *
 * The review body is a verbatim quote from the client's real Google review —
 * NEVER machine-translate it. When `bodyLang` doesn't match the viewer's
 * locale we still show the original text (a translated quote would no longer
 * be the client's words). Self-contained label map (ZhTrustSignals pattern)
 * instead of messages/*.json so the strings ship atomically with the
 * component across all 14 locales.
 *
 * No hooks — usable from both server and client components (currently
 * rendered inside the ProjectDetailPage client component).
 */

const LABELS: Record<string, { heading: string; readOnGoogle: string }> = {
  en: { heading: 'Verified Google Review', readOnGoogle: 'Read our reviews on Google' },
  zh: { heading: 'Google 认证客户评价', readOnGoogle: '在 Google 上查看我们的评价' },
  'zh-Hant': { heading: 'Google 認證客戶評價', readOnGoogle: '在 Google 上查看我們的評價' },
  es: { heading: 'Reseña verificada de Google', readOnGoogle: 'Lee nuestras reseñas en Google' },
  fr: { heading: 'Avis Google vérifié', readOnGoogle: 'Lisez nos avis sur Google' },
  ja: { heading: 'Google認証済みレビュー', readOnGoogle: 'Googleでレビューを見る' },
  ko: { heading: 'Google 인증 리뷰', readOnGoogle: 'Google에서 리뷰 보기' },
  ar: { heading: 'مراجعة موثّقة من Google', readOnGoogle: 'اقرأ مراجعاتنا على Google' },
  fa: { heading: 'نظر تأییدشده در Google', readOnGoogle: 'نظرات ما را در Google بخوانید' },
  hi: { heading: 'सत्यापित Google समीक्षा', readOnGoogle: 'Google पर हमारी समीक्षाएँ पढ़ें' },
  pa: { heading: 'ਪ੍ਰਮਾਣਿਤ Google ਸਮੀਖਿਆ', readOnGoogle: "Google 'ਤੇ ਸਾਡੀਆਂ ਸਮੀਖਿਆਵਾਂ ਪੜ੍ਹੋ" },
  ru: { heading: 'Подтверждённый отзыв в Google', readOnGoogle: 'Читайте наши отзывы в Google' },
  tl: { heading: 'Beripikadong Google Review', readOnGoogle: 'Basahin ang aming mga review sa Google' },
  vi: { heading: 'Đánh giá đã xác minh trên Google', readOnGoogle: 'Đọc đánh giá của chúng tôi trên Google' },
};

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

interface VerifiedGoogleReviewsProps {
  reviews: ProjectReviewDisplay[];
  locale: string;
}

export default function VerifiedGoogleReviews({ reviews, locale }: VerifiedGoogleReviewsProps) {
  if (reviews.length === 0) return null;
  const t = LABELS[locale] ?? LABELS.en;

  return (
    <div className="mb-8" data-testid="verified-google-reviews">
      {reviews.map((review) => (
        <article
          key={`${review.authorName}-${review.reviewDate}`}
          className="rounded-2xl p-5 sm:p-6 relative mb-4 last:mb-0"
          style={{ boxShadow: neu(5), backgroundColor: CARD }}
        >
          <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-r-full" style={{ backgroundColor: GOLD }} />
          <div className="pl-4">
            <div className="flex items-center gap-2 mb-3">
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                {t.heading}
              </h2>
            </div>
            <div
              className="flex gap-0.5 mb-3"
              role="img"
              aria-label={`${review.rating}/5`}
            >
              {Array.from({ length: review.rating }, (_, j) => (
                <Star key={j} className="w-4 h-4" aria-hidden="true" style={{ fill: GOLD, color: GOLD }} />
              ))}
            </div>
            {/* Verbatim quote — shown in its original language on every locale. */}
            <blockquote
              lang={review.bodyLang}
              className="text-base leading-relaxed italic whitespace-pre-line mb-4"
              style={{ color: TEXT_MID }}
            >
              &ldquo;{review.body}&rdquo;
            </blockquote>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="text-sm" style={{ color: TEXT_MUTED }}>
                <span className="font-bold" style={{ color: TEXT }}>{formatReviewerName(review.authorName)}</span>
                {' · '}
                {relativeReviewDate(review.reviewDate, locale)}
              </div>
              <a
                href={review.sourceUrl ?? GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                style={{ color: TEXT_MUTED }}
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                {t.readOnGoogle}
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
