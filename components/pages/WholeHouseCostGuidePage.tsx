'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  DollarSign, Clock, Home, TrendingUp, CheckCircle, AlertTriangle, ArrowRight,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { KitchenGuideProject } from '@/lib/db/queries';
import CTASection from '@/components/CTASection';
import {
  NAVY, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT,
} from '@/lib/theme';

interface WholeHouseCostGuidePageProps {
  locale: Locale;
  projects: KitchenGuideProject[];
}

function parseBudgetRange(range: string | null): [number, number] | null {
  if (!range) return null;
  const nums = range.match(/[\d,]+/g);
  if (!nums || nums.length < 2) return null;
  return [parseInt(nums[0].replace(/,/g, ''), 10), parseInt(nums[1].replace(/,/g, ''), 10)];
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-CA');
}

export default function WholeHouseCostGuidePage({ locale, projects }: WholeHouseCostGuidePageProps) {
  const t = useTranslations('guides.wholeHouseCost');

  // Use fixed pricing — DB projects have outdated budget ranges that misrepresent whole-house costs
  const stats = useMemo(() => ({
    min: 50_000, max: 200_000, avg: 90_000, count: projects.length,
  }), [projects]);

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
    { key: 'budget', icon: DollarSign, accent: STEP_GREEN, accentLight: STEP_GREEN_LIGHT, range: '$50,000 – $80,000' },
    { key: 'midRange', icon: Home, accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT, range: '$80,000 – $120,000' },
    { key: 'highEnd', icon: TrendingUp, accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT, range: '$120,000 – $200,000+' },
  ];

  const costFactors = [
    { key: 'scope', icon: CheckCircle },
    { key: 'kitchen', icon: CheckCircle },
    { key: 'bathrooms', icon: AlertTriangle },
    { key: 'flooring', icon: CheckCircle },
    { key: 'structural', icon: AlertTriangle },
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
              { label: t('stats.projects'), value: String(stats.count) },
              { label: t('stats.timeline'), value: t('stats.timelineValue') },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: CARD, ...neu }}>
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
                <div key={tier.key} className="rounded-2xl p-6" style={{ backgroundColor: CARD, ...neu }}>
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
                <div key={factor.key} className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: CARD, ...neu }}>
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
                      style={{ backgroundColor: CARD, ...neu }}
                    >
                      <span className="font-semibold flex-1 min-w-[200px]" style={{ color: TEXT }}>
                        {locale === 'zh' ? project.titleZh : project.titleEn}
                      </span>
                      {project.budgetRange && (
                        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: GOLD_PALE, color: GOLD }}>
                          {project.budgetRange}
                        </span>
                      )}
                      {project.durationEn && (
                        <span className="text-sm flex items-center gap-1" style={{ color: TEXT_MUTED }}>
                          <Clock size={14} /> {locale === 'zh' ? project.durationZh : project.durationEn}
                        </span>
                      )}
                      {project.spaceTypeEn && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: NAVY_PALE, color: NAVY }}>
                          {project.spaceTypeEn}
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


      {/* What is Included Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('included.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('included.subtitle')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['item1', 'item2', 'item3', 'item4', 'item5', 'item6'] as const).map((item) => (
              <div key={item} className="rounded-xl p-5 flex gap-4" style={{ backgroundColor: CARD, ...neu }}>
                <div className="flex-shrink-0 mt-1"><CheckCircle size={20} style={{ color: STEP_GREEN }} /></div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: TEXT }}>{t(`included.${item}.title`)}</h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>{t(`included.${item}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>{t('tips.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['tip1', 'tip2', 'tip3', 'tip4'] as const).map((key) => (
              <div key={key} className="rounded-xl p-5" style={{ backgroundColor: CARD, ...neu }}>
                <h3 className="font-bold mb-2" style={{ color: TEXT }}>{t(`tips.${key}.title`)}</h3>
                <p className="text-sm" style={{ color: TEXT_MID }}>{t(`tips.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Guides */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>
            {locale === 'zh' ? '相关装修费用指南' : 'Related Renovation Cost Guides'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: '/guides/bathroom-renovation-cost-vancouver', label: locale === 'zh' ? '卫生间装修费用' : 'Bathroom Renovation Cost', range: '$10K–$60K+' },
              { href: '/guides/kitchen-renovation-cost-vancouver', label: locale === 'zh' ? '厨房装修费用' : 'Kitchen Renovation Cost', range: '$15K–$80K' },
              { href: '/guides/basement-renovation-cost-vancouver', label: locale === 'zh' ? '地下室装修费用' : 'Basement Renovation Cost', range: '$20K–$80K' },
            ].map((guide) => (
              <Link key={guide.href} href={guide.href} className="rounded-xl p-5 flex flex-col gap-2 transition-transform hover:scale-[1.02]" style={{ backgroundColor: CARD, ...neu }}>
                <span className="font-bold" style={{ color: TEXT }}>{guide.label}</span>
                <span className="text-sm" style={{ color: GOLD }}>{guide.range}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold mt-auto" style={{ color: NAVY }}>
                  {locale === 'zh' ? '查看指南' : 'View Guide'} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection heading={t('cta.heading')} subtitle={t('cta.subtitle')} />
    </main>
  );
}
