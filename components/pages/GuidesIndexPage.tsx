'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { DollarSign, Bath, Home, ArrowDownToLine, Building2, Paintbrush, Landmark, ArrowRight } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import CTASection from '@/components/CTASection';
import {
  NAVY, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT, STEP_GREEN, STEP_GREEN_LIGHT, STEP_RED, STEP_RED_LIGHT,
} from '@/lib/theme';

interface GuidesIndexPageProps {
  locale: Locale;
}

const GUIDES = [
  { slug: 'kitchen-renovation-cost-vancouver',          key: 'kitchen',       icon: DollarSign,     accent: STEP_TEAL,   accentLight: STEP_TEAL_LIGHT },
  { slug: 'bathroom-renovation-cost-vancouver',         key: 'bathroom',      icon: Bath,           accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT },
  { slug: 'whole-house-renovation-cost-vancouver',      key: 'wholeHouse',    icon: Home,           accent: NAVY,        accentLight: '#E8EBF0' },
  { slug: 'basement-renovation-cost-vancouver',         key: 'basement',      icon: ArrowDownToLine,accent: STEP_GREEN,  accentLight: STEP_GREEN_LIGHT },
  { slug: 'commercial-renovation-cost-vancouver',       key: 'commercial',    icon: Building2,      accent: GOLD,        accentLight: GOLD_PALE },
  { slug: 'cabinet-refinishing-cost-vancouver',         key: 'cabinet',       icon: Paintbrush,     accent: STEP_RED,    accentLight: STEP_RED_LIGHT },
  { slug: 'basement-suite-cost-vancouver',              key: 'basementSuite', icon: Landmark,       accent: NAVY,        accentLight: '#E8EBF0' },
] as const;

const COMPARISON_ROWS = ['kitchen', 'bathroom', 'wholeHouse', 'basement'] as const;

