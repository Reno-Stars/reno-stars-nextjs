import type { AreaReviewDisplay } from '@/lib/project-reviews';
import ReviewSection from '@/components/reviews/ReviewSection';

/**
 * "What {city} clients say" — area-page section showing up to 3 verified client
 * reviews whose linked case-study project sits in this city. Thin wrapper that
 * composes the localized heading and delegates to the shared <ReviewSection>
 * (see it for the layout / verbatim-quote rules); the service-page twin is
 * ServiceClientReviews.
 */

const HEADING_LABELS: Record<string, string> = {
  en: 'What {city} clients say',
  zh: '{city}客户怎么说',
  'zh-Hant': '{city}客戶怎麼說',
  es: 'Lo que dicen los clientes de {city}',
  fr: 'Ce que disent nos clients à {city}',
  ja: '{city}のお客様の声',
  ko: '{city} 고객 후기',
  ar: 'ماذا يقول عملاؤنا في {city}',
  fa: 'نظرات مشتریان ما در {city}',
  hi: '{city} के ग्राहक क्या कहते हैं',
  pa: '{city} ਦੇ ਗਾਹਕ ਕੀ ਕਹਿੰਦੇ ਹਨ',
  ru: 'Что говорят клиенты в {city}',
  tl: 'Ano ang sabi ng mga kliyente sa {city}',
  vi: 'Khách hàng ở {city} nói gì',
};

interface AreaClientReviewsProps {
  reviews: AreaReviewDisplay[];
  /** Localized city display name (already picked for the current locale). */
  cityName: string;
  locale: string;
}

export default function AreaClientReviews({ reviews, cityName, locale }: AreaClientReviewsProps) {
  const heading = (HEADING_LABELS[locale] ?? HEADING_LABELS.en).replace('{city}', cityName);
  return <ReviewSection heading={heading} reviews={reviews} locale={locale} testId="area-client-reviews" />;
}
