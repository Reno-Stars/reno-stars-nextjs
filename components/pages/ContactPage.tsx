'use client';

import { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, Clock, Shield, Star, CheckCircle } from 'lucide-react';
import { useRouter } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company } from '@/lib/types';
import ContactForm from '@/components/ContactForm';
import {
  NAVY, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, GOLD, neu,
} from '@/lib/theme';

interface ContactPageProps {
  locale: Locale;
  company: Company;
  areaNames: string[];
}

export default function ContactPage({ locale: _locale, company, areaNames }: ContactPageProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleFormSuccess = useCallback(() => {
    router.push('/contact/thank-you');
  }, [router]);

  const contactInfo = useMemo(() => [
    { icon: Phone, title: t('label.phone'), value: company.phone, href: `tel:${company.phone}` },
    { icon: Mail, title: t('label.email'), value: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, title: t('label.address'), value: company.address },
    { icon: Clock, title: t('label.businessHours'), value: t('label.businessHoursDetail') },
  ], [t, company]);

  const heroBadges = useMemo(() => [
    { label: `${company.yearsExperience}+ ${t('stats.yearsExperience')}` },
    { label: `${company.liabilityCoverage} ${t('stats.liabilityCoverage')}` },
  ], [company, t]);

  const whyContactUs = useMemo(() => [
    t('serviceBenefits.freeConsultation'),
    t('locationBenefits.quickResponse'),
    t('locationBenefits.licensedInsured'),
  ], [t]);

  const stats = useMemo(() => [
    { value: '500+', label: t('stats.projectsDone') },
    { value: `${company.yearsExperience}+`, label: t('stats.yearsExperience') },
    { value: '100%', label: t('stats.satisfaction') },
    { value: '24/7', label: t('stats.support') },
  ], [t, company]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            {t('contact.subtitle')}
          </p>
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4">
            {heroBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <Shield className="w-5 h-5" style={{ color: GOLD }} />
                <span className="text-base font-medium text-white/90">{badge.label}</span>
              </div>
            ))}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              role="img"
              aria-label={`5/5 ${t('stats.rating')}`}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4" style={{ fill: GOLD, color: GOLD }} />
              ))}
              <span className="text-base font-medium text-white/90">{t('stats.rating')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <section className="py-4 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Phone className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-base font-medium" style={{ color: TEXT }}>{company.phone}</span>
          </a>
          <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Mail className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-base font-medium" style={{ color: TEXT }}>{company.email}</span>
          </a>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-base font-medium" style={{ color: TEXT_MID }}>
              {t('label.businessHours')}
            </span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Contact Form — shown first on mobile */}
            <div className="order-1 lg:order-2 rounded-2xl p-6 lg:p-8 h-fit lg:sticky lg:top-8" style={{ boxShadow: neu(6), backgroundColor: CARD }}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>
                {t('section.sendUsMessage')}
              </h2>
              <p className="text-base mb-6" style={{ color: TEXT_MID }}>
                {t('section.contactSubtitle3')}
              </p>
              <ContactForm
                submitLabel={t('cta.submitInquiry')}
                onSuccess={handleFormSuccess}
              />
            </div>

            {/* Contact Info */}
            <div className="order-2 lg:order-1">
              {/* Free Consultation Callout */}
              <div
                className="rounded-xl p-5 mb-6"
                style={{
                  boxShadow: neu(4),
                  backgroundColor: CARD,
                  borderLeft: `4px solid ${GOLD}`,
                }}
              >
                <h2 className="text-lg font-bold mb-1" style={{ color: TEXT }}>
                  {t('cta.requestConsultation')}
                </h2>
                <p className="text-base" style={{ color: TEXT_MID }}>
                  {t('serviceBenefits.freeConsultation')}
                </p>
              </div>

              {/* Contact Info Cards */}
              <h2 className="text-2xl font-bold mb-4" style={{ color: TEXT }}>
                {t('section.contactInfo')}
              </h2>
              <div className="space-y-4 mb-6">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl p-5 flex items-start gap-4"
                    style={{ boxShadow: neu(4), backgroundColor: CARD }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: GOLD_PALE }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: GOLD }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold mb-1" style={{ color: TEXT }}>
                        {item.title}
                      </h3>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-base hover:underline"
                          style={{ color: TEXT_MID }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-base whitespace-pre-line" style={{ color: TEXT_MID }}>
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Areas */}
              <div className="rounded-xl p-5 mb-6" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                <h3 className="text-base font-bold mb-3" style={{ color: TEXT }}>
                  {t('section.serviceAreas')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {areaNames.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 rounded-full text-base"
                      style={{ backgroundColor: SURFACE_ALT, color: TEXT_MID }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why Contact Us */}
              <div className="rounded-xl p-5" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                <h3 className="text-base font-bold mb-3" style={{ color: TEXT }}>
                  {t('section.whyUs')}
                </h3>
                <ul className="space-y-2">
                  {whyContactUs.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                      <span className="text-base" style={{ color: TEXT_MID }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center py-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: GOLD }}>{s.value}</div>
              <div className="text-sm font-medium text-white/70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
