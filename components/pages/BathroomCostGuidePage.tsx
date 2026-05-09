'use client';

import { useMemo } from 'react';
import { pickLocale } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  DollarSign, Clock, TrendingUp, CheckCircle, AlertTriangle, ArrowRight,
  Droplets,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { KitchenGuideProject } from '@/lib/db/queries';
import CTASection from '@/components/CTASection';
import {
  NAVY, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT,
} from '@/lib/theme';

interface BathroomCostGuidePageProps {
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

export default function BathroomCostGuidePage({ locale, projects }: BathroomCostGuidePageProps) {
  const t = useTranslations('guides.bathroomCost');
  const tGuides = useTranslations('guides.relatedGuides');

  const stats = useMemo(() => {
    const budgets = projects
      .map((p) => parseBudgetRange(p.budgetRange))
      .filter((b): b is [number, number] => b !== null);

    if (budgets.length === 0) {
      return { min: 10_000, max: 60_000, avg: 28_000, count: projects.length };
    }

    const lows = budgets.map((b) => b[0]);
    const highs = budgets.map((b) => b[1]);
    const min = Math.min(10_000, ...lows);
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
    { key: 'budget', icon: DollarSign, accent: STEP_GREEN, accentLight: STEP_GREEN_LIGHT, range: '$10,000 – $20,000' },
    { key: 'midRange', icon: Droplets, accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT, range: '$20,000 – $35,000' },
    { key: 'highEnd', icon: TrendingUp, accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT, range: '$40,000 – $60,000+' },
  ];

  const costFactors = [
    { key: 'tiles', icon: CheckCircle },
    { key: 'shower', icon: CheckCircle },
    { key: 'vanity', icon: CheckCircle },
    { key: 'plumbing', icon: AlertTriangle },
    { key: 'waterproofing', icon: AlertTriangle },
    { key: 'permits', icon: AlertTriangle },
  ];

  // Featured-snippet "quick answer" copy by locale. Tight, factual, and front-
  // loaded with the focus keyword + price range so Google AI Overviews and
  // SERP "Position 0" boxes have a clean passage to extract. Page is currently
  // pos 26 / 1.7K imp / 0.11% CTR (2026-05-09 GSC) — passage-level extraction
  // is the highest-leverage CTR lever before backlinks move us into top-10.
  const quickAnswer = (() => {
    const range = `${formatCurrency(stats.min)}–${formatCurrency(stats.max)}+`;
    const avg = formatCurrency(stats.avg);
    const n = stats.count;
    switch (locale) {
      case 'zh':
        return {
          label: '快速回答',
          body: `2026 年温哥华浴室装修费用为 ${range}，平均约 ${avg}。基于 Reno Stars 已完工的 ${n} 个真实项目：经济型 $10K–$20K（保留水电布局、标准瓷砖+成品梳妆台）；中端 $20K–$35K（定制梳妆台、无框玻璃淋浴、地暖）；高端或多浴室 $40K+（无门槛淋浴、独立浴缸、定制柜体）。施工周期通常 2–8 周。`,
        };
      case 'zh-Hant':
        return {
          label: '快速回答',
          body: `2026 年溫哥華浴室裝修費用為 ${range}，平均約 ${avg}。基於 Reno Stars 已完工的 ${n} 個真實項目：經濟型 $10K–$20K（保留水電佈局、標準磁磚+成品梳妝台）；中端 $20K–$35K（定製梳妝台、無框玻璃淋浴、地暖）；高端或多浴室 $40K+（無門檻淋浴、獨立浴缸、定製櫃體）。施工週期通常 2–8 週。`,
        };
      case 'ja':
        return {
          label: 'クイックアンサー',
          body: `2026年バンクーバーのバスルーム改装費用は ${range}、平均は約 ${avg} です。Reno Stars が完了した ${n} 件の実プロジェクトに基づく：エコノミー $10K–$20K（既存配管維持、標準タイル+完成バニティ）／ミッドレンジ $20K–$35K（カスタムバニティ、フレームレスガラスシャワー、床暖房）／ハイエンド・複数バスルーム $40K+（カーブレスシャワー、独立浴槽、造作キャビネット）。工期は通常 2〜8 週間。`,
        };
      case 'ko':
        return {
          label: '빠른 답변',
          body: `2026년 밴쿠버 욕실 리노베이션 비용은 ${range}이며 평균 약 ${avg}입니다. Reno Stars가 완료한 ${n}개 실제 프로젝트 기준: 예산형 $10K–$20K (기존 배관 유지, 표준 타일+기성 바니티) / 중급 $20K–$35K (맞춤 바니티, 프레임리스 유리 샤워, 바닥 난방) / 고급·다중 욕실 $40K+ (커브리스 샤워, 독립형 욕조, 맞춤 캐비닛). 공사 기간은 보통 2–8주.`,
        };
      case 'es':
        return {
          label: 'Respuesta rápida',
          body: `Una renovación de baño en Vancouver en 2026 cuesta ${range}, con un promedio de ${avg}. Basado en ${n} proyectos reales de Reno Stars: económico $10K–$20K (plomería existente, azulejo estándar + mueble prefabricado); gama media $20K–$35K (mueble a medida, ducha de vidrio sin marco, piso radiante); alta gama o varios baños $40K+ (ducha sin escalón, bañera exenta, gabinetería a medida). La obra dura normalmente 2–8 semanas.`,
        };
      default:
        return {
          label: 'Quick Answer',
          body: `A bathroom renovation in Vancouver costs ${range} in 2026, averaging ${avg}. Based on ${n} completed Reno Stars projects: budget-friendly runs $10K–$20K (existing plumbing, standard tile + stock vanity); mid-range $20K–$35K (custom vanity, frameless glass shower, heated floor); high-end or multi-bathroom $40K+ (curbless shower, freestanding tub, custom cabinetry). Most projects take 2–8 weeks.`,
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

      {/* Above-the-fold fixture-cost callout — captures long-tail searchers
          who landed here for "vanity/bathtub/toilet renovation cost" before
          they bounce. Sits between the hero and the cost-tier section. */}
      <section className="py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl p-5 flex flex-wrap items-center gap-3 justify-center text-center" style={{ backgroundColor: CARD, boxShadow: neu() }}>
            <span className="font-semibold" style={{ color: TEXT }}>
              {locale === 'zh' ? '只想看单项洁具费用？' : 'Looking for a specific fixture cost?'}
            </span>
            {[
              { href: `/${locale}/blog/vanity-renovation-cost-vancouver/`, label: locale === 'zh' ? '梳妆台' : 'Vanity' },
              { href: `/${locale}/blog/bathtub-renovation-cost-vancouver/`, label: locale === 'zh' ? '浴缸' : 'Bathtub' },
              { href: `/${locale}/blog/toilet-renovation-cost-vancouver/`, label: locale === 'zh' ? '马桶' : 'Toilet' },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href as '/blog/vanity-renovation-cost-vancouver/'}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105"
                style={{ backgroundColor: GOLD_PALE, color: GOLD }}
              >
                {p.label} <ArrowRight size={12} className="inline ml-1" />
              </Link>
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

      {projectsByCity.length > 1 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('cityComparison.title')}</h2>
            <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('cityComparison.subtitle')}</p>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD, boxShadow: neu() }}>
              <div className="grid grid-cols-3 gap-3 p-4 font-bold text-sm" style={{ backgroundColor: NAVY_PALE, color: NAVY }}>
                <span>{t('cityComparison.headerCity')}</span>
                <span className="text-center">{t('cityComparison.headerProjects')}</span>
                <span className="text-right">{t('cityComparison.headerRange')}</span>
              </div>
              {projectsByCity.map(([city, cityProjects]) => {
                const ranges = cityProjects.map((p) => parseBudgetRange(p.budgetRange)).filter((r): r is [number, number] => r !== null);
                if (ranges.length === 0) return null;
                const lo = Math.min(...ranges.map((r) => r[0]));
                const hi = Math.max(...ranges.map((r) => r[1]));
                return (
                  <div key={city} className="grid grid-cols-3 gap-3 p-4 text-sm border-t" style={{ borderColor: SURFACE_ALT, color: TEXT_MID }}>
                    <span className="font-semibold" style={{ color: TEXT }}>{city}</span>
                    <span className="text-center">{cityProjects.length}</span>
                    <span className="text-right font-semibold" style={{ color: GOLD }}>
                      {formatCurrency(lo)} – {formatCurrency(hi)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-center mt-4" style={{ color: TEXT_MUTED }}>{t('cityComparison.footnote')}</p>
          </div>
        </section>
      )}

      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>{t('questions.title')}</h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('questions.subtitle')}</p>
          <div className="space-y-4">
            {(['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const).map((key) => (
              <div key={key} className="rounded-xl p-5" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <h3 className="font-bold mb-2" style={{ color: TEXT }}>{t(`questions.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`questions.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Bathroom Cost Deep-Dives — hub→spoke topic cluster.
          Ordered by GSC opportunity (2026-05-04): vanity / bathtub / toilet
          are striking-distance commercial-intent queries. By-size / by-style
          stay as the broader-question slices. */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>
            {locale === 'zh' ? '浴室费用专题深度' : 'Bathroom Cost Deep-Dives'}
          </h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>
            {locale === 'zh' ? '从不同角度切片真实项目数据' : 'The same real-project data sliced different ways for your specific question'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                href: `/${locale}/blog/vanity-renovation-cost-vancouver/`,
                title: locale === 'zh' ? '梳妆台费用' : 'Vanity Cost',
                desc: locale === 'zh' ? '$2K–$9K+ 按等级' : '$2K–$9K+ by tier',
              },
              {
                href: `/${locale}/blog/bathtub-renovation-cost-vancouver/`,
                title: locale === 'zh' ? '浴缸费用' : 'Bathtub Cost',
                desc: locale === 'zh' ? '$2.5K–$12K+ 按形态' : '$2.5K–$12K+ by format',
              },
              {
                href: `/${locale}/blog/toilet-renovation-cost-vancouver/`,
                title: locale === 'zh' ? '马桶费用' : 'Toilet Cost',
                desc: locale === 'zh' ? '$800–$5K+ 按等级' : '$800–$5K+ by tier',
              },
              {
                href: `/${locale}/services/accessible-bathroom/`,
                title: locale === 'zh' ? '无障碍 / 老人浴室' : 'Accessible / Aging-in-Place',
                desc: locale === 'zh' ? '老人 + 轮椅无障碍方案' : 'Aging-in-place + wheelchair access',
              },
              {
                href: `/${locale}/blog/bathroom-renovation-cost-vancouver-by-size/`,
                title: locale === 'zh' ? '按尺寸（3/4/5件套）' : 'By Size (3/4/5-piece)',
                desc: locale === 'zh' ? '$20K–$80K+ 按洁具件数' : '$20K–$80K+ by piece count',
              },
              {
                href: `/${locale}/blog/bathroom-renovation-cost-vancouver-by-style/`,
                title: locale === 'zh' ? '按风格（现代/水疗/传统）' : 'By Style (Modern/Spa/Heritage)',
                desc: locale === 'zh' ? '$25K–$120K+ 按设计风格' : '$25K–$120K+ by design style',
              },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href as '/blog/bathroom-renovation-cost-vancouver-by-size/'}
                className="rounded-xl p-5 flex flex-col gap-2 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <span className="font-bold" style={{ color: TEXT }}>{p.title}</span>
                <span className="text-sm" style={{ color: GOLD }}>{p.desc}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold mt-auto" style={{ color: NAVY }}>
                  {tGuides('viewGuide')} <ArrowRight size={14} />
                </span>
              </Link>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/guides/kitchen-renovation-cost-vancouver', label: tGuides('kitchen'), range: '$15K–$80K' },
              { href: '/guides/whole-house-renovation-cost-vancouver', label: tGuides('wholeHouse'), range: '$50K–$300K+' },
              { href: '/guides/basement-renovation-cost-vancouver', label: tGuides('basement'), range: '$20K–$80K' },
              { href: '/blog/average-bathroom-renovation-cost-vancouver', label: tGuides('bathroom'), range: '$18K–$45K+' },
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
