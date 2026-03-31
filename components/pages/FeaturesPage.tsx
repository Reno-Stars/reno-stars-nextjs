'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Award, Users, Wrench, Clock, ShieldCheck, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Company } from '@/lib/types';
import CTASection from '@/components/CTASection';
import {
  NAVY, NAVY_MID, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, CARD, TEXT, TEXT_MID, neu,
  STEP_TEAL, STEP_TEAL_LIGHT,
  STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_RED, STEP_RED_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT,
} from '@/lib/theme';

interface FeaturesPageProps {
  company: Company;
}

// Foundation (Trust) cards with icons
const FOUNDATION_ITEMS = [
  { key: 'experience', icon: Clock, accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT },
  { key: 'coverage', icon: ShieldCheck, accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT },
  { key: 'rating', icon: Award, accent: STEP_RED, accentLight: STEP_RED_LIGHT },
  { key: 'team', icon: Users, accent: NAVY, accentLight: NAVY_PALE },
  { key: 'service', icon: Wrench, accent: GOLD, accentLight: GOLD_PALE },
] as const;

// Differentiators (problem/solution)
const DIFFERENTIATOR_KEYS = ['transparent', 'managed', 'responsive', 'scheduled', 'consistent', 'experience'] as const;

export default function FeaturesPage({ company }: FeaturesPageProps) {
  const t = useTranslations('features');

  const trustBadges = useMemo(() => [
    { type: 'stat' as const, value: `${company.yearsExperience}+`, label: t('foundation.items.experience.title') },
    { type: 'stat' as const, value: company.projectsCompleted, label: `${company.projectsCompleted} ${t('foundation.items.rating.title')}` },
    { type: 'stat' as const, value: company.liabilityCoverage, label: company.liabilityCoverage },
    { type: 'rating' as const, label: '5-Star Rating' },
  ], [company, t]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section
        className="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
        }}
      >
        <svg
          className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1" />
        </svg>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/70 mb-8 sm:mb-10 max-w-3xl mx-auto whitespace-pre-line">
            {t('subtitle')}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 sm:gap-4">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {badge.type === 'rating' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 sm:gap-1">
                      {[0, 1, 2, 3, 4].map((j) => (
                        <Star key={j} className="w-4 h-4 sm:w-5 sm:h-5" style={{ fill: GOLD, color: GOLD }} />
                      ))}
                    </div>
                    <span className="text-white/80 text-sm sm:text-base">{badge.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {badge.value && (
                      <span className="font-semibold text-base sm:text-lg" style={{ color: GOLD }}>
                        {badge.value}
                      </span>
                    )}
                    <span className="text-white/80 text-sm sm:text-base">{badge.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Foundation (Trust) Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: NAVY }}>
            {t('foundation.heading')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FOUNDATION_ITEMS.map(({ key, icon: Icon, accent, accentLight }) => (
              <div
                key={key}
                className="p-6 rounded-xl"
                style={{ boxShadow: neu(6), backgroundColor: CARD }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: accentLight }}
                  >
                    <Icon size={24} style={{ color: accent }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: NAVY }}>
                    {t(`foundation.items.${key}.title`)}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                  {t(`foundation.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators (Problem/Solution) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: CARD }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: NAVY }}>
            {t('differentiators.heading')}
          </h2>
          <div className="space-y-6">
            {DIFFERENTIATOR_KEYS.map((key, i) => (
              <div
                key={key}
                className="p-6 md:p-8 rounded-xl"
                style={{ boxShadow: neu(6), backgroundColor: SURFACE }}
              >
                {/* Problem */}
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle size={20} className="mt-0.5 flex-shrink-0" style={{ color: STEP_RED }} />
                  <p className="text-sm md:text-base font-medium" style={{ color: TEXT }}>
                    {t(`differentiators.items.${key}.problem`)}
                  </p>
                </div>
                {/* Solution */}
                <div className="flex items-start gap-3 pl-8">
                  <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" style={{ color: STEP_GREEN }} />
                  <p className="text-sm md:text-base leading-relaxed" style={{ color: TEXT_MID }}>
                    {t(`differentiators.items.${key}.solution`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        heading={t('cta.heading')}
        subtitle={t('cta.subtitle')}
      />
    </div>
  );
}
