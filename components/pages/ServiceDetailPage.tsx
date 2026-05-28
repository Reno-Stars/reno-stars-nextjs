'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceArea, ServiceType } from '@/lib/types';
import { getLocalizedService, getAllProjectsLocalized } from '@/lib/data';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import { Link } from '@/navigation';
import { getLocalizedArea } from '@/lib/data/areas';
import {
  NAVY, GOLD_PALE, GOLD_ICON_FILTER, SURFACE, SURFACE_ALT, TEXT, TEXT_MID, CARD, neu,
} from '@/lib/theme';
import { renderProseHtml } from '@/lib/markdown-html';

interface FAQ {
  question: string;
  answer: string;
}

/**
 * Mapping from service-slug → corresponding /guides/<slug>/ cost-guide URL.
 *
 * The cost-guide pages exist under app/[locale]/guides/<slug>/page.tsx and sit at
 * striking-distance positions (pos 8-14) for high-impression cost queries:
 *   "kitchen renovation cost", "bathroom renovation cost", "renovation costs vancouver",
 *   "average cost of kitchen remodel", "vanity renovation cost", etc.
 *
 * Cross-linking from the matching service page passes internal-link equity to lift
 * the cost-guides into top-7. Only services with a guide here render the cross-link
 * section in ServiceDetailPage; others (`flooring`, `painting`) currently have no
 * dedicated guide and will not render a dead link.
 *
 * Per the 2026-05-27T2045Z corrected diagnostic in the hub repo
 * (data/seo-agent-diagnostics/2026-05-27T2045Z-striking-distance-cluster-...) —
 * internal-link lift from related-traffic pages is the recommended SEO approach
 * (option 4 of that diagnostic).
 *
 * To add a new mapping: add the kebab-case service-slug here pointing at the matching
 * /guides/.../page.tsx URL. Keep the values as literal string literals so the next-intl
 * Link's typed-route assertion in ServiceDetailPage continues to type-check.
 */
const COST_GUIDE_BY_SERVICE_SLUG: Partial<Record<ServiceType, string>> = {
  kitchen: '/guides/kitchen-renovation-cost-vancouver',
  bathroom: '/guides/bathroom-renovation-cost-vancouver',
  basement: '/guides/basement-renovation-cost-vancouver',
  'whole-house': '/guides/whole-house-renovation-cost-vancouver',
  cabinet: '/guides/cabinet-refinishing-cost-vancouver',
  commercial: '/guides/commercial-renovation-cost-vancouver',
};

interface ServiceDetailPageProps {
  locale: Locale;
  serviceSlug: ServiceType;
  company: Company;
  service: Service;
  areas?: ServiceArea[];
  faqs?: FAQ[];
  googleRating?: number;
  googleReviewCount?: number;
}

// Per-locale copy for the Cost Guide cross-link section. Only render when an entry
// exists for the current locale — avoids the PR #69 raw-key-leak class of bug
// (where next-intl returns the namespaced key on miss). Locales covered: the same
// 8 that the AnswerBlock i18n backfill landed (en/zh/zh-Hant/ja/ko/es/fr/ru); other
// locales gracefully skip the section until proper translations land.
const COST_GUIDE_LINK_COPY: Partial<Record<Locale, { heading: string; subtitle: string; cta: string }>> = {
  en: {
    heading: 'See the {service} cost guide',
    subtitle: 'Real Vancouver pricing tiers, project examples, and what drives cost — all in one place.',
    cta: 'View cost guide',
  },
  zh: {
    heading: '查看{service}费用指南',
    subtitle: '真实的温哥华价位分层、项目案例与费用驱动因素一站汇总。',
    cta: '查看费用指南',
  },
  'zh-Hant': {
    heading: '查看{service}費用指南',
    subtitle: '真實的溫哥華價位分層、項目案例與費用驅動因素一站匯總。',
    cta: '查看費用指南',
  },
  ja: {
    heading: '{service}の費用ガイドを見る',
    subtitle: 'バンクーバーの実勢価格帯、施工事例、費用の主な決定要因を一つにまとめて掲載。',
    cta: '費用ガイドを見る',
  },
  ko: {
    heading: '{service} 비용 가이드 보기',
    subtitle: '밴쿠버 실제 가격대, 프로젝트 사례, 비용 결정 요인을 한 곳에 정리.',
    cta: '비용 가이드 보기',
  },
  es: {
    heading: 'Ver la guía de costos de {service}',
    subtitle: 'Niveles de precios reales de Vancouver, ejemplos de proyectos y los factores que más influyen en el costo, todo en un solo lugar.',
    cta: 'Ver guía de costos',
  },
  fr: {
    heading: 'Consulter le guide des coûts {service}',
    subtitle: 'Tranches de prix réelles à Vancouver, exemples de projets et facteurs qui influencent le coût, regroupés au même endroit.',
    cta: 'Voir le guide des coûts',
  },
  ru: {
    heading: 'Смотреть гид по стоимости: {service}',
    subtitle: 'Реальные ценовые уровни Ванкувера, примеры проектов и факторы, влияющие на стоимость — всё в одном месте.',
    cta: 'Открыть гид по стоимости',
  },
};

