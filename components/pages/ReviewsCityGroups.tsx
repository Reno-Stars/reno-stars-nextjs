import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { GOLD, SURFACE_ALT, TEXT, TEXT_MID } from '@/lib/theme';
import ReviewQuoteCard, { SEE_PROJECT_LABELS } from '@/components/reviews/ReviewQuoteCard';

/**
 * /reviews hub — merged client reviews grouped by city.
 *
 * Groups arrive pre-merged and pre-deduped from the server page (see
 * lib/reviews-hub.ts): project-linked verified reviews plus legacy
 * testimonials, one group per city, biggest group first. Project-linked cards
 * link to their case study; city headings link to the city's area page.
 * Labels use the self-contained 14-locale map technique. No hooks.
 */

const SECTION_TITLE_LABELS: Record<string, string> = {
  en: 'Client Reviews by City',
  zh: '按城市查看客户评价',
  'zh-Hant': '按城市查看客戶評價',
  es: 'Reseñas de clientes por ciudad',
  fr: 'Avis clients par ville',
  ja: '都市別のお客様レビュー',
  ko: '도시별 고객 리뷰',
  ar: 'مراجعات العملاء حسب المدينة',
  fa: 'نظرات مشتریان بر اساس شهر',
  hi: 'शहर के अनुसार ग्राहक समीक्षाएँ',
  pa: 'ਸ਼ਹਿਰ ਅਨੁਸਾਰ ਗਾਹਕ ਸਮੀਖਿਆਵਾਂ',
  ru: 'Отзывы клиентов по городам',
  tl: 'Mga review ng kliyente ayon sa lungsod',
  vi: 'Đánh giá của khách hàng theo thành phố',
};

// Copy is deliberately conditional ("when the project is in our portfolio…"):
// testimonial cards and unlinked reviews have no case-study link, so an
// unconditional "each one links" claim would be factually wrong on the page.
// Exported: ReviewsTypeGroups shares the same subtitle (same conditional
// truth applies — a linked-but-unpublished project's card has no slug link).
export const SECTION_SUBTITLE_LABELS: Record<string, string> = {
  en: 'Verbatim reviews from real clients — when the reviewed project is in our portfolio, the review links to the full case study.',
  zh: '来自真实客户的原文评价——若项目已收录在案例库中，评价会链接到对应的项目案例。',
  'zh-Hant': '來自真實客戶的原文評價——若項目已收錄在案例庫中，評價會連結到對應的項目案例。',
  es: 'Reseñas textuales de clientes reales — cuando el proyecto está en nuestro portafolio, la reseña enlaza al caso de estudio real.',
  fr: "Avis textuels de clients réels — lorsque le projet figure dans notre portfolio, l'avis renvoie à l'étude de cas réelle.",
  ja: '実際のお客様による原文レビュー。プロジェクトがポートフォリオに掲載されている場合は、実際の事例ページにリンクしています。',
  ko: '실제 고객의 원문 리뷰 — 해당 프로젝트가 포트폴리오에 있는 경우 실제 사례 페이지로 연결됩니다.',
  ar: 'مراجعات حرفية من عملاء حقيقيين — عندما يكون المشروع ضمن أعمالنا، ترتبط المراجعة بدراسة الحالة الحقيقية.',
  fa: 'نظرات عینی مشتریان واقعی — اگر پروژه در نمونه‌کارهای ما باشد، نظر به مطالعه موردی واقعی پیوند دارد.',
  hi: 'वास्तविक ग्राहकों की मूल समीक्षाएँ — जब प्रोजेक्ट हमारे पोर्टफोलियो में हो, तो समीक्षा असली केस स्टडी से जुड़ती है।',
  pa: 'ਅਸਲ ਗਾਹਕਾਂ ਦੀਆਂ ਮੂਲ ਸਮੀਖਿਆਵਾਂ — ਜਦੋਂ ਪ੍ਰੋਜੈਕਟ ਸਾਡੇ ਪੋਰਟਫੋਲੀਓ ਵਿੱਚ ਹੋਵੇ, ਤਾਂ ਸਮੀਖਿਆ ਅਸਲ ਕੇਸ ਸਟੱਡੀ ਨਾਲ ਜੁੜਦੀ ਹੈ।',
  ru: 'Дословные отзывы реальных клиентов — если проект есть в нашем портфолио, отзыв ведёт к реальному кейсу.',
  tl: 'Verbatim na mga review mula sa mga totoong kliyente — kapag nasa portfolio namin ang proyekto, naka-link ang review sa totoong case study.',
  vi: 'Đánh giá nguyên văn từ khách hàng thực — khi dự án có trong hồ sơ của chúng tôi, đánh giá sẽ liên kết đến dự án thực tế.',
};

const OTHER_CITY_LABELS: Record<string, string> = {
  en: 'Greater Vancouver',
  zh: '大温哥华地区',
  'zh-Hant': '大溫哥華地區',
  es: 'Gran Vancouver',
  fr: 'Grand Vancouver',
  ja: 'グレーターバンクーバー',
  ko: '광역 밴쿠버',
  ar: 'فانكوفر الكبرى',
  fa: 'ونکوور بزرگ',
  hi: 'ग्रेटर वैंकूवर',
  pa: 'ਗ੍ਰੇਟਰ ਵੈਨਕੂਵਰ',
  ru: 'Большой Ванкувер',
  tl: 'Greater Vancouver',
  vi: 'Greater Vancouver',
};

/** One review in a city group, already resolved for the current locale. */
export interface HubDisplayReview {
  authorName: string;
  rating: number;
  body: string;
  bodyLang: string;
  reviewDate: string | null;
  sourceUrl: string | null;
  projectSlug: string | null;
  kind: 'project' | 'testimonial';
}

export interface HubCityGroupDisplay {
  /** Localized city display name ('' for the unknown-city group). */
  cityName: string;
  /** Area-page slug for the city heading link, when the city is served. */
  areaSlug: string | null;
  reviews: HubDisplayReview[];
}

interface ReviewsCityGroupsProps {
  groups: HubCityGroupDisplay[];
  locale: string;
}

export default function ReviewsCityGroups({ groups, locale }: ReviewsCityGroupsProps) {
  if (groups.length === 0) return null;

  const title = SECTION_TITLE_LABELS[locale] ?? SECTION_TITLE_LABELS.en;
  const subtitle = SECTION_SUBTITLE_LABELS[locale] ?? SECTION_SUBTITLE_LABELS.en;
  const otherCity = OTHER_CITY_LABELS[locale] ?? OTHER_CITY_LABELS.en;
  const seeProject = SEE_PROJECT_LABELS[locale] ?? SEE_PROJECT_LABELS.en;

  return (
    <section className="py-14" style={{ backgroundColor: SURFACE_ALT }} aria-labelledby="reviews-by-city-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5" style={{ color: GOLD }} aria-hidden="true" />
          <h2 id="reviews-by-city-title" className="text-2xl font-bold" style={{ color: TEXT }}>{title}</h2>
        </div>
        <p className="text-base mb-10" style={{ color: TEXT_MID }}>{subtitle}</p>

        {groups.map((group) => {
          const cityLabel = group.cityName || otherCity;
          return (
            <div key={cityLabel} className="mb-10 last:mb-0">
              <h3 className="text-lg font-bold mb-4" style={{ color: TEXT }}>
                {group.areaSlug ? (
                  <Link href={`/${locale}/areas/${group.areaSlug}/`} className="hover:underline" style={{ color: TEXT }}>
                    {cityLabel}
                  </Link>
                ) : (
                  cityLabel
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
          );
        })}
      </div>
    </section>
  );
}
