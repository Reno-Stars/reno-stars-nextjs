'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceType, ServiceArea, Project, LocalizedService as LocalizedServiceType } from '@/lib/types';
import {
  getLocalizedService,
  getLocalizedArea,
  getLocalizedProject,
} from '@/lib/data';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import FeaturedCityProject from '@/components/FeaturedCityProject';
import FaqSection from '@/components/home/FaqSection';
import StickyComboCta from '@/components/StickyComboCta';
import {
  NAVY, GOLD, SURFACE, SURFACE_ALT, TEXT, TEXT_MID, CARD, neu,
} from '@/lib/theme';
import { renderProseHtml } from '@/lib/markdown-html';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface ServiceLocationPageProps {
  locale: Locale;
  serviceSlug: ServiceType;
  citySlug: string;
  company: Company;
  service: Service;
  area: ServiceArea;
  services?: Service[];
  areas?: ServiceArea[];
  faqs?: FaqItem[];
  areaProjects?: Project[];
}

// 2026-06-25: City-specific blog post lookup for service+city pages.
// service slug → city slug → blog post slug. Renders a direct guide link in
// the Contextual Links section, passing PageRank from high-authority service+
// city pages (/en/services/kitchen/burnaby/) to city cluster blog posts.
const SERVICE_CITY_BLOG: Partial<Record<string, Record<string, string>>> = {
  kitchen: {
    burnaby: 'kitchen-renovation-burnaby-2026',
    richmond: 'kitchen-renovation-richmond-bc-2026',
    surrey: 'kitchen-renovation-surrey-bc-2026',
    coquitlam: 'kitchen-renovation-coquitlam-bc-2026',
    'north-vancouver': 'kitchen-renovation-north-vancouver-2026',
    'west-vancouver': 'kitchen-renovation-west-vancouver-2026',
    langley: 'kitchen-renovation-langley-bc-2026',
    delta: 'kitchen-renovation-delta-bc-2026',
    'new-westminster': 'kitchen-renovation-new-westminster-bc-2026',
    vancouver: 'kitchen-renovation-vancouver-bc-2026',
    'port-coquitlam': 'kitchen-renovation-port-coquitlam-bc-2026',
    'port-moody': 'kitchen-renovation-port-moody-bc-2026',
    'maple-ridge': 'kitchen-renovation-maple-ridge-bc-2026',
    'white-rock': 'kitchen-renovation-white-rock-2026',
  },
  bathroom: {
    burnaby: 'burnaby-bathroom-renovation-guide-2026',
    richmond: 'bathroom-renovation-cost-richmond-bc-2026',
    surrey: 'bathroom-renovation-surrey-bc-2026',
    coquitlam: 'bathroom-renovation-coquitlam-bc-2026',
    'north-vancouver': 'bathroom-renovations-north-vancouver-2026',
    'west-vancouver': 'bathroom-renovations-west-vancouver-2026',
    langley: 'bathroom-renovation-langley-2026',
    delta: 'bathroom-renovation-delta-bc-2026',
    'new-westminster': 'bathroom-renovation-new-westminster-2026',
    vancouver: 'average-bathroom-renovation-cost-vancouver',
    'port-coquitlam': 'bathroom-renovation-port-coquitlam-2026',
    'port-moody': 'bathroom-renovation-port-moody-2026',
    'maple-ridge': 'bathroom-renovation-maple-ridge-bc-2026',
    'white-rock': 'bathroom-renovations-white-rock-bc-2026',
  },
  'accessible-bathroom': {
    burnaby: 'burnaby-bathroom-renovation-guide-2026',
    richmond: 'bathroom-renovation-cost-richmond-bc-2026',
    surrey: 'bathroom-renovation-surrey-bc-2026',
    coquitlam: 'bathroom-renovation-coquitlam-bc-2026',
    'north-vancouver': 'bathroom-renovations-north-vancouver-2026',
    'west-vancouver': 'bathroom-renovations-west-vancouver-2026',
    langley: 'bathroom-renovation-langley-2026',
    delta: 'bathroom-renovation-delta-bc-2026',
    'new-westminster': 'bathroom-renovation-new-westminster-2026',
    vancouver: 'average-bathroom-renovation-cost-vancouver',
    'port-coquitlam': 'bathroom-renovation-port-coquitlam-2026',
    'port-moody': 'bathroom-renovation-port-moody-2026',
    'maple-ridge': 'bathroom-renovation-maple-ridge-bc-2026',
    'white-rock': 'bathroom-renovations-white-rock-bc-2026',
  },
  basement: {
    burnaby: 'basement-renovations-burnaby-2026',
    richmond: 'basement-renovation-richmond-bc-2026',
    surrey: 'basement-renovations-surrey',
    coquitlam: 'basement-renovations-coquitlam-2026',
    'north-vancouver': 'basement-renovations-north-vancouver',
    'west-vancouver': 'basement-renovation-west-vancouver-2026',
    langley: 'basement-renovations-langley',
    delta: 'basement-renovation-delta-bc',
    'new-westminster': 'basement-renovation-new-westminster-2026',
    vancouver: 'basement-renovation-vancouver-complete-guide',
    'port-coquitlam': 'basement-renovations-port-coquitlam-2026',
    'port-moody': 'basement-renovations-port-moody',
    'maple-ridge': 'basement-renovations-maple-ridge',
    'white-rock': 'basement-renovation-white-rock-2026',
  },
  'whole-house': {
    burnaby: 'burnaby-home-renovation-guide-2026',
    richmond: 'richmond-home-renovation-guide-2026',
    surrey: 'surrey-home-renovation-guide-2026',
    coquitlam: 'coquitlam-home-renovation-guide-2026',
    'north-vancouver': 'north-vancouver-home-renovation-guide-2026',
    'west-vancouver': 'west-vancouver-home-renovation-guide-2026',
    langley: 'langley-home-renovation-guide-2026',
    delta: 'delta-home-renovation-guide-2026',
    'new-westminster': 'new-westminster-home-renovation-guide-2026',
    vancouver: 'vancouver-home-renovation-guide-2026',
    'port-coquitlam': 'port-coquitlam-home-renovation-guide-2026',
    'port-moody': 'port-moody-home-renovation-guide-2026',
    'maple-ridge': 'maple-ridge-home-renovation-guide-2026',
    'white-rock': 'white-rock-home-renovation-guide-2026',
  },
  realtor: {
    burnaby: 'pre-sale-renovation-burnaby-bc-2026',
    richmond: 'pre-sale-renovation-richmond-bc-2026',
    surrey: 'pre-sale-renovation-surrey-bc-2026',
    coquitlam: 'pre-sale-renovation-coquitlam-bc-2026',
    'north-vancouver': 'pre-sale-renovation-north-vancouver-bc-2026',
    'west-vancouver': 'pre-sale-renovation-west-vancouver-bc-2026',
    langley: 'pre-sale-renovation-langley-bc-2026',
    delta: 'pre-sale-renovation-delta-bc-2026',
    'new-westminster': 'pre-sale-renovation-new-westminster-bc-2026',
    vancouver: 'pre-sale-renovation-vancouver-what-to-fix-before-listing',
    'port-coquitlam': 'pre-sale-renovation-port-coquitlam-bc-2026',
    'port-moody': 'pre-sale-renovation-port-moody-bc-2026',
    'maple-ridge': 'pre-sale-renovation-maple-ridge-bc-2026',
    'white-rock': 'pre-sale-renovation-white-rock-bc-2026',
  },
};

