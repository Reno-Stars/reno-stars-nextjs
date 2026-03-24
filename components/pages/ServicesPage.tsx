'use client';

import { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceArea } from '@/lib/types';
import { getLocalizedService } from '@/lib/data/services';
import { getLocalizedArea } from '@/lib/data/areas';
import {
  GOLD, GOLD_PALE, GOLD_ICON_FILTER, SURFACE, SURFACE_ALT,
  CARD, NAVY, TEXT, TEXT_MID, neu,
} from '@/lib/theme';

interface ServicesPageProps {
  locale: Locale;
  company: Company;
  services: Service[];
  areas: ServiceArea[];
}

export default function ServicesPage({ locale: _locale, company, services, areas }: ServicesPageProps) {
  const t = useTranslations();
  const currentLocale = useLocale() as Locale;
  const localizedServices = useMemo(
    () => services.map((s) => getLocalizedService(s, currentLocale)),
    [services, currentLocale],
  );
  const localizedAreas = useMemo(
    () => areas.map((a) => getLocalizedArea(a, currentLocale)),
    [areas, currentLocale],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: TEXT }}>
            {t('services.hubTitle')}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
            {t('services.hubSubtitle')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedServices.map((service) => {
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-2xl p-6 cursor-pointer transition-all duration-200 group block hover:scale-[1.02]"
                  style={{ boxShadow: neu(6), backgroundColor: CARD }}
                >
                  {service.icon && (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: GOLD_PALE }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={service.icon} alt="" className="w-7 h-7" style={{ filter: GOLD_ICON_FILTER }} />
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors" style={{ color: TEXT }}>
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: TEXT_MID }}>
                    {service.description}
                  </p>
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {service.tags.slice(0, 10).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ backgroundColor: GOLD_PALE, color: NAVY }}
                        >
                          {tag}
                        </span>
                      ))}
                      {service.tags.length > 10 && (
                        <span className="px-2 py-0.5 text-xs" style={{ color: TEXT_MID }}>
                          +{service.tags.length - 10}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: GOLD }}>
                    {t('cta.exploreService', { service: service.title })} <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={{ color: TEXT }}>
            {t('areas.title')}
          </h2>
          <p className="text-base text-center mb-10 max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
            {t('areas.subtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="rounded-xl p-6 group transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: neu(4), backgroundColor: CARD }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                  <h3 className="font-bold text-lg group-hover:text-gold transition-colors" style={{ color: TEXT }}>
                    {area.name}
                  </h3>
                </div>
                {area.description && (
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: TEXT_MID }}>
                    {area.description}
                  </p>
                )}
                <span className="text-sm font-semibold flex items-center gap-1" style={{ color: GOLD }}>
                  {t('areas.viewProjects', { city: area.name })} <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
            {t('projects.readyToStart2')}
          </h2>
          <p className="text-base mb-6" style={{ color: TEXT_MID }}>
            {t('projects.ctaSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
            >
              {t('cta.getFreeQuote')}
            </Link>
            <a
              href={`tel:${company.phone}`}
              className="px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200"
              style={{ boxShadow: neu(4), backgroundColor: CARD, color: TEXT }}
            >
              {t('cta.callNow')} - {company.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Internal Cross-Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('cta.viewAllProjects')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/process"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.processLinkText')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.blogLinkText')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
