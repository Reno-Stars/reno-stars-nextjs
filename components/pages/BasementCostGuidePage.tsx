'use client';

import { useMemo } from 'react';
import { pickLocale } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  DollarSign, Clock, Home, TrendingUp, CheckCircle, AlertTriangle, ArrowRight,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { KitchenGuideProject } from '@/lib/db/queries';
import CTASection from '@/components/CTASection';
import CostByCityTable from '@/components/guides/CostByCityTable';
import {
  NAVY, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT,
} from '@/lib/theme';

interface BasementCostGuidePageProps {
  locale: Locale;
  projects: KitchenGuideProject[];
  phone?: string;
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-CA');
}

export default function BasementCostGuidePage({ locale, projects, phone }: BasementCostGuidePageProps) {
  const t = useTranslations('guides.basementCost');
  const tGuides = useTranslations('guides.relatedGuides');
  const tCity = useTranslations('guides.cityCostTable');

  const stats = useMemo(() => {
    // Basement renovation market estimates for Metro Vancouver (2025-2026)
    return { min: 30_000, max: 120_000, avg: 55_000, count: projects.length };
  }, [projects]);

  const projectsByCity = useMemo(() => {
    const map = new Map<string, KitchenGuideProject[]>();
    for (const p of projects) {
      const city = p.locationCity || 'Other';
      if (!map.has(city)) map.set(city, []);
      map.get(city)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [projects]);

  const costTiers = [
    { key: 'budget', icon: DollarSign, accent: STEP_GREEN, accentLight: STEP_GREEN_LIGHT, range: '$30,000 – $50,000' },
    { key: 'midRange', icon: Home, accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT, range: '$50,000 – $80,000' },
    { key: 'highEnd', icon: TrendingUp, accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT, range: '$80,000 – $120,000+' },
  ];

  const costFactors = [
    { key: 'waterproofing', icon: AlertTriangle },
    { key: 'framing', icon: CheckCircle },
    { key: 'plumbing', icon: AlertTriangle },
    { key: 'electrical', icon: CheckCircle },
    { key: 'egress', icon: AlertTriangle },
    { key: 'permits', icon: AlertTriangle },
  ];

  return (
    <main>
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>
            {t('hero.title')}
          </h1>
          <p className="text-lg mb-8" style={{ color: TEXT_MID }}>
            {t('hero.subtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: t('stats.avgCost'), value: formatCurrency(stats.avg) },
              { label: t('stats.range'), value: formatCurrency(stats.min) + ' – ' + formatCurrency(stats.max) },
              { label: t('stats.sqft'), value: t('stats.sqftValue') },
              { label: t('stats.timeline'), value: t('stats.timelineValue') },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="text-lg md:text-xl font-bold" style={{ color: GOLD }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('tiers.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('tiers.subtitle')}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {costTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div key={tier.key} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: tier.accentLight }}>
                    <Icon size={20} style={{ color: tier.accent }} />
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{t(`tiers.${tier.key}.title`)}</h3>
                  <div className="text-xl font-bold mb-3" style={{ color: GOLD }}>{tier.range}</div>
                  <p className="text-sm" style={{ color: TEXT_MID }}>{t(`tiers.${tier.key}.description`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('factors.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('factors.subtitle')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {costFactors.map((factor) => {
              const Icon = factor.icon;
              return (
                <div key={factor.key} className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                  <div className="flex-shrink-0 mt-1"><Icon size={20} style={{ color: GOLD }} /></div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: TEXT }}>{t(`factors.${factor.key}.title`)}</h3>
                    <p className="text-sm" style={{ color: TEXT_MID }}>{t(`factors.${factor.key}.description`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CostByCityTable
        projects={projects}
        title={tCity('basementTitle')}
        subtitle={tCity('subtitle')}
        headerCity={tCity('headerCity')}
        headerProjects={tCity('headerProjects')}
        headerAvg={tCity('headerAvg')}
        headerRange={tCity('headerRange')}
        footnote={tCity('footnote')}
      />
      {projects.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('realProjects.title')}</h2>
            <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('realProjects.subtitle', { count: stats.count })}</p>
            {projectsByCity.map(([city, cityProjects]) => (
              <div key={city} className="mb-8">
                <h3 className="text-lg font-bold mb-4" style={{ color: NAVY }}>{city}</h3>
                <div className="grid gap-3">
                  {cityProjects.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      className="rounded-xl p-4 flex flex-wrap items-center gap-3 transition-transform hover:scale-[1.01]"
                      style={{ backgroundColor: CARD, boxShadow: neu() }}
                    >
                      <span className="font-semibold flex-1 min-w-[200px]" style={{ color: TEXT }}>
                        {pickLocale(project.title, locale)}
                      </span>
                      {project.budgetRange && (
                        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: GOLD_PALE, color: GOLD }}>
                          {project.budgetRange}
                        </span>
                      )}
                      {project.durationEn && (
                        <span className="text-sm flex items-center gap-1" style={{ color: TEXT_MUTED }}>
                          <Clock size={14} /> {project.duration ? pickLocale(project.duration, locale) : null}
                        </span>
                      )}
                      {(project.spaceType ? pickLocale(project.spaceType, locale) : null) && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: NAVY_PALE, color: NAVY }}>
                          {project.spaceType ? pickLocale(project.spaceType, locale) : null}
                        </span>
                      )}
                      <ArrowRight size={16} style={{ color: GOLD }} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>{t('tips.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['tip1', 'tip2', 'tip3', 'tip4'] as const).map((key) => (
              <div key={key} className="rounded-xl p-5" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <h3 className="font-bold mb-2" style={{ color: TEXT }}>{t(`tips.${key}.title`)}</h3>
                <p className="text-sm" style={{ color: TEXT_MID }}>{t(`tips.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>Frequently Asked Questions — Basement Renovation Cost Vancouver</h2>
          <div className="space-y-4">
            {(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const).map((key) => (
              <details key={key} className="rounded-xl p-5 group" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center" style={{ color: TEXT }}>
                  {t(`faq.${key}`)}
                  <span className="ml-4 shrink-0 text-lg" style={{ color: GOLD }}>+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`faq.a${key.slice(1)}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Guides */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>
            {tGuides('title')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { href: '/guides/bathroom-renovation-cost-vancouver', label: tGuides('bathroomGuide'), range: '$10K–$60K+' },
              { href: '/guides/kitchen-renovation-cost-vancouver', label: tGuides('kitchen'), range: '$15K–$80K' },
              { href: '/guides/whole-house-renovation-cost-vancouver', label: tGuides('wholeHouse'), range: '$50K–$300K+' },
              { href: '/guides/cabinet-refinishing-cost-vancouver', label: tGuides('cabinetRefinishing'), range: '$4K–$30K+' },
            ].map((guide) => (
              <Link key={guide.href} href={guide.href} className="rounded-xl p-5 flex flex-col gap-2 transition-transform hover:scale-[1.02]" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <span className="font-bold" style={{ color: TEXT }}>{guide.label}</span>
                <span className="text-sm" style={{ color: GOLD }}>{guide.range}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold mt-auto" style={{ color: NAVY }}>
                  {tGuides('viewGuide')} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* /basement-renovation-near-me/ inbound — extends the /X-renovation-
          near-me/ rollout from ServiceDetailPage af552d8 to the matching
          cost-guide page. Shares query intent with the near-me page so
          cross-linking passes maximum PageRank equity. */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm" style={{ color: TEXT_MID }}>
            Searching &ldquo;basement renovation near me&rdquo;?{' '}
            <Link
              href="/basement-renovation-near-me"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              See our service area + booking page →
            </Link>
          </p>
          {/* 2026-06-25: City-specific basement guides. Cross-linking from
              the basement cost guide (high-equity hub) to city posts passes
              PageRank and helps city posts rank for "[city] basement
              renovation" queries. Top 8 cities listed. */}
          <p className="text-sm mt-4" style={{ color: TEXT_MID }}>
            <strong>City-specific basement renovation guides:</strong>{' '}
            <Link href="/blog/basement-renovations-burnaby-2026" className="underline hover:no-underline" style={{ color: GOLD }}>Burnaby</Link>
            {' · '}
            <Link href="/blog/basement-renovation-richmond-bc-2026" className="underline hover:no-underline" style={{ color: GOLD }}>Richmond</Link>
            {' · '}
            <Link href="/blog/basement-renovations-surrey" className="underline hover:no-underline" style={{ color: GOLD }}>Surrey</Link>
            {' · '}
            <Link href="/blog/basement-renovations-coquitlam-2026" className="underline hover:no-underline" style={{ color: GOLD }}>Coquitlam</Link>
            {' · '}
            <Link href="/blog/basement-renovations-north-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>North Vancouver</Link>
            {' · '}
            <Link href="/blog/basement-renovations-langley" className="underline hover:no-underline" style={{ color: GOLD }}>Langley</Link>
            {' · '}
            <Link href="/blog/basement-renovation-west-vancouver-2026" className="underline hover:no-underline" style={{ color: GOLD }}>West Vancouver</Link>
            {' · '}
            <Link href="/blog/basement-renovations-port-coquitlam-2026" className="underline hover:no-underline" style={{ color: GOLD }}>Port Coquitlam</Link>
            {' · '}
            <Link href="/blog/basement-renovations-port-moody" className="underline hover:no-underline" style={{ color: GOLD }}>Port Moody</Link>
            {' · '}
            <Link href="/blog/basement-renovations-maple-ridge" className="underline hover:no-underline" style={{ color: GOLD }}>Maple Ridge</Link>
            {' · '}
            <Link href="/blog/basement-renovation-delta-bc" className="underline hover:no-underline" style={{ color: GOLD }}>Delta</Link>
            {' · '}
            <Link href="/blog/basement-renovation-new-westminster-2026" className="underline hover:no-underline" style={{ color: GOLD }}>New Westminster</Link>
            {' · '}
            <Link href="/blog/basement-renovation-white-rock-2026" className="underline hover:no-underline" style={{ color: GOLD }}>White Rock</Link>
            {' · '}
            <Link href="/blog/basement-renovation-vancouver-complete-guide" className="underline hover:no-underline" style={{ color: GOLD }}>Vancouver</Link>
          </p>
        </div>
      </section>

      {/* 2026-06-26: Planning guide hub links. Cross-linking to major blog guides
          (contractor, timeline, permits, financing) strengthens topical authority
          and passes PageRank to high-equity hub pages. */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm" style={{ color: TEXT_MID }}>
            <strong>Planning your renovation?</strong>{' '}
            <Link href="/blog/how-to-choose-renovation-contractor-vancouver" className="underline hover:no-underline" style={{ color: GOLD }}>How to Choose a Contractor</Link>
            {' · '}
            <Link href="/blog/renovation-timeline-how-long-does-each-project-take" className="underline hover:no-underline" style={{ color: GOLD }}>Renovation Timeline</Link>
            {' · '}
            <Link href="/blog/renovation-permits-bc-guide" className="underline hover:no-underline" style={{ color: GOLD }}>BC Renovation Permits</Link>
            {' · '}
            <Link href="/blog/renovation-financing-vancouver-heloc" className="underline hover:no-underline" style={{ color: GOLD }}>Renovation Financing</Link>
            {' · '}
            <Link href="/blog/renovation-cost-vancouver-2026-complete-guide" className="underline hover:no-underline" style={{ color: GOLD }}>Full Cost Guide 2026</Link>
          </p>
        </div>
      </section>
      <CTASection heading={t('cta.heading')} subtitle={t('cta.subtitle')} phone={phone} />
    </main>
  );
}
