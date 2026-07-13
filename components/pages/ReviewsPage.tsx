'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star, ExternalLink, ShieldCheck, DollarSign, Paintbrush, MessageSquare, Clock } from "lucide-react";
import type { Locale, Company, GoogleReview, GooglePlaceRating } from "@/lib/types";
import CTASection from "@/components/CTASection";
import GoogleAvatar from "@/components/home/GoogleAvatar";
import GoogleIcon from "@/components/reviews/GoogleIcon";
import { NAVY, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from "@/lib/theme";
import { GOOGLE_REVIEWS_URL, GOOGLE_WRITE_REVIEW_URL } from "@/lib/company-config";
import { relativeGoogleReviewTime } from "@/lib/project-reviews";
import type { HubDisplayReview } from "@/components/reviews/ReviewsGroupSection";
import ReviewsCityGroups, { type HubCityGroupDisplay } from "@/components/pages/ReviewsCityGroups";
import ReviewsTypeGroups, { type HubTypeGroupDisplay } from "@/components/pages/ReviewsTypeGroups";

// Self-contained 14-locale label (ZhTrustSignals pattern) for the hero's
// "read all N reviews on Google" CTA. {count} = live cache userRatingCount.
const READ_ALL_GOOGLE_LABELS: Record<string, string> = {
  en: "Read all {count} reviews on Google",
  zh: "在 Google 上阅读全部 {count} 条评价",
  "zh-Hant": "在 Google 上閱讀全部 {count} 條評價",
  es: "Lee las {count} reseñas en Google",
  fr: "Lire les {count} avis sur Google",
  ja: "Googleで{count}件のレビューをすべて読む",
  ko: "Google에서 {count}개 리뷰 모두 보기",
  ar: "اقرأ جميع المراجعات الـ {count} على Google",
  fa: "خواندن همه {count} نظر در Google",
  hi: "Google पर सभी {count} समीक्षाएँ पढ़ें",
  pa: "Google 'ਤੇ ਸਾਰੀਆਂ {count} ਸਮੀਖਿਆਵਾਂ ਪੜ੍ਹੋ",
  ru: "Читать все {count} отзывов в Google",
  tl: "Basahin lahat ng {count} review sa Google",
  vi: "Đọc tất cả {count} đánh giá trên Google",
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const iconSize = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating}/5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={iconSize} aria-hidden="true" style={{ fill: i < rating ? GOLD : "#ccc", color: i < rating ? GOLD : "#ccc" }} />
      ))}
    </div>
  );
}

