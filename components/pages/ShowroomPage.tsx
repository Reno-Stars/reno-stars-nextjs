'use client';

import { Link } from '@/navigation';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { Company } from '@/lib/types';
import { NAVY, GOLD, SURFACE, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

const NEU8 = neu(8);

interface ShowroomPageProps {
  company: Company;
  showroom: {
    address: string;
    appointmentText: string;
    phone: string;
    email: string;
  };
  translations: {
    heroTitle: string;
    heroSubtitle: string;
    addressTitle: string;
    phoneTitle: string;
    emailTitle: string;
    hoursTitle: string;
    hoursValue: string;
    mapTitle: string;
    ctaTitle: string;
    ctaDescription: string;
    bookConsultation: string;
    callUs: string;
  };
}

export default function ShowroomPage({ company, showroom, translations: t }: ShowroomPageProps) {
  const mapQuery = encodeURIComponent(showroom.address || company.address);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center" style={{ backgroundColor: NAVY }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
            {t.heroTitle}
          </h1>
          <p className="text-lg text-white/80">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Info + Map */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Details */}
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: '#fff', boxShadow: NEU8 }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t.addressTitle}
            </h2>

            {showroom.appointmentText && (
              <p className="text-sm mb-6" style={{ color: TEXT_MID }}>
                {showroom.appointmentText}
              </p>
            )}

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: TEXT_MUTED }}>{t.addressTitle}</p>
                  <p style={{ color: TEXT }}>{showroom.address || company.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: TEXT_MUTED }}>{t.phoneTitle}</p>
                  <a href={`tel:${showroom.phone || company.phone}`} className="hover:underline" style={{ color: TEXT }}>
                    {showroom.phone || company.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: TEXT_MUTED }}>{t.emailTitle}</p>
                  <a href={`mailto:${showroom.email || company.email}`} className="hover:underline" style={{ color: TEXT }}>
                    {showroom.email || company.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: TEXT_MUTED }}>{t.hoursTitle}</p>
                  <p style={{ color: TEXT }}>{t.hoursValue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: NEU8 }}
          >
            <h2 className="sr-only">{t.mapTitle}</h2>
            <iframe
              title={t.mapTitle}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 400 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
            {t.ctaTitle}
          </h2>
          <p className="text-base text-white/80 mb-8">
            {t.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: GOLD,
                boxShadow: `8px 8px 20px rgba(0,0,0,0.5), -8px -8px 20px rgba(255,255,255,0.12), 0 0 30px rgba(200,146,42,0.25)`,
              }}
            >
              {t.bookConsultation}
            </Link>
            <p className="text-white/70 text-sm">
              {t.callUs}{' '}
              <a href={`tel:${company.phone}`} className="text-white hover:underline font-semibold">
                {company.phone}
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
