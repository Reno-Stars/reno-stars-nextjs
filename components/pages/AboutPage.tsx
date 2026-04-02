'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  Award, Shield, HardHat, Users, Clock, Heart, Target, MapPin, Phone,
  CheckCircle, Star, Building2, ArrowRight, AlertCircle, Wrench,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Company } from '@/lib/types';

import {
  NAVY, NAVY_PALE, GOLD, GOLD_PALE, SURFACE, CARD, TEXT, TEXT_MID, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT,
} from '@/lib/theme';

const VALUES = [
  { key: 'integrity', icon: Shield, accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT },
  { key: 'quality', icon: Award, accent: GOLD, accentLight: GOLD_PALE },
  { key: 'transparency', icon: Target, accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT },
  { key: 'satisfaction', icon: Heart, accent: STEP_GREEN, accentLight: STEP_GREEN_LIGHT },
] as const;

const SYSTEM_ICONS = [Wrench, CheckCircle, Users, Clock, Shield];

const SERVICES = [
  { key: 'kitchen', icon: CheckCircle },
  { key: 'bathroom', icon: CheckCircle },
  { key: 'wholeHouse', icon: CheckCircle },
  { key: 'commercial', icon: CheckCircle },
] as const;

const ABOUT_FAQ_KEYS = [1, 2, 3, 4, 5] as const;

const SERVICE_AREA_CITIES = [
  'Vancouver', 'Richmond', 'Burnaby', 'Surrey', 'Coquitlam',
  'North Vancouver', 'West Vancouver', 'Delta', 'Langley',
  'Maple Ridge', 'New Westminster', 'Port Moody',
] as const;

interface AboutPageProps {
  locale: Locale;
  company: Company;
  badges: { en: string; zh: string }[];
}