function ReviewCard({ review, locale }: { review: GoogleReview; locale: Locale }) {
  const t = useTranslations("reviewsPage");
  const [expanded, setExpanded] = useState(false);
  // Per-locale translated text from `review.translations?.[locale]` (populated
  // by `pnpm reviews:cache` per PR #83). EN fallback when translation absent.
  const text = review.translations?.[locale] ?? review.text;
  const isLong = text.length > 300;

  return (
    <article className="rounded-2xl p-5 sm:p-6 relative flex flex-col" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
      <div className="absolute left-0 top-5 bottom-5 w-0.5 rounded-r-full" style={{ backgroundColor: GOLD }} />
      <div className="pl-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
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
        <StarRating rating={review.rating} />
        <p className={`text-sm leading-relaxed mt-3 whitespace-pre-line ${!expanded && isLong ? "line-clamp-6" : ""}`} style={{ color: TEXT_MID }}>
          &ldquo;{text}&rdquo;
        </p>
        {isLong && (
          <button onClick={() => setExpanded((prev) => !prev)} className="text-xs font-semibold mt-2 self-start hover:underline" style={{ color: GOLD }}>
            {expanded ? (locale === "zh" ? "\u6536\u8d77" : "Show less") : (locale === "zh" ? "\u5c55\u5f00\u5168\u6587" : "Read more")}
          </button>
        )}
        {review.authorUri && (
          <a href={review.authorUri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium mt-3 hover:underline" style={{ color: TEXT_MUTED }}>
            <ExternalLink className="w-3 h-3" />
            {t("readOnGoogle")}
          </a>
        )}
      </div>
    </article>
  );
}

const TRUST_ITEMS = [
  { icon: DollarSign, titleKey: "trustItem1Title" as const, descKey: "trustItem1Desc" as const },
  { icon: Paintbrush, titleKey: "trustItem2Title" as const, descKey: "trustItem2Desc" as const },
  { icon: MessageSquare, titleKey: "trustItem3Title" as const, descKey: "trustItem3Desc" as const },
  { icon: Clock, titleKey: "trustItem4Title" as const, descKey: "trustItem4Desc" as const },
] as const;

interface ReviewsPageProps {
  locale: Locale;
  company: Company;
  googleReviews: GooglePlaceRating;
  /** Shared pool of merged/deduped project + testimonial hub reviews (#27). */
  hubReviews?: HubDisplayReview[];
  /** Merged + deduped project/testimonial reviews grouped by city (hub). */
  cityGroups?: HubCityGroupDisplay[];
  /** The same deduped reviews grouped by their project's service type. */
  typeGroups?: HubTypeGroupDisplay[];
}

export default function ReviewsPage({ locale, company, googleReviews, hubReviews = [], cityGroups = [], typeGroups = [] }: ReviewsPageProps) {
  const t = useTranslations("reviewsPage");
  // CTA uses section-specific translations

  // Show every five-star review on every locale. ReviewCard's text-rendering
  // picks the locale translation when available and falls back to EN — same
  // pattern as TestimonialsSection (Hongming Option 1 stage 2). Removing the
  // `locale === "zh"` filter closes the dedicated /reviews/ page's instance of
  // the same structural gap that cross-locale parity scan flagged (-91.4%
  // word delta on /zh/reviews/ at 2026-05-29T03:30Z scan).
  const reviews = googleReviews.reviews;

  // The Google grid holds only the reviews that SURVIVED dedupe. When every
  // cached Google reviewer has also been seeded into project_reviews, the grid
  // deduped to empty — but the hub still has those reviews in the city/type
  // sections below. Showing "No reviews available at this time." here would
  // then contradict the hero's "Read all N reviews on Google" CTA, so we hide
  // the grid section entirely in that case (#3). We only fall through to the
  // genuine empty-state when there are NO hub reviews either (a truly missing
  // cache), which keeps the honest empty message for a brand-new site.
  const hasHubReviews = cityGroups.length > 0 || typeGroups.length > 0;
  const showGoogleGrid = reviews.length > 0;
  const showGoogleEmptyState = reviews.length === 0 && !hasHubReviews;


  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t("heroTitle")}</h1>
          <p className="text-lg text-white/80 mb-8">{t("heroSubtitle")}</p>
          {googleReviews.rating > 0 && (
            <div className="inline-flex flex-col items-center rounded-2xl px-8 py-6" style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
              <div className="text-5xl font-bold text-white mb-2">{googleReviews.rating.toFixed(1)}</div>
              <StarRating rating={Math.round(googleReviews.rating)} size="lg" />
              <div className="text-sm text-white/70 mt-2">{t("basedOn", { count: googleReviews.userRatingCount })}</div>
              <div className="flex items-center gap-2 mt-3">
                <GoogleIcon className="w-5 h-5" />
                <span className="text-sm font-medium text-white">{t("googleRating")}</span>
              </div>
            </div>
          )}
          {googleReviews.userRatingCount > 0 && (
            /* Prominent "read all our reviews on Google" CTA — the cached
               payload holds only the 5 most recent reviews; the full set
               lives on the Google profile. Count is the LIVE cache value,
               never hardcoded. */
            <div className="mt-6">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors hover:opacity-90"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                <GoogleIcon className="w-5 h-5" />
                {(READ_ALL_GOOGLE_LABELS[locale] ?? READ_ALL_GOOGLE_LABELS.en).replace(
                  "{count}",
                  String(googleReviews.userRatingCount),
                )}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Grid — the Google reviews that survived hub dedupe. Hidden
          entirely when it deduped to empty but the hub still has reviews below
          (avoids the "no reviews" vs "read all N on Google" contradiction, #3);
          the honest empty state shows only when there are no hub reviews at all. */}
      {(showGoogleGrid || showGoogleEmptyState) && (
        <section className="py-14" aria-labelledby="reviews-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5" style={{ color: GOLD }} />
              <h2 id="reviews-title" className="text-2xl font-bold" style={{ color: TEXT }}>{t("verifiedReviews")}</h2>
            </div>
            <p className="text-base mb-10" style={{ color: TEXT_MID }}>{t("verifiedSubtitle")}</p>
            {showGoogleGrid ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.authorUri || review.authorName} review={review} locale={locale} />
                ))}
              </div>
            ) : (
              <p className="text-center py-12" style={{ color: TEXT_MUTED }}>{t("noReviews")}</p>
            )}
          </div>
        </section>
      )}

      {/* Client reviews by city — merged project_reviews + testimonials,
          deduped against the Google grid above (lib/reviews-hub.ts). */}
      <ReviewsCityGroups reviews={hubReviews} groups={cityGroups} locale={locale} />

      {/* Client reviews by project type — the SAME deduped reviews as the
          city section, re-grouped by their project's service_type
          (kitchen/bathroom/…). Only project-linked reviews appear here. */}
      <ReviewsTypeGroups reviews={hubReviews} groups={typeGroups} locale={locale} />

      {/* Why Trust Us */}
      <section className="py-14" style={{ backgroundColor: SURFACE_ALT }} aria-labelledby="trust-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="trust-title" className="text-2xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t("whyTrustTitle")}</h2>
          <p className="text-base text-center mb-10" style={{ color: TEXT_MID }}>{t("whyTrustSubtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titleKey} className="rounded-2xl p-5 text-center" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: GOLD_PALE }}>
                    <Icon className="w-6 h-6" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: TEXT }}>{t(item.titleKey)}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: TEXT_MID }}>{t(item.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14" aria-labelledby="faq-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-title" className="text-2xl font-bold mb-8 text-center" style={{ color: TEXT }}>FAQ</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <details key={n} className="group rounded-2xl overflow-hidden" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                <summary className="cursor-pointer p-5 text-sm font-semibold flex items-center justify-between" style={{ color: TEXT }}>
                  {t(`faq.q${n}` as "faq.q1")}
                  <span className="ml-2 text-lg transition-transform group-open:rotate-45" style={{ color: GOLD }}>+</span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                  {t(`faq.a${n}` as "faq.a1")}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Leave a Review CTA */}
      <section className="py-14" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>{t("leaveReviewTitle")}</h2>
          <p className="text-base mb-6" style={{ color: TEXT_MID }}>{t("leaveReviewSubtitle")}</p>
          <a href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-colors hover:opacity-90" style={{ backgroundColor: GOLD }}>
            <GoogleIcon className="w-5 h-5" />
            {t("leaveReviewButton")}
          </a>
        </div>
      </section>

      {/* Contact CTA */}
      <CTASection heading={t("ctaHeading")} subtitle={t("ctaSubtitle")} phone={company.phone} />
    </main>
  );
}