export default function GuidesIndexPage({ locale: _locale }: GuidesIndexPageProps) {
  const t = useTranslations();

  return (
    <main>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>
            {t('guides.index.hero.title')}
          </h1>
          <p className="text-lg mb-2" style={{ color: TEXT_MID }}>
            {t('guides.index.hero.subtitle')}
          </p>
          <p className="text-base max-w-3xl mx-auto" style={{ color: TEXT_MID }}>
            {t('guides.index.intro')}
          </p>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link key={guide.slug} href={`/guides/${guide.slug}` as '/guides/kitchen-renovation-cost-vancouver'}>
                <div
                  className="rounded-2xl p-6 transition-transform hover:scale-[1.02] h-full flex flex-col"
                  style={{ backgroundColor: CARD, boxShadow: neu() }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: guide.accentLight }}
                  >
                    <Icon size={24} style={{ color: guide.accent }} />
                  </div>
                  <h2 className="text-lg font-bold mb-1" style={{ color: TEXT }}>
                    {t(`guides.index.${guide.key}.title`)}
                  </h2>
                  <div className="text-sm font-bold mb-2" style={{ color: GOLD }}>
                    {t(`guides.index.${guide.key}.range`)}
                  </div>
                  <p className="text-sm mb-4 flex-1" style={{ color: TEXT_MID }}>
                    {t(`guides.index.${guide.key}.description`)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold mt-auto" style={{ color: GOLD }}>
                    {t('guides.index.readGuide')} <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Per-guide passages — long-form summary block */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>
            {t('guides.index.passages.title')}
          </h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('guides.index.passages.subtitle')}</p>
          <div className="space-y-6">
            {GUIDES.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}` as '/guides/kitchen-renovation-cost-vancouver'}
                  className="block rounded-2xl p-6 transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: CARD, boxShadow: neu() }}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: guide.accentLight }}
                    >
                      <Icon size={20} style={{ color: guide.accent }} />
                    </div>
                    <div className="flex-1 min-w-[260px]">
                      <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold" style={{ color: TEXT }}>
                          {t(`guides.index.${guide.key}.title`)}
                        </h3>
                        <span className="text-sm font-bold" style={{ color: GOLD }}>
                          {t(`guides.index.${guide.key}.range`)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                        {t(`guides.index.${guide.key}.passage`)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold mt-3" style={{ color: GOLD }}>
                        {t('guides.index.readGuide')} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>
            {t('guides.index.comparison.title')}
          </h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('guides.index.comparison.subtitle')}</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: CARD, boxShadow: neu() }}>
            <div className="grid grid-cols-4 gap-2 p-4 font-bold text-xs sm:text-sm" style={{ backgroundColor: NAVY_PALE, color: NAVY }}>
              <span>{t('guides.index.comparison.headerProject')}</span>
              <span className="text-center">{t('guides.index.comparison.headerBudget')}</span>
              <span className="text-center">{t('guides.index.comparison.headerMid')}</span>
              <span className="text-right">{t('guides.index.comparison.headerHigh')}</span>
            </div>
            {COMPARISON_ROWS.map((row) => {
              const tiers = t.raw(`guides.index.comparison.${row}`) as string[];
              return (
                <div key={row} className="grid grid-cols-4 gap-2 p-4 text-xs sm:text-sm border-t" style={{ borderColor: SURFACE_ALT, color: TEXT_MID }}>
                  <span className="font-semibold" style={{ color: TEXT }}>
                    {t(`guides.index.${row}.title`)}
                  </span>
                  <span className="text-center">{tiers[0]}</span>
                  <span className="text-center">{tiers[1]}</span>
                  <span className="text-right font-semibold" style={{ color: GOLD }}>{tiers[2]}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center mt-4" style={{ color: TEXT_MUTED }}>
            {t('guides.index.comparison.footnote')}
          </p>
        </div>
      </section>

      {/* Hub-level FAQs */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center" style={{ color: TEXT }}>
            {t('guides.index.faqs.title')}
          </h2>
          <p className="text-center mb-8" style={{ color: TEXT_MID }}>{t('guides.index.faqs.subtitle')}</p>
          <div className="space-y-4">
            {(['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((key) => (
              <div key={key} className="rounded-xl p-5" style={{ backgroundColor: CARD, boxShadow: neu() }}>
                <h3 className="font-bold mb-2" style={{ color: TEXT }}>
                  {t(`guides.index.faqs.${key}.question`)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                  {t(`guides.index.faqs.${key}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2026-06-26: Planning guide hub links — cross-link /guides/ hub to the 6 major
          blog guide posts. These posts are the SEO-weighted entry points for planning
          queries (contractor selection, financing, timeline, permits, strata rules).
          Adding them here passes PageRank from the high-priority /guides/ hub to each
          blog post and surfaces them for users at the planning stage. */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-center" style={{ color: TEXT }}>
            More Renovation Planning Guides
          </h2>
          <p className="text-center text-sm mb-6" style={{ color: TEXT_MID }}>
            Beyond cost guides — everything you need to plan a successful Metro Vancouver renovation.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: '/blog/how-to-choose-renovation-contractor-vancouver', label: 'How to Choose a Renovation Contractor', desc: 'Vetting tips, red flags, and what to look for in a Vancouver contractor.' },
              { href: '/blog/renovation-financing-vancouver-heloc', label: 'How to Finance Your Renovation (HELOC)', desc: 'HELOC, home equity loans, and financing options for Metro Vancouver homeowners.' },
              { href: '/blog/renovation-timeline-how-long-does-each-project-take', label: 'Renovation Timeline Guide', desc: 'How long each type of renovation takes — from planning to completion.' },
              { href: '/blog/renovation-permits-bc-guide', label: 'BC Renovation Permits Guide', desc: 'When you need a permit, how to apply, and what happens if you skip it.' },
              { href: '/blog/strata-renovation-rules-vancouver', label: 'BC Strata Renovation Rules', desc: 'How to get strata council approval and what rules apply to condo renovations.' },
              { href: '/blog/renovation-cost-vancouver-2026-complete-guide', label: 'Complete Vancouver Renovation Cost Guide 2026', desc: 'Full breakdown of renovation costs across all project types in Metro Vancouver.' },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href as '/blog/how-to-choose-renovation-contractor-vancouver'}
                className="block rounded-xl p-5 transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <span className="block font-bold text-sm mb-1" style={{ color: NAVY }}>{label}</span>
                <span className="block text-xs leading-relaxed" style={{ color: TEXT_MID }}>{desc}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: GOLD }}>
                  Read guide <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2026-06-26: Specialty & property-type renovation guides. Passes PageRank from
          the high-priority /guides/ hub to newly elevated specialty posts (ADU, heritage,
          aging-in-place, insurance, tax credits, DIY). These posts were elevated to guide
          tier in the sitemap but needed hub-level inbound links to fully benefit. */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-center" style={{ color: TEXT }}>
            Specialty Renovation Guides
          </h2>
          <p className="text-center text-sm mb-6" style={{ color: TEXT_MID }}>
            Property-type specific guides, financial resources, and renovation decision guides.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: '/blog/adu-renovation-vancouver-2026', label: 'ADU & Laneway House Renovation', desc: 'Costs, permits, and design for secondary suites and laneway homes in Vancouver.' },
              { href: '/blog/heritage-home-renovation-vancouver-2026', label: 'Heritage Home Renovation Vancouver', desc: 'Navigating heritage alteration permits while modernizing character homes.' },
              { href: '/blog/aging-in-place-renovation-guide-bc', label: 'Aging-in-Place Renovation Guide BC', desc: 'Accessible modifications, grab bars, walk-in showers, and barrier-free design.' },
              { href: '/blog/vancouver-renovation-tax-credits-rebates-2026', label: 'Renovation Tax Credits & Rebates 2026', desc: 'BC government grants, energy rebates, and tax incentives for home renovation.' },
              { href: '/blog/renovation-insurance-guide-bc', label: 'Renovation Insurance Guide BC', desc: 'Liability, builder\'s risk, and coverage requirements for Metro Vancouver renovations.' },
              { href: '/blog/diy-vs-contractor-renovation-vancouver-2026', label: 'DIY vs Hiring a Contractor', desc: 'When to DIY and when to hire a professional — with Vancouver cost comparisons.' },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href as '/blog/adu-renovation-vancouver-2026'}
                className="block rounded-xl p-5 transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: CARD, boxShadow: neu() }}
              >
                <span className="block font-bold text-sm mb-1" style={{ color: NAVY }}>{label}</span>
                <span className="block text-xs leading-relaxed" style={{ color: TEXT_MID }}>{desc}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: GOLD }}>
                  Read guide <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        heading={t('guides.index.cta.heading')}
        subtitle={t('guides.index.cta.subtitle')}
      />
    </main>
  );
}
