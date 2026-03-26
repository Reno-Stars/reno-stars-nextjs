'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  Award, Shield, Users, Clock, Heart, Target, MapPin, Phone,
  CheckCircle, Star, Building2, ArrowRight,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { AboutSections, Company } from '@/lib/types';

import {
  NAVY, GOLD, GOLD_PALE, SURFACE, CARD, TEXT, TEXT_MID, neu,
  STEP_TEAL, STEP_TEAL_LIGHT, STEP_ORANGE, STEP_ORANGE_LIGHT,
  STEP_GREEN, STEP_GREEN_LIGHT,
} from '@/lib/theme';

interface AboutPageProps {
  locale: Locale;
  about: AboutSections;
  company: Company;
  badges: { en: string; zh: string }[];
}

export default function AboutPage({ locale, about, company, badges }: AboutPageProps) {
  const t = useTranslations('aboutPage');
  const l = (obj: { en: string; zh: string }) => obj[locale] || obj.en;

  const values = [
    { key: 'integrity', icon: Shield, accent: STEP_TEAL, accentLight: STEP_TEAL_LIGHT },
    { key: 'quality', icon: Award, accent: GOLD, accentLight: GOLD_PALE },
    { key: 'transparency', icon: Target, accent: STEP_ORANGE, accentLight: STEP_ORANGE_LIGHT },
    { key: 'satisfaction', icon: Heart, accent: STEP_GREEN, accentLight: STEP_GREEN_LIGHT },
  ];

  const stats = [
    { value: company.yearsExperience + '+', labelKey: 'stats.years', icon: Clock },
    { value: company.projectsCompleted, labelKey: 'stats.projects', icon: Building2 },
    { value: company.teamSize + '+', labelKey: 'stats.team', icon: Users },
    { value: company.liabilityCoverage, labelKey: 'stats.insurance', icon: Shield },
  ];

  const services = [
    { key: 'kitchen', icon: CheckCircle },
    { key: 'bathroom', icon: CheckCircle },
    { key: 'wholeHouse', icon: CheckCircle },
    { key: 'commercial', icon: CheckCircle },
  ];

  return (
    <main>
      {/* Hero Section */}
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

      {/* Our Journey */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: CARD }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: GOLD_PALE }}>
              <Clock size={20} style={{ color: GOLD }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>
              {t('journey.title')}
            </h2>
          </div>
          <div className="rounded-xl p-6 md:p-8" style={{ boxShadow: neu(), backgroundColor: SURFACE }}>
            <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: TEXT }}>
              {l(about.ourJourney)}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map(({ value, labelKey, icon: Icon }) => (
                <div key={labelKey} className="text-center p-4 rounded-xl" style={{ boxShadow: neu(), backgroundColor: CARD }}>
                  <Icon size={24} className="mx-auto mb-2" style={{ color: GOLD }} />
                  <div className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{value}</div>
                  <div className="text-sm mt-1" style={{ color: TEXT_MID }}>{t(labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: STEP_TEAL_LIGHT }}>
              <Building2 size={20} style={{ color: STEP_TEAL }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{t('offer.title')}</h2>
          </div>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: TEXT }}>{l(about.whatWeOffer)}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map(({ key, icon: Icon }) => (
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

      {/* Our Values */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: CARD }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: STEP_GREEN_LIGHT }}>
              <Heart size={20} style={{ color: STEP_GREEN }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{t('values.title')}</h2>
          </div>
          <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: TEXT }}>{l(about.ourValues)}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map(({ key, icon: Icon, accent, accentLight }) => (
              <div key={key} className="p-5 rounded-xl" style={{ boxShadow: neu(), backgroundColor: SURFACE }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentLight }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <h3 className="font-semibold" style={{ color: NAVY }}>{t(`values.items.${key}.title`)}</h3>
                </div>
                <p className="text-sm" style={{ color: TEXT_MID }}>{t(`values.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: GOLD_PALE }}>
              <Star size={20} style={{ color: GOLD }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{t('whyUs.title')}</h2>
          </div>
          <div className="rounded-xl p-6 md:p-8" style={{ boxShadow: neu(), backgroundColor: CARD }}>
            <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: TEXT }}>{l(about.whyChooseUs)}</p>
            {badges.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-3 mt-6">
                {badges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: GOLD_PALE, color: NAVY }}>
                    <Award size={16} className="flex-shrink-0" style={{ color: GOLD }} />
                    {l(badge)}
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: TEXT }}>{t('areas.description')}</p>
          <div className="flex flex-wrap gap-2">
            {['Vancouver', 'Richmond', 'Burnaby', 'Surrey', 'Coquitlam',
              'North Vancouver', 'West Vancouver', 'Delta', 'Langley',
              'Maple Ridge', 'New Westminster', 'Port Moody'].map((city) => (
              <Link key={city} href="/areas" className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-80" style={{ boxShadow: neu(), backgroundColor: SURFACE, color: NAVY }}>
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: NAVY }}>{t('faq.title')}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <details key={i} className="group rounded-xl overflow-hidden" style={{ boxShadow: neu(), backgroundColor: CARD }}>
                <summary className="cursor-pointer p-5 font-semibold flex justify-between items-center list-none" style={{ color: NAVY }}>
                  {t(`faq.q${i}`)}
                  <span className="text-lg transition-transform group-open:rotate-45" style={{ color: GOLD }}>+</span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`faq.a${i}`)}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">{t('cta.title')}</h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>{l(about.letsBuildTogether)}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors" style={{ backgroundColor: GOLD, color: '#fff' }}>
              {t('cta.getQuote')} <ArrowRight size={16} />
            </Link>
            <a href={`tel:${company.phone}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border transition-colors" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              <Phone size={16} /> {company.phone}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
