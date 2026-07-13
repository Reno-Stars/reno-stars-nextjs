import { Wrench } from 'lucide-react';
import { SURFACE } from '@/lib/theme';
import ReviewsGroupSection, {
  type HubDisplayReview,
  type ReviewGroupDisplay,
} from '@/components/reviews/ReviewsGroupSection';
import { SECTION_SUBTITLE_LABELS } from '@/components/pages/ReviewsCityGroups';

/**
 * /reviews hub — merged client reviews grouped by PROJECT TYPE (kitchen /
 * bathroom / commercial / …), the second grouping dimension alongside
 * ReviewsCityGroups. Thin wrapper that maps each type group to the generic
 * {heading, headingHref} shape and delegates to the shared
 * <ReviewsGroupSection>. A review whose job spans two project types appears
 * under BOTH type groups (see lib/reviews-hub groupReviewsByServiceType). Type
 * headings link to the matching /services/<slug>/ page. Labels use the
 * self-contained 14-locale map technique.
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
  /** Indices into the shared review pool (#27). */
  reviewIndices: number[];
}

interface ReviewsTypeGroupsProps {
  /** Shared review pool the groups' indices point into. */
  reviews: HubDisplayReview[];
  groups: HubTypeGroupDisplay[];
  locale: string;
}

export default function ReviewsTypeGroups({ reviews, groups, locale }: ReviewsTypeGroupsProps) {
  if (groups.length === 0) return null;

  const displayGroups: ReviewGroupDisplay[] = groups.map((group) => ({
    heading: group.typeName,
    headingHref: group.serviceSlug ? `/${locale}/services/${group.serviceSlug}/` : null,
    reviewIndices: group.reviewIndices,
  }));

  return (
    <ReviewsGroupSection
      title={SECTION_TITLE_LABELS[locale] ?? SECTION_TITLE_LABELS.en}
      subtitle={SECTION_SUBTITLE_LABELS[locale] ?? SECTION_SUBTITLE_LABELS.en}
      icon={Wrench}
      reviews={reviews}
      groups={displayGroups}
      locale={locale}
      backgroundColor={SURFACE}
      labelledById="reviews-by-type-title"
    />
  );
}
