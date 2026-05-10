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

interface KitchenCostGuidePageProps {
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

export default function KitchenCostGuidePage({ locale, projects }: KitchenCostGuidePageProps) {
  const t = useTranslations('guides.kitchenCost');
  const tGuides = useTranslations('guides.relatedGuides');
  const tCity = useTranslations('guides.cityCostTable');

  const stats = useMemo(() => {
    const budgets = projects
      .map((p) => parseBudgetRange(p.budgetRange))
      .filter((b): b is [number, number] => b !== null);

    if (budgets.length === 0) {
      return { min: 15_000, max: 72_000, avg: 30_000, count: projects.length };
    }

    const lows = budgets.map((b) => b[0]);
    const highs = budgets.map((b) => b[1]);
    const min = Math.min(15_000, ...lows);
    const max = Math.max(...highs);
    const avg = Math.round(budgets.reduce((sum, b) => sum + (b[0] + b[1]) / 2, 0) / budgets.length);

    return { min, max, avg, count: projects.length };
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
    { key: 'budget', icon: DollarSign, accent: STEP_GREEN, accentLight: STEP_GREEN_LIGHT, range: '$15,000 – $27,000' },
    { key: 'midRange', icon: Home, accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT, range: '$28,000 – $38,000' },
    { key: 'highEnd', icon: TrendingUp, accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT, range: '$40,000 – $72,000+' },
  ];

  const costFactors = [
    { key: 'cabinetry', icon: CheckCircle },
    { key: 'countertops', icon: CheckCircle },
    { key: 'layout', icon: AlertTriangle },
    { key: 'appliances', icon: CheckCircle },
    { key: 'plumbing', icon: AlertTriangle },
    { key: 'permits', icon: AlertTriangle },
  ];

  // Featured-snippet "quick answer" copy by locale. Same pattern that shipped
  // for bathroom-cost on 2026-05-09 — front-loads the focus keyword + price
  // range + 16-project anchor in one tight passage AI Overviews and SERP
  // "Position 0" boxes can extract verbatim. Page is currently pos 11.4 /
  // 1228 imp / 0.08% CTR (2026-05-10 GSC). Top query is "average cost of
  // kitchen remodel" (751 imp pos 10.9) — passage leads with that exact
  // phrasing alongside the Vancouver hook.
  const quickAnswer = (() => {
    const range = `${formatCurrency(stats.min)}–${formatCurrency(stats.max)}+`;
    const avg = formatCurrency(stats.avg);
    const n = stats.count;
    switch (locale) {
      case 'zh':
        return {
          label: '快速回答',
          body: `2026 年温哥华厨房装修费用为 ${range}，平均约 ${avg}。基于 Reno Stars 已完工的 ${n} 个真实厨房项目：经济型 $15K–$27K（保留布局、成品橱柜、层压台面）；中端 $28K–$38K（半定制 Shaker 橱柜、石英石台面、新地砖 + 灯光）；高端 $40K+（全定制橱柜、瀑布岛、高端电器、可能改动布局）。施工周期通常 3–6 周。`,
        };
      case 'zh-Hant':
        return {
          label: '快速回答',
          body: `2026 年溫哥華廚房裝修費用為 ${range}，平均約 ${avg}。基於 Reno Stars 已完工的 ${n} 個真實廚房項目：經濟型 $15K–$27K（保留佈局、成品櫥櫃、層壓台面）；中端 $28K–$38K（半定製 Shaker 櫥櫃、石英石台面、新地磚 + 燈光）；高端 $40K+（全定製櫥櫃、瀑布島、高端電器、可能改動佈局）。施工週期通常 3–6 週。`,
        };
      case 'ja':
        return {
          label: 'クイックアンサー',
          body: `2026年バンクーバーのキッチン改装費用は ${range}、平均は約 ${avg} です。Reno Stars が完了した ${n} 件の実プロジェクトに基づく：エコノミー $15K–$27K（既存レイアウト、ストックキャビネット、ラミネート天板）／ミッドレンジ $28K–$38K（セミカスタム Shaker キャビネット、クォーツ天板、新規床タイル＋照明）／ハイエンド $40K+（フルカスタム造作、ウォーターフォールアイランド、ハイエンド家電、レイアウト変更可能）。工期は通常 3〜6 週間。`,
        };
      case 'ko':
        return {
          label: '빠른 답변',
          body: `2026년 밴쿠버 주방 리노베이션 비용은 ${range}이며 평균 약 ${avg}입니다. Reno Stars가 완료한 ${n}개 실제 주방 프로젝트 기준: 예산형 $15K–$27K (기존 레이아웃 유지, 기성 캐비닛, 라미네이트 상판) / 중급 $28K–$38K (세미커스텀 셰이커 캐비닛, 쿼츠 상판, 신규 바닥 타일 + 조명) / 고급 $40K+ (풀커스텀 캐비닛, 워터폴 아일랜드, 고급 가전, 레이아웃 변경 가능). 공사 기간은 보통 3–6주.`,
        };
      case 'es':
        return {
          label: 'Respuesta rápida',
          body: `Una renovación de cocina en Vancouver en 2026 cuesta ${range}, con un promedio de ${avg}. Basado en ${n} proyectos reales de cocina de Reno Stars: económico $15K–$27K (layout existente, gabinetes de stock, encimera laminada); gama media $28K–$38K (gabinetes Shaker semipersonalizados, encimera de cuarzo, piso nuevo + iluminación); alta gama $40K+ (gabinetería a medida, isla con cascada, electrodomésticos premium, posible cambio de layout). La obra dura normalmente 3–6 semanas.`,
        };
      default:
        return {
          label: 'Quick Answer',
          body: `A kitchen renovation in Vancouver costs ${range} in 2026, with an average kitchen remodel running about ${avg}. Based on ${n} completed Reno Stars kitchen projects: budget-friendly runs $15K–$27K (keep existing layout, stock cabinets, laminate counters); mid-range $28K–$38K (semi-custom Shaker cabinets, quartz counters, new floor tile + lighting); high-end $40K+ (fully custom cabinetry, waterfall island, premium appliances, possible layout changes). Most projects take 3–6 weeks.`,
        };
    }
  })();

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
              <div key={stat.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <div className="text-lg md:text-xl font-bold" style={{ color: GOLD }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: TEXT_MUTED }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured-snippet "Quick Answer" — placed immediately after the hero
          stats so the focus keyword + price range + project count appear in
          one tight passage that AI Overviews and Google's "Position 0" box
          can extract verbatim. Bilingual EN + ZH + zh-Hant + JA + KO + ES;
          other locales fall to EN until proper translations ship. */}
      <section className="py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl p-5" style={{ backgroundColor: CARD, boxShadow: neu(), borderLeft: `4px solid ${GOLD}` }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>
              {quickAnswer.label}
            </div>
            <p className="text-base leading-relaxed" style={{ color: TEXT }}>
              {quickAnswer.body}
            </p>
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
        title={tCity('kitchenTitle')}
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

      {/* Related Guides */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: TEXT }}>
            {tGuides('title')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: '/guides/bathroom-renovation-cost-vancouver', label: tGuides('bathroomGuide'), range: '$10K–$60K+' },
              { href: '/guides/whole-house-renovation-cost-vancouver', label: tGuides('wholeHouse'), range: '$50K–$300K+' },
              { href: '/guides/basement-renovation-cost-vancouver', label: tGuides('basement'), range: '$20K–$80K' },
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

      <CTASection heading={t('cta.heading')} subtitle={t('cta.subtitle')} />
    </main>
  );
}
