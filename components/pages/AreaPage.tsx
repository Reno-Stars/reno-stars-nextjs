'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import {
  getServiceAreaBySlug,
  getLocalizedArea,
  getAllProjectsLocalized,
} from '@/lib/data';
import type { Company, LocalizedService } from '@/lib/types';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import {
  NAVY, GOLD, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, neu,
} from '@/lib/theme';

interface AreaPageProps {
  locale: Locale;
  citySlug: string;
  company: Company;
  services: LocalizedService[];
}

export default function AreaPage({ locale, citySlug, company, services }: AreaPageProps) {
  const t = useTranslations();
  const area = getServiceAreaBySlug(citySlug);

  if (!area) notFound();

  const localizedArea = useMemo(() => getLocalizedArea(area, locale), [area, locale]);
  const allProjects = useMemo(() => getAllProjectsLocalized(locale), [locale]);
  const cityProjects = useMemo(() => allProjects.filter(
    (p) => p.location_city.toLowerCase() === localizedArea.name.toLowerCase() ||
           p.location_city.toLowerCase() === area.name.en.toLowerCase()
  ).slice(0, 6), [allProjects, localizedArea.name, area.name.en]);

  const benefits = [
    t('areaBenefits.localTeam'),
    t('areaBenefits.quickResponse'),
    t('areaBenefits.buildingCodes'),
    t('areaBenefits.supplierRelationships'),
    t('areaBenefits.freeOnsite'),
    t('areaBenefits.competitivePricing'),
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { label: localizedArea.name },
          ]} />
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6" style={{ color: GOLD }} />
            <span className="text-lg font-medium" style={{ color: GOLD }}>{localizedArea.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('areas.servingIn', { city: localizedArea.name })}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {localizedArea.description || t('areas.cityDescription', { city: localizedArea.name })}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('areas.servicesInArea', { area: localizedArea.name })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}/${citySlug}`}
                className="rounded-xl p-5 group"
                style={{ boxShadow: neu(4), backgroundColor: CARD }}
              >
                <h3 className="font-bold mb-2 group-hover:text-gold transition-colors" style={{ color: TEXT }}>
                  {service.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: TEXT_MID }}>
                  {service.description}
                </p>
                <span className="text-sm font-semibold flex items-center gap-1" style={{ color: GOLD }}>
                  {t('cta.exploreService', { service: service.title })} <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('areas.whyChooseArea', { area: localizedArea.name })}
          </h2>
          <BenefitList benefits={benefits} />
        </div>
      </section>

      <RelatedProjectsSection
        heading={t('areas.viewProjects', { city: localizedArea.name })}
        projects={cityProjects}
        bg={SURFACE}
      />

      <CTASection
        heading={t('areas.readyToStartRenovation', { area: localizedArea.name })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
      />

    </div>
  );
}
