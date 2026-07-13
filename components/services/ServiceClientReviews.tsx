import type { AreaReviewDisplay } from '@/lib/project-reviews';
import ReviewSection from '@/components/reviews/ReviewSection';

/**
 * "What our {service} clients say" — service-page section showing up to 3
 * verified client reviews whose linked case-study project has this
 * service_type. Thin wrapper that composes the localized heading and delegates
 * to the shared <ReviewSection> (see it for the layout / verbatim-quote rules);
 * the area-page twin is AreaClientReviews.
 */

// {service} is the already-localized service title (e.g. "Kitchen
// Renovation" / "厨房翻新"), so each label composes around a noun phrase.
const HEADING_LABELS: Record<string, string> = {
  en: 'What our {service} clients say',
  zh: '我们的{service}客户怎么说',
  'zh-Hant': '我們的{service}客戶怎麼說',
  es: 'Lo que dicen nuestros clientes de {service}',
  fr: 'Ce que disent nos clients — {service}',
  ja: '{service}のお客様の声',
  ko: '{service} 고객 후기',
  ar: 'ماذا يقول عملاؤنا عن {service}',
  fa: 'نظرات مشتریان ما درباره {service}',
  hi: '{service} के हमारे ग्राहक क्या कहते हैं',
  pa: '{service} ਦੇ ਸਾਡੇ ਗਾਹਕ ਕੀ ਕਹਿੰਦੇ ਹਨ',
  ru: 'Что говорят наши клиенты: {service}',
  tl: 'Ano ang sabi ng aming mga kliyente sa {service}',
  vi: 'Khách hàng {service} của chúng tôi nói gì',
};

interface ServiceClientReviewsProps {
  reviews: AreaReviewDisplay[];
  /** Localized service display name (already picked for the current locale). */
  serviceName: string;
  locale: string;
}

export default function ServiceClientReviews({ reviews, serviceName, locale }: ServiceClientReviewsProps) {
  const heading = (HEADING_LABELS[locale] ?? HEADING_LABELS.en).replace('{service}', serviceName);
  return <ReviewSection heading={heading} reviews={reviews} locale={locale} testId="service-client-reviews" />;
}
