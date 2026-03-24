'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Award, Users, Wrench, Clock, ShieldCheck, Star } from 'lucide-react';
import type { Company } from '@/lib/types';
import CTASection from '@/components/CTASection';
import BenefitList from '@/components/BenefitList';
import {
  NAVY, NAVY_MID, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, neu,
  STEP_TEAL, STEP_TEAL_LIGHT,
  STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_RED, STEP_RED_LIGHT,
} from '@/lib/theme';

interface BenefitsPageProps {
  company: Company;
}

// 6 benefit cards with distinct accent colors
const BENEFITS = [
  {
    icon: Clock,
    titleKey: 'benefits.experience.title',
    descKey: 'benefits.experience.description',
    accent: STEP_TEAL,
    accentLight: STEP_TEAL_LIGHT,
  },
  {
    icon: ShieldCheck,
    titleKey: 'benefits.coverage.title',
    descKey: 'benefits.coverage.description',
    accent: STEP_ORANGE,
    accentLight: STEP_ORANGE_LIGHT,
  },
  {
    icon: Award,
    titleKey: 'benefits.rating.title',
    descKey: 'benefits.rating.description',
    accent: STEP_RED,
    accentLight: STEP_RED_LIGHT,
  },
  {
    icon: Users,
    titleKey: 'benefits.team.title',
    descKey: 'benefits.team.description',
    accent: NAVY,
    accentLight: NAVY_PALE,
  },
  {
    icon: Wrench,
    titleKey: 'benefits.service.title',
    descKey: 'benefits.service.description',
    accent: GOLD,
    accentLight: GOLD_PALE,
  },
] as const;

export default function BenefitsPage({ company }: BenefitsPageProps) {
  const t = useTranslations();

  const trustBadges = useMemo(() => [
    { type: 'stat' as const, value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
    { type: 'stat' as const, value: company.projectsCompleted, label: t('stats.projectsCompleted') },
    { type: 'stat' as const, value: company.liabilityCoverage, label: t('stats.liabilityCoverage') },
    { type: 'rating' as const, label: t('stats.rating') },
  ], [company, t]);

  const stats = useMemo(() => [
    { value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
    { value: company.projectsCompleted, label: t('stats.projectsCompleted') },
    { value: '100%', label: t('stats.satisfactionRate') },
  ], [company, t]);

  const serviceBenefits = useMemo(() => [
    t('serviceBenefits.experience', { years: company.yearsExperience }),
    t('serviceBenefits.coverageAndWarranty'),
    t('serviceBenefits.rating'),
    t('serviceBenefits.licensedInsured'),
    t('serviceBenefits.freeConsultation'),
  ], [company, t]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero with gradient + trust badges */}
      <section
        className="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
        }}
      >
        {/* Decorative background SVGs */}
        <svg
          className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="0.5" />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.03]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <rect x="20" y="20" width="160" height="160" rx="20" stroke="white" strokeWidth="1.5" />
          <rect x="50" y="50" width="100" height="100" rx="12" stroke="white" strokeWidth="1" />
        </svg>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            {t('benefits.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/70 mb-8 sm:mb-10 max-w-2xl mx-auto">
            {t('benefits.subtitle')}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 sm:gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center justify-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {badge.type === 'rating' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 sm:gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5" style={{ fill: GOLD, color: GOLD }} />
                      ))}
                    </div>
                    <span className="text-white/80 text-sm sm:text-base">{badge.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base sm:text-lg" style={{ color: GOLD }}>
                      {badge.value}
                    </span>
                    <span className="text-white/80 text-sm sm:text-base">{badge.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid — 6 cards with accent bars */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="sr-only">{t('benefits.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.titleKey}
                  className="rounded-2xl overflow-hidden"
                  style={{ boxShadow: neu(5), backgroundColor: CARD }}
                >
                  {/* Colored accent bar */}
                  <div className="h-1.5" style={{ backgroundColor: benefit.accent }} />
                  <div className="p-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: benefit.accentLight }}
                    >
                      <Icon className="w-7 h-7" style={{ color: benefit.accent }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: TEXT }}>
                      {t(benefit.titleKey, { years: company.yearsExperience })}
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                      {t(benefit.descKey, { teamSize: company.teamSize })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Benefits Checklist */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: TEXT }}>
              {t('section.benefitsTitle')}
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
              {t('section.benefitsSubtitle')}
            </p>
          </div>
          <BenefitList benefits={serviceBenefits} />
        </div>
      </section>

      {/* Expanded Stats Band — 4 metrics + star rating */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <h2 className="sr-only">{t('stats.srStats')}</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: GOLD }}>
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-white/80">{stat.label}</div>
            </div>
          ))}
          <div className="text-center col-span-2 md:col-span-1">
            <div className="flex justify-center gap-1 mb-1" role="img" aria-label={`5/5 ${t('stats.rating')}`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-7 h-7 md:w-8 md:h-8" style={{ fill: GOLD, color: GOLD }} />
              ))}
            </div>
            <div className="text-sm sm:text-base text-white/80">{t('stats.rating')}</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        heading={t('projects.readyToStart2')}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
      />
    </div>
  );
}
