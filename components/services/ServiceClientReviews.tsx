import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { AreaReviewDisplay } from '@/lib/project-reviews';
import { GOLD, SURFACE, TEXT, TEXT_MID } from '@/lib/theme';
import ReviewQuoteCard, {
  ALL_REVIEWS_LABELS,
  SEE_PROJECT_LABELS,
} from '@/components/reviews/ReviewQuoteCard';

/**
 * "What our {service} clients say" — service-page section showing up to 3
 * verified client reviews whose linked case-study project has this
 * service_type (the service-page twin of AreaClientReviews).
 *
 * Renders nothing when the service has no project-linked reviews. Quotes are
 * verbatim (original language, `lang` attr via the shared card — NEVER
 * machine-translated) and each card links to the reviewed project's case
 * study. Labels use the self-contained 14-locale map technique
 * (VerifiedGoogleReviews / ZhTrustSignals pattern). Deliberately NO Review
 * schema markup here — the reviews' structured data lives on the project
 * pages; duplicating the same reviews on a second entity risks spam signals.
 *
 * No hooks — safe to render from ServiceDetailPage (a client component) or a
 * server component alike, matching ReviewQuoteCard's contract.
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
  if (reviews.length === 0) return null;

  const heading = (HEADING_LABELS[locale] ?? HEADING_LABELS.en).replace('{service}', serviceName);
  const seeProject = SEE_PROJECT_LABELS[locale] ?? SEE_PROJECT_LABELS.en;
  const allReviews = ALL_REVIEWS_LABELS[locale] ?? ALL_REVIEWS_LABELS.en;

  return (
    <section
      className="py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: SURFACE }}
      data-testid="service-client-reviews"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <h2 className="text-2xl font-bold" style={{ color: TEXT }}>
            {heading}
          </h2>
          <Link
            href={`/${locale}/reviews/`}
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: TEXT_MID }}
          >
            {allReviews} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className={`grid gap-6 ${reviews.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:max-w-xl'}`}>
          {reviews.map((review, idx) => (
            <ReviewQuoteCard
              // idx guards against legitimate collisions (same author + same
              // project, e.g. a follow-up review); the list is static per render.
              key={`${review.authorName}-${review.projectSlug}-${idx}`}
              review={review}
              locale={locale}
              eyebrowTag="div"
              footerExtra={
                <div className="mt-3">
                  <Link
                    href={`/${locale}/projects/${review.projectSlug}/`}
                    className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                    style={{ color: GOLD }}
                  >
                    {seeProject} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
