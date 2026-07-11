'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceArea, ServiceType } from '@/lib/types';
import type { AreaReviewDisplay } from '@/lib/project-reviews';
import { getLocalizedService, getAllProjectsLocalized } from '@/lib/data';
import CTASection from '@/components/CTASection';
import ZhTrustLine from '@/components/ZhTrustSignals';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import ServiceClientReviews from '@/components/services/ServiceClientReviews';
import { Link } from '@/navigation';
import { getLocalizedArea } from '@/lib/data/areas';
import {
  NAVY, GOLD, GOLD_PALE, GOLD_ICON_FILTER, SURFACE, SURFACE_ALT, TEXT, TEXT_MID, CARD, neu,
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
// 2026-06-25: Top city blog post slugs per service. Shown in the "Areas We
// Serve" section to pass PageRank from the generic service page to city cluster
// blog posts and provide a crawlable hub for "[service] renovation [city]".
// Ordered by estimated search volume (Vancouver > Burnaby > Richmond > Surrey…).
const SERVICE_CITY_BLOG_LINKS: Partial<Record<ServiceType, Array<{ city: string; slug: string }>>> = {
  kitchen: [
    { city: 'Vancouver', slug: 'kitchen-renovation-vancouver-bc-2026' },
    { city: 'Burnaby', slug: 'kitchen-renovation-burnaby-2026' },
    { city: 'Richmond', slug: 'kitchen-renovation-richmond-bc-2026' },
    { city: 'Surrey', slug: 'kitchen-renovation-surrey-bc-2026' },
    { city: 'Coquitlam', slug: 'kitchen-renovation-coquitlam-bc-2026' },
    { city: 'North Vancouver', slug: 'kitchen-renovation-north-vancouver-2026' },
    { city: 'West Vancouver', slug: 'kitchen-renovation-west-vancouver-2026' },
    { city: 'Langley', slug: 'kitchen-renovation-langley-bc-2026' },
  ],
  bathroom: [
    { city: 'Vancouver', slug: 'average-bathroom-renovation-cost-vancouver' },
    { city: 'Burnaby', slug: 'burnaby-bathroom-renovation-guide-2026' },
    { city: 'Richmond', slug: 'bathroom-renovation-cost-richmond-bc-2026' },
    { city: 'Surrey', slug: 'bathroom-renovation-surrey-bc-2026' },
    { city: 'Coquitlam', slug: 'bathroom-renovation-coquitlam-bc-2026' },
    { city: 'North Vancouver', slug: 'bathroom-renovations-north-vancouver-2026' },
    { city: 'West Vancouver', slug: 'bathroom-renovations-west-vancouver-2026' },
    { city: 'Langley', slug: 'bathroom-renovation-langley-2026' },
  ],
  'accessible-bathroom': [
    { city: 'Vancouver', slug: 'average-bathroom-renovation-cost-vancouver' },
    { city: 'Burnaby', slug: 'burnaby-bathroom-renovation-guide-2026' },
    { city: 'Richmond', slug: 'bathroom-renovation-cost-richmond-bc-2026' },
    { city: 'Surrey', slug: 'bathroom-renovation-surrey-bc-2026' },
    { city: 'North Vancouver', slug: 'bathroom-renovations-north-vancouver-2026' },
    { city: 'West Vancouver', slug: 'bathroom-renovations-west-vancouver-2026' },
  ],
  basement: [
    { city: 'Vancouver', slug: 'basement-renovation-vancouver-complete-guide' },
    { city: 'Burnaby', slug: 'basement-renovations-burnaby-2026' },
    { city: 'Richmond', slug: 'basement-renovation-richmond-bc-2026' },
    { city: 'Surrey', slug: 'basement-renovations-surrey' },
    { city: 'Coquitlam', slug: 'basement-renovations-coquitlam-2026' },
    { city: 'North Vancouver', slug: 'basement-renovations-north-vancouver' },
    { city: 'West Vancouver', slug: 'basement-renovation-west-vancouver-2026' },
    { city: 'Langley', slug: 'basement-renovations-langley' },
  ],
  'whole-house': [
    { city: 'Vancouver', slug: 'vancouver-home-renovation-guide-2026' },
    { city: 'Burnaby', slug: 'burnaby-home-renovation-guide-2026' },
    { city: 'Richmond', slug: 'richmond-home-renovation-guide-2026' },
    { city: 'Surrey', slug: 'surrey-home-renovation-guide-2026' },
    { city: 'Coquitlam', slug: 'coquitlam-home-renovation-guide-2026' },
    { city: 'North Vancouver', slug: 'north-vancouver-home-renovation-guide-2026' },
    { city: 'West Vancouver', slug: 'west-vancouver-home-renovation-guide-2026' },
    { city: 'Langley', slug: 'langley-home-renovation-guide-2026' },
    { city: 'Delta', slug: 'delta-home-renovation-guide-2026' },
    { city: 'Maple Ridge', slug: 'maple-ridge-home-renovation-guide-2026' },
    { city: 'New Westminster', slug: 'new-westminster-home-renovation-guide-2026' },
    { city: 'Port Coquitlam', slug: 'port-coquitlam-home-renovation-guide-2026' },
    { city: 'Port Moody', slug: 'port-moody-home-renovation-guide-2026' },
    { city: 'White Rock', slug: 'white-rock-home-renovation-guide-2026' },
  ],
};

const COST_GUIDE_BY_SERVICE_SLUG: Partial<Record<ServiceType, string>> = {
  kitchen: '/guides/kitchen-renovation-cost-vancouver',
  bathroom: '/guides/bathroom-renovation-cost-vancouver',
  basement: '/guides/basement-renovation-cost-vancouver',
  'whole-house': '/guides/whole-house-renovation-cost-vancouver',
  cabinet: '/guides/cabinet-refinishing-cost-vancouver',
  commercial: '/guides/commercial-renovation-cost-vancouver',
  // Note: a `flooring` mapping was added in PR #77 (commit 8f2477c) pointing
  // at /blog/hardwood-flooring-vancouver-installation-cost-2026 — but
  // /services/flooring/ does NOT exist in the services DB (404), so the
  // mapping was unreachable dead code. Removed in this PR's fix-forward.
  // If a flooring service page is added to the DB later, restore the entry.
};

/**
 * Service-slug → /X-renovation-near-me/ programmatic landing page. Added on
 * the seo/daily-2026-06-02 daily branch after a 2026-05-31 route-inbound
 * audit found the four `*-renovation-near-me/` pages (kitchen, bathroom,
 * basement, whole-house) had ZERO body-content inbound links site-wide.
 * These pages are EXPLICITLY designed for high-intent "X renovation near
 * me" search queries — leaving them un-linked from the service-page cluster
 * was a major SEO gap.
 *
 * ServiceDetailPage is the highest-equity surface to link from (9 services
 * × 14 locales). The /<X>-renovation-near-me/ page is the topical twin of
 * the /services/<X>/ page (same service, different search-intent framing),
 * so cross-linking them passes maximum PageRank equity.
 *
 * Only the 4 mapped slugs render a link. cabinet + commercial don't have
 * matching near-me pages (lower local-search demand).
 *
 * To add a mapping: pair the kebab-case service-slug with the matching
 * /<X>-renovation-near-me/ URL literal. Keep values as literal string
 * literals so the next-intl Link's typed-route assertion type-checks.
 */
const NEAR_ME_BY_SERVICE_SLUG: Partial<Record<ServiceType, string>> = {
  kitchen: '/kitchen-renovation-near-me',
  bathroom: '/bathroom-renovation-near-me',
  basement: '/basement-renovation-near-me',
  'whole-house': '/whole-house-renovation-near-me',
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
  /**
   * Optional list of all services (from DB) for rendering a Related Services
   * cross-link section. When provided, the page emits a 6-chip grid linking
   * to up to 6 sibling services (excluding `serviceSlug`), giving body-level
   * internal-link equity to the service cluster — important because nav-area
   * service links (header/footer) carry less PageRank weight than body-content
   * links. Closes a 2026-05-31 audit finding (header was the only inbound
   * surface from each /services/<x>/ page to other services).
   */
  allServices?: Service[];
  /**
   * Verified client reviews whose linked case-study project has this
   * service_type (≤3, from getReviewsByServiceType). Mirrors AreaPage's
   * `cityClientReviews`. Empty/omitted → the section renders nothing.
   */
  clientReviews?: AreaReviewDisplay[];
  /**
   * Optional code-driven H1 that wins over `service.title_en`. Used for
   * EN-only geo-anchoring on service pages where GSC shows striking-
   * distance ranking for "{service} renovation vancouver" queries but
   * the H1 lacks any geo modifier (e.g. basement service page at pos
   * 13-19 / 373 imp combined). Mirrors the same-named prop on AreaPage.
   */
  h1Override?: string;
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

export default function ServiceDetailPage({ locale, serviceSlug, company, service, areas = [], faqs = [], googleRating, googleReviewCount, allServices, clientReviews = [], h1Override }: ServiceDetailPageProps) {
  const t = useTranslations();
  const tCostGuides = useTranslations('costGuidesSection');

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
                <img src={service.icon} alt={`${localizedService.title} service icon`} className="w-8 h-8" style={{ filter: GOLD_ICON_FILTER }} />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {h1Override || localizedService.title}
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
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>·</span>
                  {/* Made the existing rating+count text a clickable /reviews/ link.
                      Pre-fix: ServiceDetailPage had ZERO references to /reviews/
                      anywhere — 0 body-content inbound links to the social-proof
                      money page from the ~9 services × 14 locales = 126 surfaces.
                      Reviews drive CTR + conversion-rate for renovation contractors
                      (industry-standard 30-50% lift on quote-form completion when
                      review-count is visible above the fold and clickable).
                      Underline-on-hover keeps the trust-strip visual intact while
                      surfacing the clickable affordance. */}
                  <Link
                    href="/reviews"
                    className="hover:underline"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    {t('areas.trustStripReviews', { rating: googleRating.toFixed(1), count: googleReviewCount })}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* zh/zh-Hant only — Chinese-market trust band (renders null elsewhere) */}
      <ZhTrustLine locale={locale} rating={googleRating} />

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
          {/* /workflow/ inbound CTA — kicks off the /workflow/ rollout
              (currently only AreaPage links to /workflow/ via
              processLinkText). Pre-fix ServiceDetailPage had ZERO
              /workflow/ body-content references. Semantic fit: the
              "Why choose us" benefits answer "why" — readers' natural
              next question is "how does it actually happen?" — exactly
              what /workflow/ documents (7-step quote → handover
              process). ~126 surfaces (9 services × 14 locales) now
              pass body-content link equity to /workflow/.

              Label is English-only — matches the precedent set by the
              Related Services /about/ CTA below in the same file, and
              the Cost-Guides section above. i18n keys not wired up;
              URL routes to localized /[locale]/workflow/ via the
              navigation Link helper. */}
          <p className="text-center mt-8 text-sm" style={{ color: TEXT_MID }}>
            <Link
              href="/workflow"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              See our renovation process step-by-step →
            </Link>
          </p>
        </div>
      </section>

      <RelatedProjectsSection
        heading={t('section.ourProjects')}
        projects={relatedProjects}
        categorySlug={serviceSlug}
      />

      {/* /before-after/ inbound — 4th surface of /before-after/ rollout
          (siblings: HomePage GallerySection 3c1998d, ProjectsPage 427078c,
          AreaPage 427078c). RelatedProjectsSection above shows ~3 service-
          specific projects; the natural follow-up for the user wanting to
          see more visual results is the dedicated before/after gallery
          (same project pool, different visual framing). Tight semantic
          fit — readers in service-evaluation mode are exactly the
          target audience for the renovation-results trust signal. */}
      <section className="py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm" style={{ color: TEXT_MID }}>
            Want more visual results?{' '}
            <Link
              href="/before-after"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              See our before / after renovation gallery →
            </Link>
          </p>
          {/* /design/ inbound — 3rd surface of /design/ rollout
              (siblings: HomePage GallerySection 8e8eade, ProjectsPage
              8e8eade). Pairs with the /before-after/ tagline above to
              cover both visual-mode follow-ups: results vs inspiration.
              Service-evaluation readers wanting to scope a project
              naturally bounce between "what could it look like" (design)
              and "what does the finished result look like" (before/after). */}
          <p className="text-sm mt-2" style={{ color: TEXT_MID }}>
            Looking for inspiration?{' '}
            <Link
              href="/design"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              Browse our design ideas →
            </Link>
          </p>
        </div>
      </section>

      {/* What our {service} clients say — verified reviews linked to this
          service type's case-study projects (the service-page twin of
          AreaPage's AreaClientReviews, same before-CTA / after-main-content
          slot: right after the related-projects gallery those reviews talk
          about). Verbatim quotes (original language), each card links to its
          project. Renders nothing for services without project-linked
          reviews. NO Review schema here — it lives on the project pages
          (duplicating it on a second entity risks spam signals). */}
      <ServiceClientReviews reviews={clientReviews} serviceName={localizedService.title} locale={locale} />

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
            {/* Cross-link to /financing/ — parallel to BlogPostPage commit
                73a5c74 + AreaPage commit d90bb97. Pre-fix ServiceDetailPage
                had zero references to /financing/. With ~9 service pages ×
                14 locales × organic-search traffic, this is one of the
                site's larger inbound surfaces — sending zero body-content
                link equity to the financing money page was a real gap.
                Completes financing-inbound on the third high-traffic
                surface (after BlogPostPage + AreaPage). */}
            <p className="text-center mt-6 text-sm" style={{ color: TEXT_MID }}>
              {tCostGuides('financingPrompt')}{' '}
              <Link
                href="/financing"
                className="font-semibold underline hover:no-underline"
                style={{ color: GOLD }}
              >
                {tCostGuides('financingCta')}
              </Link>
            </p>
            {/* /<X>-renovation-near-me/ programmatic-landing-page cross-link
                — kicks off the /renovation-near-me/ family rollout (4 pages
                with 0 inbound each per 2026-05-31 route audit). These
                landing pages are EXPLICITLY designed for high-intent "X
                renovation near me" search queries, and the /services/<X>/
                page is their topical twin — same service, different
                search-intent framing — so cross-linking them passes maximum
                PageRank equity. Only renders when the current service has
                a matching near-me page (kitchen/bathroom/basement/whole-
                house mapped; cabinet + commercial don't have near-me pages
                yet). ~9 services × 14 locales = ~50 surfaces (4 mapped
                slugs × 14 locales) now pass body-content equity to the 4
                near-me landing pages. */}
            {NEAR_ME_BY_SERVICE_SLUG[serviceSlug] && (
              <p className="text-center mt-2 text-sm" style={{ color: TEXT_MID }}>
                {tCostGuides('nearMeCtaPrompt', { service: localizedService.title.toLowerCase() })}{' '}
                <Link
                  href={NEAR_ME_BY_SERVICE_SLUG[serviceSlug] as '/kitchen-renovation-near-me'}
                  className="font-semibold underline hover:no-underline"
                  style={{ color: GOLD }}
                >
                  {tCostGuides('nearMeCtaLink')}
                </Link>
              </p>
            )}
            {/* 2026-06-02: backsplash blog inbound for the kitchen-specific
                pos-15.7 / 37-imp striking-distance query "backsplash
                vancouver". /blog/kitchen-backsplash-cost-vancouver-2026/
                had ZERO inbound site-wide per source-tree grep. This is the
                natural cross-link surface (kitchen service page → kitchen
                backsplash deep-dive). EN+kitchen-only gate mirrors the
                near-me block's pattern. */}
            {locale === 'en' && serviceSlug === 'kitchen' && (
              <p className="text-center mt-2 text-sm" style={{ color: TEXT_MID }}>
                Just planning a backsplash refresh?{' '}
                <Link
                  href="/blog/kitchen-backsplash-cost-vancouver-2026"
                  className="font-semibold underline hover:no-underline"
                  style={{ color: GOLD }}
                >
                  See our Vancouver backsplash cost guide →
                </Link>
              </p>
            )}
          </div>
        </section>
      )}

      {/* Related Services — body-level cross-links to sibling /services/<x>/
          pages. Pre-fix: only the global header/footer linked each service to
          the others (1 inbound link per other-service per page, all in nav
          chrome). PageRank weighting puts body-content links well above
          nav-area links, so adding a body-level Related Services section
          materially increases the internal-link equity flowing across the
          service cluster. Mirrors the pattern of the Cost Guide cross-link
          section above + the Real-Renovation-Costs sections in BlogPostPage /
          AreaPage / FinancingPage / HomePage. Labels use service.title
          (already localized) so the chip text is meaningful in every locale.
          Conditional render — only shows when caller passes the allServices
          prop AND at least 1 sibling exists. */}
      {allServices && allServices.filter(s => s.slug !== serviceSlug && s.showOnServicesPage !== false).length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('section.relatedServices', { defaultValue: 'Related Services' })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allServices
                .filter(s => s.slug !== serviceSlug && s.showOnServicesPage !== false)
                .slice(0, 6)
                .map((s) => {
                  const localizedSibling = getLocalizedService(s, locale);
                  return (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}` as '/services/kitchen'}
                      className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                      style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                    >
                      {localizedSibling.title}
                    </Link>
                  );
                })}
            </div>
            {/* /about/ inbound CTA tagline below related-services chips.
                Parallel to HomePage AboutSection e1b3193. Pre-fix
                ServiceDetailPage had ZERO /about/ references. Trust signal:
                a user evaluating a specific service offering naturally wants
                to know who's behind the offering. The "Learn more about
                Reno Stars" CTA serves that exact informational need. ~126
                surfaces (9 services × 14 locales) now pass body-content
                link equity to /about/. */}
            <p className="text-center mt-6 text-sm" style={{ color: TEXT_MID }}>
              <Link
                href="/about"
                className="font-semibold underline hover:no-underline"
                style={{ color: GOLD }}
              >
                Learn more about Reno Stars →
              </Link>
            </p>
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
            {/* /showroom/ inbound CTA — kicks /showroom/ rollout to 3/5
                (siblings: HomePage ShowroomSection baseline, AreaPage
                Contextual Internal Links 50ed7e1). Pre-rollout audit
                found /showroom/ had ONLY 1 inbound site-wide; on the
                most equity-passing surface type (9 services × 14
                locales) this was a significant gap. Semantic fit:
                Areas-We-Serve names the local context; the natural
                follow-up is "visit us in person in that area" — exactly
                what /showroom/ offers. Material-evaluation CTA also
                bridges the "online research → in-person conversion"
                funnel that drives service-page bookings.

                Label English-only matches same-file precedent (Related
                Services /about/ CTA 5260a96, Benefits /workflow/ CTA
                0e6a6e8). URL routes to localized /[locale]/showroom/
                via @/navigation Link. */}
            <p className="text-center mt-8 text-sm" style={{ color: TEXT_MID }}>
              Want to see materials and finishes in person?{' '}
              <Link
                href="/showroom"
                className="font-semibold underline hover:no-underline"
                style={{ color: GOLD }}
              >
                {tCostGuides('showroomCta')}
              </Link>
            </p>
            {/* /areas/ aggregation link — 3rd surface of /areas/ inbound
                rollout (siblings: HomePage AreasLinkSection adbe51b,
                AreaPage Contextual Internal Links chip 3f7920a). Pre-
                rollout audit found /areas/ canonical directory had
                ZERO body refs site-wide. ServiceDetailPage is a high-
                equity surface (9 services × 14 locales = ~126 surfaces)
                and the Areas We Serve grid is the semantically-perfect
                placement — readers seeing the served-areas list naturally
                ask "what other areas?" — exactly what /areas/ answers. */}
            <p className="text-center mt-2 text-sm" style={{ color: TEXT_MID }}>
              <Link
                href="/areas"
                className="font-semibold underline hover:no-underline"
                style={{ color: GOLD }}
              >
                See all service areas →
              </Link>
            </p>
            {/* 2026-06-02: featured-area cross-link, EN + bathroom-only for
                now. GSC striking-distance scan (2026-06-01) showed
                "bathroom renovation richmond" at pos 16.2 / 204 imp ranks
                the homepage /en/ instead of the topical /en/areas/richmond/
                page (misdirected ranking — homepage outranks topical due to
                weak inbound signal on /areas/richmond/). This snippet adds
                an anchor-text-rich inbound link from this high-equity
                surface (/services/bathroom/) → /areas/richmond/ with the
                exact-match query phrase as anchor text. Same pattern for
                West Vancouver bathroom (309 imp pos 18.8). Will expand
                per-service after 3-4 week crawl-reweight confirms lift. */}
            {locale === 'en' && serviceSlug === 'bathroom' && (
              <p className="text-center mt-3 text-sm max-w-3xl mx-auto" style={{ color: TEXT_MID }}>
                For neighborhood-specific bathroom renovation expertise see our{' '}
                <Link href="/areas/richmond" className="underline hover:no-underline" style={{ color: GOLD }}>
                  bathroom renovation in Richmond
                </Link>{' '}
                and{' '}
                <Link href="/areas/west-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>
                  bathroom renovation in West Vancouver
                </Link>{' '}
                neighborhood pages — each with real Reno Stars project costs and area-specific notes.
              </p>
            )}
            {/* 2026-06-02 (parallel to the bathroom snippet above):
                /services/basement/ Featured-Areas cross-link targeting
                North Vancouver + Burnaby basement queries. GSC scan shows:
                - /areas/north-vancouver/ pos 10.1-13.2 / 116 imp combined
                  for "basement renovation north vancouver" + variants
                - /areas/burnaby/ pos 16.3-19.4 / 86 imp combined for
                  "basement renovations burnaby" + variants
                Both pages already correctly-targeted (unlike Richmond
                bathroom which was misdirected to /en/) but at striking
                distance. Anchor-text-rich inbound from this high-equity
                /services/basement/ surface compounds topical authority
                with exact-match query phrasing. */}
            {locale === 'en' && serviceSlug === 'basement' && (
              <p className="text-center mt-3 text-sm max-w-3xl mx-auto" style={{ color: TEXT_MID }}>
                For neighborhood-specific basement renovation expertise see our{' '}
                <Link href="/areas/north-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>
                  basement renovation in North Vancouver
                </Link>{' '}
                and{' '}
                <Link href="/areas/burnaby" className="underline hover:no-underline" style={{ color: GOLD }}>
                  basement renovation in Burnaby
                </Link>{' '}
                neighborhood pages — each with real Reno Stars project costs and area-specific notes including waterproofing, legalization, and hillside considerations.
              </p>
            )}
            {/* 2026-06-25: City-specific blog guide links. The service page is
                a high-equity hub; adding body-level links to city cluster posts
                passes PageRank to those posts and gives Googlebot a crawlable
                hub for the "[service] renovation [city]" keyword family.
                Only rendered for EN + services with a city blog cluster. */}
            {locale === 'en' && SERVICE_CITY_BLOG_LINKS[serviceSlug] && (
              <p className="text-center mt-4 text-sm" style={{ color: TEXT_MID }}>
                <strong>City guides:</strong>{' '}
                {SERVICE_CITY_BLOG_LINKS[serviceSlug]!.map((link, i) => (
                  <span key={link.slug}>
                    {i > 0 && ' · '}
                    <Link href={`/blog/${link.slug}`} className="underline hover:no-underline" style={{ color: GOLD }}>
                      {link.city}
                    </Link>
                  </span>
                ))}
              </p>
            )}
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

      {/* 2026-06-26: Planning guide pill-links. Service pages are high-intent —
          users are researching a specific service before getting a quote.
          Planning guides (contractor/cost/timeline/permits/financing/strata)
          answer common questions during this research phase. */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: TEXT_MID }}>
            {locale === 'zh' ? '装修规划指南' : 'Renovation Planning Guides'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {([
              { href: '/blog/how-to-choose-renovation-contractor-vancouver', label: locale === 'zh' ? '如何选择承包商' : 'How to Choose a Contractor' },
              { href: '/guides/whole-house-renovation-cost-vancouver', label: locale === 'zh' ? '2026装修费用指南' : 'Renovation Costs 2026' },
              { href: '/blog/renovation-timeline-how-long-does-each-project-take', label: locale === 'zh' ? '装修时间线' : 'Renovation Timeline' },
              { href: '/blog/renovation-permits-bc-guide', label: locale === 'zh' ? 'BC省许可证指南' : 'BC Permits Guide' },
              { href: '/blog/renovation-financing-vancouver-heloc', label: locale === 'zh' ? '装修融资' : 'Financing Your Reno' },
              { href: '/blog/strata-renovation-rules-vancouver', label: locale === 'zh' ? 'BC省分层产权规则' : 'Strata Rules BC' },
            ] as const).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: GOLD_PALE, color: NAVY }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        heading={t('services.getQuoteForService', { service: localizedService.title })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        bg={SURFACE}
        phone={company.phone}
      />
    </div>
  );
}