export default function AboutPage({ locale, company, badges }: AboutPageProps) {
  const t = useTranslations('aboutPage');
  const localize = (obj: { en: string; zh: string }) => obj[locale] ?? obj.en;

  const stats = useMemo(() => [
    { value: company.yearsExperience + '+', labelKey: 'stats.years', icon: Clock },
    { value: company.projectsCompleted, labelKey: 'stats.projects', icon: Building2 },
    { value: company.teamSize + '+', labelKey: 'stats.team', icon: Users },
    { value: company.liabilityCoverage, labelKey: 'stats.insurance', icon: Shield },
    { value: '', labelKey: 'stats.wcbCoverage', icon: HardHat },
  ], [company]);

  const painPoints: string[] = t.raw('journey.painPoints') as string[];
  const systemItems: { title: string; desc: string }[] = t.raw('offer.systemItems') as { title: string; desc: string }[];
  const guaranteeItems: string[] = t.raw('values.guaranteeItems') as string[];
  const chooseItems: string[] = t.raw('whyUs.chooseItems') as string[];

  return (
    <main>
      {/* Hero */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: NAVY }}>
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: TEXT_MID }}>
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* About Reno Stars (Our Journey) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: CARD }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: GOLD_PALE }}>
              <Clock size={20} style={{ color: GOLD }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>
              {t('journey.title')}
            </h2>
          </div>

          <div className="rounded-xl p-6 md:p-8" style={{ boxShadow: neu(), backgroundColor: SURFACE }}>
            <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: TEXT }}>
              {t('journey.lead')}
            </p>
            <p className="text-base leading-relaxed mb-8" style={{ color: TEXT_MID }}>
              {t('journey.context')}
            </p>

            {/* Pain points */}
            <div className="rounded-xl p-5 mb-8" style={{ backgroundColor: NAVY_PALE }}>
              <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: TEXT_MID }}>
                <AlertCircle size={16} />
                {t('journey.painPointsTitle')}
              </p>
              <ul className="space-y-3">
                {painPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                    <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TEXT_MID }} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Conclusion */}
            <div className="pl-4 border-l-4 mb-8" style={{ borderColor: GOLD }}>
              <p className="text-base font-semibold leading-relaxed" style={{ color: NAVY }}>
                {t('journey.conclusion')}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.map(({ value, labelKey, icon: Icon }) => (
                <div key={labelKey} className="text-center p-4 rounded-xl" style={{ boxShadow: neu(), backgroundColor: CARD }}>
                  <Icon size={24} className="mx-auto mb-2" style={{ color: GOLD }} />
                  {value && <div className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>{value}</div>}
                  <div className={`mt-1 ${!value ? 'text-sm font-bold' : 'text-xs'}`} style={{ color: !value ? NAVY : TEXT_MID }}>{t(labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* A More Structured, Transparent Approach */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: STEP_TEAL_LIGHT }}>
              <Building2 size={20} style={{ color: STEP_TEAL }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{t('offer.title')}</h2>
          </div>

          <p className="text-base md:text-lg font-medium mb-2" style={{ color: TEXT }}>{t('offer.lead')}</p>
          <p className="text-base mb-8" style={{ color: TEXT_MID }}>{t('offer.goal')}</p>

          <p className="text-sm font-semibold mb-5" style={{ color: NAVY }}>{t('offer.systemTitle')}</p>

          <div className="space-y-4 mb-8">
            {systemItems.map((item, i) => {
              const Icon = SYSTEM_ICONS[i % SYSTEM_ICONS.length];
              return (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl" style={{ boxShadow: neu(), backgroundColor: CARD }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: STEP_TEAL_LIGHT }}>
                    <Icon size={20} style={{ color: STEP_TEAL }} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: NAVY }}>{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t('offer.body')}</p>

          {/* Services */}
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {SERVICES.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-start gap-3 p-5 rounded-xl" style={{ boxShadow: neu(), backgroundColor: CARD }}>
                <Icon size={20} className="mt-0.5 flex-shrink-0" style={{ color: STEP_GREEN }} />
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: NAVY }}>{t(`offer.services.${key}.title`)}</h3>
                  <p className="text-sm" style={{ color: TEXT_MID }}>{t(`offer.services.${key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/services" className="inline-flex items-center gap-2 font-semibold transition-colors" style={{ color: GOLD }}>
              {t('offer.viewAll')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Managing Details and Expectations */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: CARD }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: STEP_GREEN_LIGHT }}>
              <Heart size={20} style={{ color: STEP_GREEN }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{t('values.title')}</h2>
          </div>

          <p className="text-base leading-relaxed mb-6" style={{ color: TEXT }}>{t('values.lead')}</p>

          <div className="rounded-xl p-5 md:p-6 mb-6" style={{ backgroundColor: STEP_GREEN_LIGHT }}>
            <p className="font-semibold mb-4" style={{ color: STEP_GREEN }}>{t('values.guarantee')}</p>
            <ul className="space-y-3">
              {guaranteeItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} className="mt-0.5 flex-shrink-0" style={{ color: STEP_GREEN }} />
                  <span className="text-sm md:text-base leading-relaxed" style={{ color: TEXT }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pl-4 border-l-4" style={{ borderColor: GOLD }}>
            <p className="text-base font-medium leading-relaxed" style={{ color: NAVY }}>
              {t('values.closing')}
            </p>
          </div>

          {/* Values cards */}
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {VALUES.map(({ key, icon: Icon, accent, accentLight }) => (
              <div key={key} className="p-5 rounded-xl" style={{ boxShadow: neu(), backgroundColor: SURFACE }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentLight }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <h3 className="font-semibold" style={{ color: NAVY }}>{t(`values.items.${key}.title`)}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`values.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Homeowners Who Value Peace of Mind */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: GOLD_PALE }}>
              <Star size={20} style={{ color: GOLD }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{t('whyUs.title')}</h2>
          </div>

          <p className="text-base leading-relaxed mb-6" style={{ color: TEXT }}>{t('whyUs.lead')}</p>

          <div className="rounded-xl p-5 md:p-6 mb-6" style={{ boxShadow: neu(), backgroundColor: CARD }}>
            <p className="font-semibold mb-4" style={{ color: NAVY }}>{t('whyUs.chooseTitle')}</p>
            <ul className="space-y-3">
              {chooseItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: GOLD_PALE }}>
                    <CheckCircle size={14} style={{ color: GOLD }} />
                  </div>
                  <span className="text-sm md:text-base font-medium" style={{ color: TEXT }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-base leading-relaxed mb-8" style={{ color: TEXT_MID }}>{t('whyUs.specialise')}</p>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div key={badge.en} className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: GOLD_PALE, color: NAVY }}>
                  <Award size={16} className="flex-shrink-0" style={{ color: GOLD }} />
                  {localize(badge)}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">{t('philosophy.title')}</h2>
          <p className="text-base mb-6 text-white/70">{t('philosophy.lead')}</p>
          <blockquote className="text-xl md:text-2xl font-bold mb-6" style={{ color: GOLD }}>
            {t('philosophy.quote')}
          </blockquote>
          <p className="text-base text-white/70">{t('philosophy.closing')}</p>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: CARD }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: STEP_TEAL_LIGHT }}>
              <MapPin size={20} style={{ color: STEP_TEAL }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{t('areas.title')}</h2>
          </div>
          <p className="text-base leading-relaxed mb-6" style={{ color: TEXT }}>{t('areas.description')}</p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_AREA_CITIES.map((city) => (
              <Link key={city} href="/areas" className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-80" style={{ boxShadow: neu(), backgroundColor: SURFACE, color: NAVY }}>
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: NAVY }}>{t('faq.title')}</h2>
          <div className="space-y-4">
            {ABOUT_FAQ_KEYS.map((i) => (
              <details key={i} className="group rounded-xl overflow-hidden" style={{ boxShadow: neu(), backgroundColor: CARD }}>
                <summary className="cursor-pointer p-5 font-semibold flex justify-between items-center list-none" style={{ color: NAVY }}>
                  {t(`faq.q${i}`)}
                  <span className="text-lg transition-transform group-open:rotate-45" style={{ color: GOLD }}>+</span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`faq.a${i}`, { years: company.yearsExperience })}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: CARD }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: NAVY }}>{t('cta.title')}</h2>
          <p className="text-base mb-8" style={{ color: TEXT_MID }}>{t('cta.body')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors" style={{ backgroundColor: GOLD, color: '#fff' }}>
              {t('cta.getQuote')} <ArrowRight size={16} />
            </Link>
            <a href={`tel:${company.phone}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border transition-colors" style={{ borderColor: NAVY, color: NAVY }}>
              <Phone size={16} /> {company.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
