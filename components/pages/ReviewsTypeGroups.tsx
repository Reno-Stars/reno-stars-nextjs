import { ArrowRight, Wrench } from 'lucide-react';
import Link from 'next/link';
import { GOLD, SURFACE, TEXT, TEXT_MID } from '@/lib/theme';
import ReviewQuoteCard, { SEE_PROJECT_LABELS } from '@/components/reviews/ReviewQuoteCard';
import { SECTION_SUBTITLE_LABELS } from '@/components/pages/ReviewsCityGroups';
import type { HubDisplayReview } from '@/components/pages/ReviewsCityGroups';

/**
 * /reviews hub — merged client reviews grouped by PROJECT TYPE (kitchen /
 * bathroom / commercial / …), the second grouping dimension alongside
 * ReviewsCityGroups.
 *
 * Groups arrive pre-merged and pre-deduped from the server page (see
 * lib/reviews-hub.ts groupReviewsByServiceType): only reviews whose linked
 * project has a service_type appear here — unlinked reviews and testimonials
 * keep appearing only where they already do. Type headings link to the
 * matching /services/<slug>/ page (mirroring the city → area-page links);
 * project-linked cards link to their case study. Labels use the
 * self-contained 14-locale map technique. No hooks. Deliberately NO Review
 * schema markup — it lives on the project pages only (duplicating the same
 * reviews on a second entity risks spam signals).
 */

const SECTION_TITLE_LABELS: Record<string, string> = {
  en: 'Client Reviews by Project Type',
  zh: '按项目类型查看客户评价',
  'zh-Hant': '按項目類型查看客戶評價',
  es: 'Reseñas de clientes por tipo de proyecto',
  fr: 'Avis clients par type de projet',
  ja: 'プロジェクトタイプ別のお客様レビュー',
  ko: '프로젝트 유형별 고객 리뷰',
  ar: 'مراجعات العملاء حسب نوع المشروع',
  fa: 'نظرات مشتریان بر اساس نوع پروژه',
  hi: 'प्रोजेक्ट प्रकार के अनुसार ग्राहक समीक्षाएँ',
  pa: 'ਪ੍ਰੋਜੈਕਟ ਕਿਸਮ ਅਨੁਸਾਰ ਗਾਹਕ ਸਮੀਖਿਆਵਾਂ',
  ru: 'Отзывы клиентов по типу проекта',
  tl: 'Mga review ng kliyente ayon sa uri ng proyekto',
  vi: 'Đánh giá của khách hàng theo loại dự án',
};

export interface HubTypeGroupDisplay {
  /** Localized type display name (the matching service's title). */
  typeName: string;
  /** Service-page slug for the type heading link, when the page is public. */
  serviceSlug: string | null;
  reviews: HubDisplayReview[];
}

interface ReviewsTypeGroupsProps {
  groups: HubTypeGroupDisplay[];
  locale: string;
}

export default function ReviewsTypeGroups({ groups, locale }: ReviewsTypeGroupsProps) {
  if (groups.length === 0) return null;

  const title = SECTION_TITLE_LABELS[locale] ?? SECTION_TITLE_LABELS.en;
  const subtitle = SECTION_SUBTITLE_LABELS[locale] ?? SECTION_SUBTITLE_LABELS.en;
  const seeProject = SEE_PROJECT_LABELS[locale] ?? SEE_PROJECT_LABELS.en;

  return (
    <section className="py-14" style={{ backgroundColor: SURFACE }} aria-labelledby="reviews-by-type-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
          <h2 id="reviews-by-type-title" className="text-2xl font-bold" style={{ color: TEXT }}>{title}</h2>
        </div>
        <p className="text-base mb-10" style={{ color: TEXT_MID }}>{subtitle}</p>

        {groups.map((group) => (
          <div key={group.typeName} className="mb-10 last:mb-0">
            <h3 className="text-lg font-bold mb-4" style={{ color: TEXT }}>
              {group.serviceSlug ? (
                <Link href={`/${locale}/services/${group.serviceSlug}/`} className="hover:underline" style={{ color: TEXT }}>
                  {group.typeName}
                </Link>
              ) : (
                group.typeName
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.reviews.map((review, idx) => (
                <ReviewQuoteCard
                  // idx guards against legitimate collisions (same author +
                  // same month-precision date); the list is static per render.
                  key={`${review.authorName}-${review.reviewDate ?? ''}-${idx}`}
                  review={review}
                  locale={locale}
                  kind={review.kind === 'testimonial' ? 'testimonial' : 'google'}
                  eyebrowTag="div"
                  footerExtra={
                    review.projectSlug ? (
                      <div className="mt-3">
                        <Link
                          href={`/${locale}/projects/${review.projectSlug}/`}
                          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                          style={{ color: GOLD }}
                        >
                          {seeProject} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      </div>
                    ) : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
