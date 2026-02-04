'use client';

import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useRouter } from '@/navigation';
import type { Locale } from '@/i18n/config';
import { getAreaNames } from '@/lib/data';
import type { Company } from '@/lib/types';
import ContactForm from '@/components/ContactForm';
import {
  NAVY, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, GOLD, neu,
} from '@/lib/theme';

interface ContactPageProps {
  locale: Locale;
  company: Company;
}

export default function ContactPage({ locale, company }: ContactPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const areas = getAreaNames(locale);

  const contactInfo = [
    { icon: Phone, title: t('label.phone'), value: company.phone, href: `tel:${company.phone}` },
    { icon: Mail, title: t('label.email'), value: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, title: t('label.address'), value: company.address },
    { icon: Clock, title: t('label.businessHours'), value: t('label.businessHoursDetail') },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
                {t('section.contactInfo')}
              </h2>
              <div className="space-y-4 mb-8">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl p-4 flex items-start gap-4"
                    style={{ boxShadow: neu(4), backgroundColor: CARD }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: GOLD_PALE }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: GOLD }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1" style={{ color: TEXT }}>
                        {item.title}
                      </h3>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm hover:underline"
                          style={{ color: TEXT_MID }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm whitespace-pre-line" style={{ color: TEXT_MID }}>
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Areas */}
              <div className="rounded-xl p-5" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: TEXT }}>
                  {t('section.serviceAreas')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ backgroundColor: SURFACE_ALT, color: TEXT_MID }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ boxShadow: neu(6), backgroundColor: CARD }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
                {t('section.sendUsMessage')}
              </h2>
              <ContactForm
                submitLabel={t('cta.submitInquiry')}
                onSuccess={() => router.push('/contact/thank-you')}
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
