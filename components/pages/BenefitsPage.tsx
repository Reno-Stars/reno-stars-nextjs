'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Clock, Award, Users, Wrench, CheckCircle, Star } from 'lucide-react';
import { Link } from '@/navigation';
import type { Company } from '@/lib/types';
import {
  NAVY, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, neu,
} from '@/lib/theme';

interface BenefitsPageProps {
  company: Company;
}

export default function BenefitsPage({ company }: BenefitsPageProps) {
  const t = useTranslations();

  const benefitStats = useMemo(() => [
    { value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
    { value: company.liabilityCoverage, label: t('stats.liabilityCoverage') },
    { value: company.warranty, label: t('stats.warranty') },
  ], [company, t]);

  const benefits = [
    {
      icon: Clock,
      titleKey: 'benefits.experience.title',
      descKey: 'benefits.experience.description',
    },
    {
      icon: Shield,
      titleKey: 'benefits.warranty.title',
      descKey: 'benefits.warranty.description',
    },
    {
      icon: CheckCircle,
      titleKey: 'benefits.coverage.title',
      descKey: 'benefits.coverage.description',
    },
    {
      icon: Award,
      titleKey: 'benefits.rating.title',
      descKey: 'benefits.rating.description',
    },
    {
      icon: Users,
      titleKey: 'benefits.team.title',
      descKey: 'benefits.team.description',
    },
    {
      icon: Wrench,
      titleKey: 'benefits.service.title',
      descKey: 'benefits.service.description',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('benefits.title')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {t('benefits.subtitle')}
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="sr-only">{t('benefits.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.titleKey}
                  className="rounded-2xl p-6"
                  style={{ boxShadow: neu(5), backgroundColor: CARD }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: GOLD_PALE }}
                  >
                    <Icon className="w-7 h-7" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: TEXT }}>
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                    {t(benefit.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefitStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: GOLD }}>
                {stat.value}
              </div>
              <div className="text-base text-white/80">{stat.label}</div>
            </div>
          ))}
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-1" role="img" aria-label={`5/5 ${t('stats.rating')}`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-7 h-7 md:w-8 md:h-8" style={{ fill: GOLD, color: GOLD }} />
              ))}
            </div>
            <div className="text-base text-white/80">{t('stats.rating')}</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
            {t('projects.readyToStart2')}
          </h2>
          <p className="text-base mb-6" style={{ color: TEXT_MID }}>
            {t('projects.ctaSubtitle7', { years: company.yearsExperience })}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
            >
              {t('cta.getFreeQuote')}
            </Link>
            <Link
              href="/projects"
              className="px-8 py-3.5 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200"
              style={{ boxShadow: neu(4), backgroundColor: CARD, color: TEXT }}
            >
              {t('cta.viewProjects')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