export default function ServiceDetailPage({ locale, serviceSlug, company, service, areas = [], faqs = [], googleRating, googleReviewCount }: ServiceDetailPageProps) {
  const t = useTranslations();

  const localizedService = useMemo(() => getLocalizedService(service, locale), [service, locale]);
  const costGuideCopy = COST_GUIDE_LINK_COPY[locale];
  const allProjects = useMemo(() => getAllProjectsLocalized(locale), [locale]);
  const relatedProjects = useMemo(() => allProjects.filter((p) => p.service_type === serviceSlug).slice(0, 3), [allProjects, serviceSlug]);
  const benefits = localizedService.benefits && localizedService.benefits.length > 0
    ? localizedService.benefits
    : [
        t('serviceBenefits.freeConsultation'),
        t('serviceBenefits.licensedInsured'),
        t('serviceBenefits.coverageAndWarranty'),
        t('serviceBenefits.experience', { years: company.yearsExperience }),
        t('serviceBenefits.rating'),
        t('serviceBenefits.projectsDone'),
      ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        {service.image && (
          <div className="absolute inset-0 opacity-20">
            <OptimizedImage
              src={service.image}
              alt={localizedService.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { href: '/services', label: t('nav.services') },
            { label: localizedService.title },
          ]} />
          <div className="flex items-start gap-6">
            {service.icon && (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: GOLD_PALE }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={service.icon} alt="" className="w-8 h-8" style={{ filter: GOLD_ICON_FILTER }} />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {localizedService.title}
              </h1>
              {/* Hero subtitle uses the short description only — the long-form
                  marketing/SEO copy is rendered as prose further down. */}
              <p className="text-lg text-white/70 max-w-2xl">
                {localizedService.description}
              </p>
              {/* Trust strip — GBP-friendly language to strengthen Map-Pack
                  matching for "{service} remodeler in Vancouver" queries. */}
              {googleRating !== undefined && googleReviewCount !== undefined && googleReviewCount > 0 && (
                <div className="mt-5 inline-flex items-center gap-3 flex-wrap text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <span aria-hidden style={{ color: '#FFD166' }}>{'★'.repeat(Math.round(googleRating))}</span>
                  <span className="font-semibold">{t('areas.trustStripPrefix', { service: localizedService.title })}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>· {t('areas.trustStripReviews', { rating: googleRating.toFixed(1), count: googleReviewCount })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Long-form description rendered as prose. Accepts markdown OR HTML;
          heavy SEO content (pricing tables, project examples, included scope)
          lives here so the hero stays readable. */}
      {localizedService.long_description && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg max-w-none prose-headings:text-[#1B365D] prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-1 prose-strong:text-[#1B365D]"
              style={{ color: TEXT_MID }}
              dangerouslySetInnerHTML={{ __html: renderProseHtml(localizedService.long_description) }}
            />
          </div>
        </section>
      )}

      {/* Service Tags */}
      {localizedService.tags && localizedService.tags.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
              {t('section.whatWeDo')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {localizedService.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('section.whyUs')}
          </h2>
          <BenefitList benefits={benefits} />
        </div>
      </section>

      <RelatedProjectsSection
        heading={t('section.ourProjects')}
        projects={relatedProjects}
        categorySlug={serviceSlug}
      />

      {/* Cost Guide cross-link — surfaces the matching /guides/<service>-renovation-cost-vancouver/ page
          to (a) help the user answer "what does this cost?" in-context, (b) pass internal-link equity to
          cost-guide pages that GSC shows at striking-distance pos 8-14 for high-impression queries
          ("kitchen renovation cost", "bathroom renovation cost", etc.). Per the 2026-05-27T2045Z
          corrected diagnostic on the cost-cluster cluster, internal-link lift from related-traffic pages
          is the recommended approach to move these pages into top-7. Only renders when serviceSlug has a
          known guide mapping (avoids dead links on services without a guide page). */}
      {COST_GUIDE_BY_SERVICE_SLUG[serviceSlug] && costGuideCopy && (
        <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ backgroundColor: CARD, boxShadow: neu(3) }}>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: NAVY }}>
                  {costGuideCopy.heading.replace('{service}', localizedService.title)}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                  {costGuideCopy.subtitle}
                </p>
              </div>
              <Link
                href={COST_GUIDE_BY_SERVICE_SLUG[serviceSlug] as '/guides/kitchen-renovation-cost-vancouver'}
                className="inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105 shrink-0"
                style={{ backgroundColor: SURFACE, boxShadow: neu(), color: NAVY }}
              >
                {costGuideCopy.cta}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Areas We Serve */}
      {areas.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('section.areasWeServe')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {areas.map((area) => {
                const localizedArea = getLocalizedArea(area, locale);
                return (
                  <Link
                    key={area.slug}
                    href={`/services/${serviceSlug}/${area.slug}`}
                    className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                  >
                    {localizedArea.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: NAVY }}>
              {t('faq.title')}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="rounded-xl p-5 group" style={{ backgroundColor: CARD, boxShadow: neu(2) }}>
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between" style={{ color: NAVY }}>
                    {faq.question}
                    <span className="ml-2 text-lg transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        heading={t('services.getQuoteForService', { service: localizedService.title })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        bg={SURFACE}
        phone={company.phone}
      />
    </div>
  );
}
