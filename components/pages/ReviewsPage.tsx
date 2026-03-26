"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Star, ExternalLink, ShieldCheck, DollarSign, Paintbrush, MessageSquare, Clock } from "lucide-react";
import type { Locale, Company, GoogleReview, GooglePlaceRating } from "@/lib/types";
import CTASection from "@/components/CTASection";
import GoogleAvatar from "@/components/home/GoogleAvatar";
import { NAVY, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from "@/lib/theme";

const INTL_LOCALE_MAP: Record<string, string> = { en: "en-US", zh: "zh-CN" };

function getRelativeTime(publishTime: string, locale: string): string {
  if (!publishTime) return "";
  const timestamp = new Date(publishTime).getTime();
  if (isNaN(timestamp)) return "";
  const MS_PER_DAY = 86_400_000;
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / MS_PER_DAY);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  const intlLocale = INTL_LOCALE_MAP[locale] || "en-US";
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });
  if (years > 0) return rtf.format(-years, "year");
  if (months > 0) return rtf.format(-months, "month");
  if (days > 0) return rtf.format(-days, "day");
  return rtf.format(0, "day");
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
  const text = locale === "zh" && review.textZh ? review.textZh : review.text;
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
}

export default function ReviewsPage({ locale, company, googleReviews }: ReviewsPageProps) {
  const t = useTranslations("reviewsPage");
  // CTA uses section-specific translations

  const reviews = useMemo(() => {
    return locale === "zh"
      ? googleReviews.reviews.filter((r) => r.textZh)
      : googleReviews.reviews;
  }, [locale, googleReviews.reviews]);

  const googleReviewUrl = "https://search.google.com/local/writereview?placeid=ChIJpwp4vkp0hlQRjT5YhM_r6xQ";

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
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-14" aria-labelledby="reviews-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5" style={{ color: GOLD }} />
            <h2 id="reviews-title" className="text-2xl font-bold" style={{ color: TEXT }}>{t("verifiedReviews")}</h2>
          </div>
          <p className="text-base mb-10" style={{ color: TEXT_MID }}>{t("verifiedSubtitle")}</p>
          {reviews.length > 0 ? (
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
          <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-colors hover:opacity-90" style={{ backgroundColor: GOLD }}>
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
