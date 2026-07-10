import type { ReactNode } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { GOLD, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';
import { GOOGLE_REVIEWS_URL } from '@/lib/company-config';
import { formatReviewerName, relativeReviewDate } from '@/lib/project-reviews';

/**
 * Shared presentational "verified client review" card — extracted from
 * VerifiedGoogleReviews so the project pages, area pages and the /reviews hub
 * render the exact same quote card instead of three drifting copies.
 *
 * The review body is a verbatim quote — NEVER machine-translate it. When
 * `bodyLang` doesn't match the viewer's locale we still show the original (a
 * translated quote would no longer be the client's words); `lang` on the
 * <blockquote> tells the browser/search engine the quote's real language.
 *
 * Labels use the self-contained 14-locale map technique (ZhTrustSignals
 * pattern) so the strings ship atomically with the component. No hooks —
 * usable from both server and client components.
 */

export const READ_ON_GOOGLE_LABELS: Record<string, string> = {
  en: 'Read our reviews on Google',
  zh: '在 Google 上查看我们的评价',
  'zh-Hant': '在 Google 上查看我們的評價',
  es: 'Lee nuestras reseñas en Google',
  fr: 'Lisez nos avis sur Google',
  ja: 'Googleでレビューを見る',
  ko: 'Google에서 리뷰 보기',
  ar: 'اقرأ مراجعاتنا على Google',
  fa: 'نظرات ما را در Google بخوانید',
  hi: 'Google पर हमारी समीक्षाएँ पढ़ें',
  pa: "Google 'ਤੇ ਸਾਡੀਆਂ ਸਮੀਖਿਆਵਾਂ ਪੜ੍ਹੋ",
  ru: 'Читайте наши отзывы в Google',
  tl: 'Basahin ang aming mga review sa Google',
  vi: 'Đọc đánh giá của chúng tôi trên Google',
};

const VERIFIED_GOOGLE_LABELS: Record<string, string> = {
  en: 'Verified Google Review',
  zh: 'Google 认证客户评价',
  'zh-Hant': 'Google 認證客戶評價',
  es: 'Reseña verificada de Google',
  fr: 'Avis Google vérifié',
  ja: 'Google認証済みレビュー',
  ko: 'Google 인증 리뷰',
  ar: 'مراجعة موثّقة من Google',
  fa: 'نظر تأییدشده در Google',
  hi: 'सत्यापित Google समीक्षा',
  pa: 'ਪ੍ਰਮਾਣਿਤ Google ਸਮੀਖਿਆ',
  ru: 'Подтверждённый отзыв в Google',
  tl: 'Beripikadong Google Review',
  vi: 'Đánh giá đã xác minh trên Google',
};

const TESTIMONIAL_LABELS: Record<string, string> = {
  en: 'Client Testimonial',
  zh: '客户评价',
  'zh-Hant': '客戶評價',
  es: 'Testimonio de cliente',
  fr: 'Témoignage client',
  ja: 'お客様の声',
  ko: '고객 후기',
  ar: 'شهادة عميل',
  fa: 'نظر مشتری',
  hi: 'ग्राहक प्रशंसापत्र',
  pa: 'ਗਾਹਕ ਦੀ ਰਾਏ',
  ru: 'Отзыв клиента',
  tl: 'Testimonya ng kliyente',
  vi: 'Cảm nhận của khách hàng',
};

/** Quiet "all reviews" link label (→ /reviews) shared by review surfaces. */
export const ALL_REVIEWS_LABELS: Record<string, string> = {
  en: 'All reviews',
  zh: '全部客户评价',
  'zh-Hant': '全部客戶評價',
  es: 'Todas las reseñas',
  fr: 'Tous les avis',
  ja: 'すべてのレビュー',
  ko: '전체 리뷰',
  ar: 'جميع المراجعات',
  fa: 'همه نظرات',
  hi: 'सभी समीक्षाएँ',
  pa: 'ਸਾਰੀਆਂ ਸਮੀਖਿਆਵਾਂ',
  ru: 'Все отзывы',
  tl: 'Lahat ng review',
  vi: 'Tất cả đánh giá',
};

/** "See this project" case-study link label shared by review surfaces. */
export const SEE_PROJECT_LABELS: Record<string, string> = {
  en: 'See this project',
  zh: '查看该项目案例',
  'zh-Hant': '查看該項目案例',
  es: 'Ver este proyecto',
  fr: 'Voir ce projet',
  ja: 'このプロジェクトを見る',
  ko: '이 프로젝트 보기',
  ar: 'شاهد هذا المشروع',
  fa: 'مشاهده این پروژه',
  hi: 'यह प्रोजेक्ट देखें',
  pa: 'ਇਹ ਪ੍ਰੋਜੈਕਟ ਦੇਖੋ',
  ru: 'Посмотреть этот проект',
  tl: 'Tingnan ang proyektong ito',
  vi: 'Xem dự án này',
};

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export interface QuoteCardReview {
  /** Author name exactly as written on the source review. */
  authorName: string;
  /** Star rating 1-5. */
  rating: number;
  /** Verbatim review text (or, for testimonials, a stored translation). */
  body: string;
  /** Language of `body`. */
  bodyLang: string;
  /** ISO 'YYYY-MM-DD' (month precision); omit when the date is unknown. */
  reviewDate?: string | null;
  /** Direct URL to the review on the source platform, when available. */
  sourceUrl?: string | null;
}

interface ReviewQuoteCardProps {
  review: QuoteCardReview;
  locale: string;
  /**
   * 'google' shows the "Verified Google Review" eyebrow + Google source link;
   * 'testimonial' shows a plain "Client Testimonial" eyebrow and no source
   * link (legacy testimonials rows aren't Google reviews).
   */
  kind?: 'google' | 'testimonial';
  /**
   * Heading level of the card eyebrow. The project page ships it as an <h2>
   * (existing behavior); sections that already have their own H2 pass 'div'
   * to keep the heading hierarchy clean.
   */
  eyebrowTag?: 'h2' | 'h3' | 'div';
  /** Optional extra footer row (e.g. a "See this project →" link). */
  footerExtra?: ReactNode;
}

export default function ReviewQuoteCard({
  review,
  locale,
  kind = 'google',
  eyebrowTag = 'h2',
  footerExtra,
}: ReviewQuoteCardProps) {
  const isGoogle = kind === 'google';
  const eyebrowLabels = isGoogle ? VERIFIED_GOOGLE_LABELS : TESTIMONIAL_LABELS;
  const eyebrow = eyebrowLabels[locale] ?? eyebrowLabels.en;
  const readOnGoogle = READ_ON_GOOGLE_LABELS[locale] ?? READ_ON_GOOGLE_LABELS.en;
  const EyebrowTag = eyebrowTag;
  const relativeDate = review.reviewDate ? relativeReviewDate(review.reviewDate, locale) : '';

  return (
    <article
      className="rounded-2xl p-5 sm:p-6 relative"
      style={{ boxShadow: neu(5), backgroundColor: CARD }}
    >
      <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-r-full" style={{ backgroundColor: GOLD }} />
      <div className="pl-4">
        <div className="flex items-center gap-2 mb-3">
          {isGoogle && <GoogleIcon className="w-4 h-4 shrink-0" />}
          <EyebrowTag className="text-sm font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
            {eyebrow}
          </EyebrowTag>
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
            {relativeDate && <>{' · '}{relativeDate}</>}
          </div>
          {isGoogle && (
            <a
              href={review.sourceUrl ?? GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
              style={{ color: TEXT_MUTED }}
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              {readOnGoogle}
            </a>
          )}
        </div>
        {footerExtra}
      </div>
    </article>
  );
}
