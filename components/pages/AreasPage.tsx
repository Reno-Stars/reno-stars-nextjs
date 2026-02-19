'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import { getLocalizedArea } from '@/lib/data';
import type { Company, ServiceArea } from '@/lib/types';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import {
  NAVY, GOLD, SURFACE,
  CARD, TEXT, TEXT_MID, neu,
} from '@/lib/theme';

interface AreasPageProps {
  locale: Locale;
  areas: ServiceArea[];
  company: Company;
}

export default function AreasPage({ locale, areas, company }: AreasPageProps) {
  const t = useTranslations();

  const localizedAreas = useMemo(
    () => areas.map((area) => ({ ...getLocalizedArea(area, locale), slug: area.slug })),
    [areas, locale],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { label: t('areas.title') },
          ]} />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('areas.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {t('areas.subtitle')}
          </p>
        </div>
      </section>

      {/* Area Cards */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="sr-only">{t('areas.title')}</h2>
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

      <CTASection
        heading={t('cta.freeQuoteProject')}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
      />
    </div>
  );
}
