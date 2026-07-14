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
import ZhTrustLine from '@/components/ZhTrustSignals';
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
import { renderProseChips } from '@/lib/prose-chips';
import {
  extractServiceCitySlice,
  firstParagraph,
  summarizeProjectCosts,
  pickComboProjects,
} from '@/lib/seo/combo-content';
import { comboHeroSubtitle } from '@/lib/data/seo-overrides';

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
  /** Every published project — powers the honest related-project fallback. */
  projectPool?: Project[];
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
  services = [], areas = [], faqs = [], areaProjects = [], projectPool = [],
}: ServiceLocationPageProps) {
  const t = useTranslations();
  const zhLoc = locale === 'zh' || locale === 'zh-Hant';

  const localizedService = useMemo(() => getLocalizedService(service, locale), [service, locale]);
  const localizedArea = useMemo(() => getLocalizedArea(area, locale), [area, locale]);

  // Localized project pools. `localizedAreaProjects` = projects in THIS city
  // (drives the city+service cost stat). `pool` = every published project
  // (drives the honest related-project fallback below).
  const localizedAreaProjects = useMemo(
    () => areaProjects.map((p) => getLocalizedProject(p, locale)),
    [areaProjects, locale],
  );
  const pool = useMemo(
    () => (projectPool.length ? projectPool : areaProjects).map((p) => getLocalizedProject(p, locale)),
    [projectPool, areaProjects, locale],
  );

  // Honest project selection: real city×service projects if any, otherwise
  // RELATED real projects (same-service other-city, then same-city
  // other-service), labelled as related — never presented as local to {city}.
  const comboProjects = useMemo(
    () => pickComboProjects(pool, area.name.en, serviceSlug),
    [pool, area.name.en, serviceSlug],
  );
  const relatedProjects = comboProjects.projects;
  const relation = comboProjects.relation;
  const hasLocalWork = relation === 'exact';
  const featuredProject = relatedProjects[0] ?? null;

  // Service-relevant slice of THIS city's area content — kitchen combo pulls the
  // city's kitchen section, bathroom pulls the bathroom section, etc. Differs by
  // BOTH city and service and replaces the old full-area-content duplicate. Null
  // (→ intro-only) when the city has no section for this service.
  const citySlice = useMemo(
    () => extractServiceCitySlice(localizedArea.content, serviceSlug),
    [localizedArea.content, serviceSlug],
  );

  // Short, real service×city intro (first paragraph of the service
  // long_description) — replaces the old full long_description dump.
  const introParagraph = useMemo(
    () => firstParagraph(localizedService.long_description),
    [localizedService.long_description],
  );
  const introHtml = useMemo(() => {
    const lead = zhLoc
      ? `聚星装修为${localizedArea.name}及大温地区的业主提供${localizedService.title}服务。`
      : `Reno Stars provides ${localizedService.title.toLowerCase()} for homeowners across ${localizedArea.name} and Metro Vancouver.`;
    return renderProseHtml(introParagraph ? `${lead}\n\n${introParagraph}` : lead);
  }, [introParagraph, zhLoc, localizedArea.name, localizedService.title]);

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

  // City+service cost stat from completed LOCAL projects (real DB data, hides
  // itself below 2 matches). When absent, fall back to a REAL Metro-Vancouver
  // range for the service aggregated across all completed projects — clearly
  // labelled as a general range below, never city-specific, never fabricated.
  const cityServiceCostSummary = useMemo(
    () => summarizeProjectCosts(localizedAreaProjects.filter((p) => p.service_type === serviceSlug), 2),
    [localizedAreaProjects, serviceSlug],
  );
  const serviceGeneralCostSummary = useMemo(
    () => summarizeProjectCosts(pool.filter((p) => p.service_type === serviceSlug), 2),
    [pool, serviceSlug],
  );
  const costSummary = cityServiceCostSummary ?? serviceGeneralCostSummary;
  const costIsCitySpecific = cityServiceCostSummary !== null;

  const formatPrice = (n: number): string => {
    if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
    return '$' + n.toLocaleString('en-CA');
  };

  // H1 leads with the specific "{service} in {city}" — distinct from the
  // /areas/{city} hub, which leads with the generic "Home Renovations in {city}".
  const title = t('areas.serviceInArea', { service: localizedService.title, area: localizedArea.name });
  const svcT = localizedService.title;
  const cityT = localizedArea.name;

  // Relation-aware, honest headings for the project blocks. The heading always
  // matches the real source of the projects shown (see pickComboProjects).
  const featuredHeading = (() => {
    switch (relation) {
      case 'exact': return t('areas.featuredProjectHeading', { area: cityT, service: svcT });
      case 'same-service': return zhLoc ? `近期${svcT}项目` : `Recent ${svcT} Project`;
      case 'same-city': return zhLoc ? `我们在${cityT}的近期项目` : `Our Recent Work in ${cityT}`;
      default: return zhLoc ? '近期装修项目' : 'Recent Renovation Project';
    }
  })();
  const relatedHeading = (() => {
    switch (relation) {
      case 'exact': return t('areas.areaProjects', { area: cityT });
      case 'same-service': return zhLoc ? `大温地区相关${svcT}项目` : `Related ${svcT} Projects Across Metro Vancouver`;
      case 'same-city': return zhLoc ? `我们在${cityT}的近期装修项目` : `Our Recent Renovation Work in ${cityT}`;
      default: return zhLoc ? '大温地区近期项目' : 'Recent Projects Across Metro Vancouver';
    }
  })();
  // Honest service-area availability line for combos with no completed LOCAL
  // project of this type (service-area business — not a false claim of past work).
  const availabilityCta = zhLoc
    ? `我们服务${cityT}地区，欢迎为您承接${svcT}工程——查看以上相关案例并获取免费报价。`
    : `We serve ${cityT} and would love to take on your ${svcT.toLowerCase()} — explore our related work above and get a free quote.`;

  // Cost stat heading/subtitle — city-specific when we have ≥2 local projects,
  // else a clearly-labelled general Metro-Vancouver range.
  const costHeading = costIsCitySpecific
    ? (zhLoc ? `${cityT}${svcT}真实费用` : `Real ${svcT} Costs in ${cityT}`)
    : (zhLoc ? `${svcT}费用区间 · 大温地区` : `${svcT} Cost Range — Metro Vancouver`);
  const costSubtitle = !costSummary ? '' : costIsCitySpecific
    ? (zhLoc
        ? `基于 ${costSummary.count} 个已完工 ${cityT} ${svcT}项目`
        : `Based on ${costSummary.count} completed ${svcT.toLowerCase()} projects in ${cityT}`)
    : (zhLoc
        ? `来自大温地区 ${costSummary.count} 个已完工${svcT}项目的综合区间（非${cityT}专属数据）`
        : `General range from ${costSummary.count} completed ${svcT.toLowerCase()} projects across Metro Vancouver — not ${cityT}-specific`);

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
            {comboHeroSubtitle(localizedService.title, localizedArea.name, hasLocalWork, locale)}
          </p>
        </div>
      </section>

      {/* zh/zh-Hant only — Chinese-market trust band (renders null elsewhere) */}
      <ZhTrustLine locale={locale} />

      {/* Real {service} costs — DB-backed cost stat block. Sits immediately
          under the hero so users + Google see real $-data above the fold.
          Prefers a city+service figure from completed LOCAL projects; falls
          back to a clearly-labelled general Metro-Vancouver range for the
          service. Real DB data only — never fabricated (rule §8). */}
      {costSummary && (
        <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: TEXT }}>
              {costHeading}
            </h2>
            <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
              {costSubtitle}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: zhLoc ? '价格区间' : 'Price Range',
                  value: `${formatPrice(costSummary.allMin)} – ${formatPrice(costSummary.allMax)}`,
                },
                {
                  // costSummary.avg is the arithmetic MEAN of project-budget
                  // midpoints (see summarizeProjectCosts), so the label must say
                  // 平均/Average — not 中位数 (median), which it is not.
                  label: zhLoc ? '平均' : 'Average',
                  value: formatPrice(costSummary.avg),
                },
                {
                  label: costIsCitySpecific
                    ? (zhLoc ? '已完成项目' : 'Projects')
                    : (zhLoc ? '大温项目' : 'Metro Projects'),
                  value: String(costSummary.count),
                },
                {
                  label: zhLoc ? '保修' : 'Warranty',
                  value: zhLoc ? '3 年' : '3 yrs',
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

      {/* Service × city intro — a short, real framing built from the service
          long_description's first paragraph (2026-07: replaces the full
          long_description dump, which was identical across all 14 cities of a
          service). The full essay still lives on the /services/{service} hub. */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="sr-only">
            {t('areas.aboutService', { service: localizedService.title, area: localizedArea.name })}
          </h2>
          <div
            className="prose prose-lg max-w-none prose-headings:text-[#1B365D] prose-p:leading-relaxed prose-strong:text-[#1B365D]"
            style={{ color: TEXT_MID }}
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
        </div>
      </section>

      {/* Service-relevant slice of THIS city's area content — 2026-07: replaces
          the old block that re-rendered the ENTIRE /areas/{city} content_en on
          every combo (~71% cross-combo duplication, 100% of the area hub). We
          now extract ONLY the markdown section about this service (kitchen combo
          → the city's kitchen section, bathroom → bathroom section, …), so
          kitchen-richmond ≠ bathroom-richmond ≠ kitchen-burnaby. Null (→ intro
          only) when the city has no section for this service. */}
      {citySlice && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg max-w-none prose-headings:text-[#1B365D] prose-h2:text-2xl prose-h2:mt-0 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-1 prose-a:text-[#C8922A] prose-a:font-medium prose-a:underline prose-a:decoration-1 prose-a:underline-offset-2 prose-strong:text-[#1B365D]"
              style={{ color: TEXT_MID }}
              dangerouslySetInnerHTML={{ __html: renderProseChips(renderProseHtml(citySlice)) }}
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

      {/* Why Choose Us */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('areas.whyChooseArea', { area: localizedArea.name })}
          </h2>
          <BenefitList benefits={(localizedArea.highlights?.length ?? 0) > 0 ? localizedArea.highlights! : benefits} />
        </div>
      </section>

      {/* Featured case-study card — real, city-named, budget-named depth that
          generic service pages lack. The heading is relation-aware so it never
          implies a related (other-city / other-service) project is local. */}
      {featuredProject && (
        <FeaturedCityProject
          project={featuredProject}
          heading={featuredHeading}
          subheading={t('areas.featuredProjectSubheading')}
          viewCta={t('areas.featuredProjectCta')}
        />
      )}

      <RelatedProjectsSection
        heading={relatedHeading}
        projects={relatedProjects}
        categorySlug={serviceSlug}
      />

      {/* Honest availability line for combos with no completed LOCAL project of
          this type — we serve the city (service-area business) and show related
          real work above, without claiming past local projects. */}
      {!hasLocalWork && (
        <section className="pb-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
              {availabilityCta}
            </p>
          </div>
        </section>
      )}

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