export default function ServiceLocationPage({
  locale, serviceSlug, citySlug, company, service, area,
  services = [], areas = [], faqs = [], areaProjects = [],
}: ServiceLocationPageProps) {
  const t = useTranslations();

  const localizedService = useMemo(() => getLocalizedService(service, locale), [service, locale]);
  const localizedArea = useMemo(() => getLocalizedArea(area, locale), [area, locale]);

  // Localize and filter projects: prefer area-specific, then service-type matches
  const relatedProjects = useMemo(() => {
    const localized = areaProjects.map((p) => getLocalizedProject(p, locale));
    // Prioritize projects matching the service type
    const serviceMatch = localized.filter((p) => p.service_type === serviceSlug);
    const others = localized.filter((p) => p.service_type !== serviceSlug);
    return [...serviceMatch, ...others].slice(0, 3);
  }, [areaProjects, locale, serviceSlug]);

  // Single best matching project for the featured-case-study card. Prefers
  // service-type AND city match; falls back to first relatedProjects entry.
  const featuredProject = useMemo(() => {
    if (relatedProjects.length === 0) return null;
    const exactMatch = relatedProjects.find((p) => p.service_type === serviceSlug);
    return exactMatch ?? relatedProjects[0];
  }, [relatedProjects, serviceSlug]);

  // Other areas offering the same service (exclude current), pre-localized
  const otherAreas = useMemo(
    () => areas
      .filter((a) => a.slug !== area.slug)
      .map((a) => ({ slug: a.slug, name: getLocalizedArea(a, locale).name })),
    [areas, area.slug, locale],
  );

  // City-specific blog guide link (kitchen/bathroom/basement/whole-house/presale)
  const cityBlogSlug: string | undefined = SERVICE_CITY_BLOG[serviceSlug]?.[citySlug];

  // Other services available in this area (exclude current)
  const otherServices: LocalizedServiceType[] = useMemo(
    () => services
      .filter((s) => s.slug !== serviceSlug)
      .map((s) => getLocalizedService(s, locale)),
    [services, serviceSlug, locale],
  );

  // City+service-scoped cost summary from completed-project budget_range values.
  // Targets "{service} renovation {city}" queries (combo pages collectively at
  // pos 14-27 across the {svc}+{city} grid). Real DB data only — never
  // fabricated. Section hides itself if <2 matching projects exist.
  const cityServiceCostSummary = useMemo(() => {
    const ranges = areaProjects
      .filter((p) => p.service_type === serviceSlug)
      .map((p) => {
        const r = p.budget_range;
        if (!r) return null;
        const nums = r.match(/[\d,]+/g);
        if (!nums || nums.length < 1) return null;
        const lo = parseInt(nums[0].replace(/,/g, ''), 10);
        const hi = nums.length > 1 ? parseInt(nums[1].replace(/,/g, ''), 10) : lo;
        if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
        return { lo, hi, mid: Math.round((lo + hi) / 2) };
      })
      .filter((r): r is { lo: number; hi: number; mid: number } => r !== null);

    if (ranges.length < 2) return null;
    const allMin = Math.min(...ranges.map((r) => r.lo));
    const allMax = Math.max(...ranges.map((r) => r.hi));
    const avg = Math.round(ranges.reduce((s, r) => s + r.mid, 0) / ranges.length);
    return { count: ranges.length, allMin, allMax, avg };
  }, [areaProjects, serviceSlug]);

  const formatPrice = (n: number): string => {
    if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
    return '$' + n.toLocaleString('en-CA');
  };

  const title = t('areas.serviceInArea', { service: localizedService.title, area: localizedArea.name });

  const benefits = [
    t('locationBenefits.localExpertise'),
    t('locationBenefits.freeOnsite'),
    t('locationBenefits.competitivePricing'),
    t('locationBenefits.quickResponse'),
    t('locationBenefits.experience', { years: company.yearsExperience }),
    t('locationBenefits.licensedInsured'),
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        {service.image && (
          <div className="absolute inset-0 opacity-20">
            <OptimizedImage
              src={service.image}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { href: '/services', label: t('nav.services') },
            { href: `/services/${serviceSlug}`, label: localizedService.title },
            { label: localizedArea.name },
          ]} />
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-sm font-medium" style={{ color: GOLD }}>{localizedArea.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {localizedArea.description || localizedService.description}
          </p>
        </div>
      </section>

      {/* Real {service} costs in {city} — DB-backed cost stat block. Sits
          immediately under the hero so users + Google see real $-data above
          the fold. Targets the "{service} renovation {city}" query intent. */}
      {cityServiceCostSummary && (
        <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: TEXT }}>
              {locale === 'zh' || locale === 'zh-Hant'
                ? `${localizedArea.name}${localizedService.title}真实费用`
                : `Real ${localizedService.title} Costs in ${localizedArea.name}`}
            </h2>
            <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
              {locale === 'zh' || locale === 'zh-Hant'
                ? `基于 ${cityServiceCostSummary.count} 个已完工 ${localizedArea.name} ${localizedService.title}项目`
                : locale === 'ja'
                  ? `${localizedArea.name}で完了した${cityServiceCostSummary.count}件の${localizedService.title}プロジェクトに基づく`
                  : locale === 'ko'
                    ? `${localizedArea.name}에서 완료된 ${cityServiceCostSummary.count}개 ${localizedService.title} 프로젝트 기준`
                    : `Based on ${cityServiceCostSummary.count} completed ${localizedService.title.toLowerCase()} projects in ${localizedArea.name}`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: locale === 'zh' || locale === 'zh-Hant' ? '价格区间' : 'Price Range',
                  value: `${formatPrice(cityServiceCostSummary.allMin)} – ${formatPrice(cityServiceCostSummary.allMax)}`,
                },
                {
                  label: locale === 'zh' || locale === 'zh-Hant' ? '中位数' : 'Average',
                  value: formatPrice(cityServiceCostSummary.avg),
                },
                {
                  label: locale === 'zh' || locale === 'zh-Hant' ? '已完成项目' : 'Projects',
                  value: String(cityServiceCostSummary.count),
                },
                {
                  label: locale === 'zh' || locale === 'zh-Hant' ? '保修' : 'Warranty',
                  value: locale === 'zh' || locale === 'zh-Hant' ? '3 年' : '3 yrs',
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                  <div className="text-lg md:text-xl font-bold" style={{ color: GOLD }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: TEXT_MID }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service Description — accepts markdown OR HTML */}
      {localizedService.long_description && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="sr-only">
              {t('areas.aboutService', { service: localizedService.title, area: localizedArea.name })}
            </h2>
            <div
              className="prose prose-lg max-w-none prose-headings:text-[#1B365D] prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-1 prose-strong:text-[#1B365D]"
              style={{ color: TEXT_MID }}
              dangerouslySetInnerHTML={{ __html: renderProseHtml(localizedService.long_description) }}
            />
          </div>
        </section>
      )}

      {/* Area Content */}
      {localizedArea.content && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('areas.areaServiceContent', { service: localizedService.title, area: localizedArea.name })}
            </h2>
            {localizedArea.content.split('\n\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                {paragraph}
              </p>
            ))}
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

      {/* Why Choose Us */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('areas.whyChooseArea', { area: localizedArea.name })}
          </h2>
          <BenefitList benefits={(localizedArea.highlights?.length ?? 0) > 0 ? localizedArea.highlights! : benefits} />
        </div>
      </section>

      {/* Featured case-study card — pushes combo pages from pos 21-33 to
          page 1 by adding city-named, budget-named, scope-named depth that
          generic service pages lack. Same SEO move competitors (Adept, Enzo)
          use to dominate combo queries. */}
      {featuredProject && (
        <FeaturedCityProject
          project={featuredProject}
          heading={t('areas.featuredProjectHeading', {
            area: localizedArea.name,
            service: localizedService.title,
          })}
          subheading={t('areas.featuredProjectSubheading')}
          viewCta={t('areas.featuredProjectCta')}
        />
      )}

      <RelatedProjectsSection
        heading={t('areas.areaProjects', { area: localizedArea.name })}
        projects={relatedProjects}
        categorySlug={serviceSlug}
      />

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <FaqSection
          faqs={faqs}
          translations={{ title: t('areas.serviceFaqTitle', { service: localizedService.title, area: localizedArea.name }) }}
        />
      )}

      {/* Contextual Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link
            href="/workflow"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.processLinkText')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.blogLinkText')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/services/${serviceSlug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.serviceLinkText', { service: localizedService.title })} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/areas/${citySlug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.areaLinkText', { area: localizedArea.name })} <ArrowRight className="w-4 h-4" />
          </Link>
          {/* 2026-06-25: city-specific blog guide link. Service+city pages are
              high-authority hubs; direct body link to matching city blog post
              passes PageRank to the city cluster and deepens topical coverage. */}
          {cityBlogSlug && (
            <Link
              href={`/blog/${cityBlogSlug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              style={{ color: GOLD }}
            >
              {localizedArea.name} Renovation Guide <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Other Areas for Same Service */}
      {otherAreas.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('areas.otherAreasForService', { service: localizedService.title })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {otherAreas.map((a) => (
                <Link
                  key={a.slug}
                  href={`/services/${serviceSlug}/${a.slug}`}
                  className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Services in Same Area */}
      {otherServices.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('areas.otherServicesInArea', { area: localizedArea.name })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {otherServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}/${citySlug}`}
                  className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        heading={t('areas.readyToStartIn', { area: localizedArea.name, service: localizedService.title })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        bg={SURFACE_ALT}
        phone={company.phone}
      />
      {/* Mobile-only sticky bottom CTA — combo pages have impressions but
          low CTR; this gives a persistent one-tap quote/call path. */}
      <StickyComboCta
        area={localizedArea.name}
        service={localizedService.title}
        phone={company.phone}
      />
      {/* Spacer so the sticky bar doesn't cover the footer on mobile. */}
      <div aria-hidden className="h-20 sm:hidden" />
    </div>
  );
}
