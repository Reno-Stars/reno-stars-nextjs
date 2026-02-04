'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceType } from '@/lib/types';
import {
  getLocalizedService,
  getServiceAreaBySlug,
  getLocalizedArea,
  getAllProjectsLocalized,
} from '@/lib/data';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import {
  NAVY, GOLD, SURFACE, TEXT,
} from '@/lib/theme';

interface ServiceLocationPageProps {
  locale: Locale;
  serviceSlug: ServiceType;
  citySlug: string;
  company: Company;
  service: Service;
}

export default function ServiceLocationPage({ locale, serviceSlug, citySlug, company, service }: ServiceLocationPageProps) {
  const t = useTranslations();
  const area = getServiceAreaBySlug(citySlug);

  if (!area) notFound();

  const localizedService = useMemo(() => getLocalizedService(service, locale), [service, locale]);
  const localizedArea = useMemo(() => getLocalizedArea(area, locale), [area, locale]);
  const allProjects = useMemo(() => getAllProjectsLocalized(locale), [locale]);

  // Filter projects by both service type and location
  const relatedProjects = useMemo(() => allProjects
    .filter((p) => p.service_type === serviceSlug || p.location_city.toLowerCase() === localizedArea.name.toLowerCase())
    .slice(0, 3), [allProjects, serviceSlug, localizedArea.name]);

  const title = t('areas.serviceInArea', { service: localizedService.title, area: localizedArea.name });

  const benefits = [
    t('locationBenefits.localExpertise'),
    t('locationBenefits.freeOnsite'),
    t('locationBenefits.competitivePricing'),
    t('locationBenefits.quickResponse'),
    t('locationBenefits.experience', { years: company.yearsExperience }),
    t('locationBenefits.licensedInsured'),
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        {service.image && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={service.image}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { href: '/services', label: t('nav.services') },
            { href: `/services/${serviceSlug}`, label: localizedService.title },
            { label: localizedArea.name },
          ]} />
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" style={{ color: GOLD }} />
            <span className="text-sm font-medium" style={{ color: GOLD }}>{localizedArea.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {localizedArea.description || localizedService.description}
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('areas.whyChooseArea', { area: localizedArea.name })}
          </h2>
          <BenefitList benefits={benefits} />
        </div>
      </section>

      <RelatedProjectsSection
        heading={t('areas.areaProjects', { area: localizedArea.name })}
        projects={relatedProjects}
      />

      <CTASection
        heading={t('areas.readyToStartIn', { area: localizedArea.name, service: localizedService.title })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        bg={SURFACE}
        phone={company.phone}
      />
    </div>
  );
}
