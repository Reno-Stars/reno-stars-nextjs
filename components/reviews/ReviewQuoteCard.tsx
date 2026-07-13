import type { ReactNode } from 'react';
import { Star, ExternalLink, BadgeCheck } from 'lucide-react';
import { GOLD, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';
import { GOOGLE_REVIEWS_URL } from '@/lib/company-config';
import { formatReviewerName, relativeReviewDate } from '@/lib/project-reviews';
import GoogleIcon from '@/components/reviews/GoogleIcon';

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

// Generic (platform-neutral) "Verified Review" eyebrow — used when the review's
// `source` is NOT Google (e.g. yelp/houzz), so we never brand a non-Google
// review with Google's logo/wording (#29). Degrades gracefully for unknown
// sources.
const VERIFIED_REVIEW_LABELS: Record<string, string> = {
  en: 'Verified Review',
  zh: '认证客户评价',
  'zh-Hant': '認證客戶評價',
  es: 'Reseña verificada',
  fr: 'Avis vérifié',
  ja: '認証済みレビュー',
  ko: '인증 리뷰',
  ar: 'مراجعة موثّقة',
  fa: 'نظر تأییدشده',
  hi: 'सत्यापित समीक्षा',
  pa: 'ਪ੍ਰਮਾਣਿਤ ਸਮੀਖਿਆ',
  ru: 'Подтверждённый отзыв',
  tl: 'Beripikadong Review',
  vi: 'Đánh giá đã xác minh',
};

/** Platform-neutral "read the source review" link label (non-Google sources). */
const READ_REVIEW_LABELS: Record<string, string> = {
  en: 'Read the review',
  zh: '查看原始评价',
  'zh-Hant': '查看原始評價',
  es: 'Leer la reseña',
  fr: "Lire l'avis",
  ja: 'レビューを見る',
  ko: '리뷰 보기',
  ar: 'اقرأ المراجعة',
  fa: 'خواندن نظر',
  hi: 'समीक्षा पढ़ें',
  pa: 'ਸਮੀਖਿਆ ਪੜ੍ਹੋ',
  ru: 'Читать отзыв',
  tl: 'Basahin ang review',
  vi: 'Đọc đánh giá',
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
  /**
   * Review platform ('google', 'yelp', …). When omitted we assume 'google'
   * (the historical + only stored value) for backward compatibility. Drives
   * platform-accurate branding: Google logo + "Verified Google Review" only
   * when 'google'; a neutral verified mark + "Verified Review" otherwise (#29).
   */
  source?: string | null;
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
  const isTestimonial = kind === 'testimonial';
  // Platform-accurate branding. A missing source is treated as 'google' (the
  // only stored value historically) so existing cards are unchanged; any other
  // source renders a neutral verified mark, never Google's logo/wording (#29).
  const source = (review.source ?? 'google').toLowerCase();
  const isGoogleSource = !isTestimonial && source === 'google';
  const isOtherSource = !isTestimonial && !isGoogleSource;

  const eyebrow = isTestimonial
    ? (TESTIMONIAL_LABELS[locale] ?? TESTIMONIAL_LABELS.en)
    : isGoogleSource
    ? (VERIFIED_GOOGLE_LABELS[locale] ?? VERIFIED_GOOGLE_LABELS.en)
    : (VERIFIED_REVIEW_LABELS[locale] ?? VERIFIED_REVIEW_LABELS.en);

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
          {isGoogleSource && <GoogleIcon className="w-4 h-4 shrink-0" />}
          {isOtherSource && <BadgeCheck className="w-4 h-4 shrink-0" aria-hidden="true" style={{ color: GOLD }} />}
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
          {/* Google source: link to the review (or the Google profile). Other
              platforms: link ONLY when we have a real source URL — never fall
              back to the Google profile for a non-Google review. */}
          {isGoogleSource && (
            <a
              href={review.sourceUrl ?? GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
              style={{ color: TEXT_MUTED }}
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              {READ_ON_GOOGLE_LABELS[locale] ?? READ_ON_GOOGLE_LABELS.en}
            </a>
          )}
          {isOtherSource && review.sourceUrl && (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
              style={{ color: TEXT_MUTED }}
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              {READ_REVIEW_LABELS[locale] ?? READ_REVIEW_LABELS.en}
            </a>
          )}
        </div>
        {footerExtra}
      </div>
    </article>
  );
}
