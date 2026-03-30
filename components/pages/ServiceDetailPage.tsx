'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceArea, ServiceType } from '@/lib/types';
import { getLocalizedService, getAllProjectsLocalized } from '@/lib/data';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import { Link } from '@/navigation';
import { getLocalizedArea } from '@/lib/data/areas';
import {
  NAVY, GOLD_PALE, GOLD_ICON_FILTER, SURFACE, SURFACE_ALT, TEXT, CARD, neu,
} from '@/lib/theme';

interface ServiceDetailPageProps {
  locale: Locale;
  serviceSlug: ServiceType;
  company: Company;
  service: Service;
  areas?: ServiceArea[];
}

export default function ServiceDetailPage({ locale, serviceSlug, company, service, areas = [] }: ServiceDetailPageProps) {
  const t = useTranslations();

  const localizedService = useMemo(() => getLocalizedService(service, locale), [service, locale]);
  const allProjects = useMemo(() => getAllProjectsLocalized(locale), [locale]);
  const relatedProjects = useMemo(() => allProjects.filter((p) => p.service_type === serviceSlug).slice(0, 3), [allProjects, serviceSlug]);
  const benefits = localizedService.benefits && localizedService.benefits.length > 0
    ? localizedService.benefits
    : [
        t('serviceBenefits.freeConsultation'),
        t('serviceBenefits.licensedInsured'),
        t('serviceBenefits.coverageAndWarranty'),
        t('serviceBenefits.experience', { years: company.yearsExperience }),
        t('serviceBenefits.rating'),
        t('serviceBenefits.projectsDone'),
      ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        {service.image && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={service.image}
              alt={localizedService.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { href: '/services', label: t('nav.services') },
            { label: localizedService.title },
          ]} />
          <div className="flex items-start gap-6">
            {service.icon && (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: GOLD_PALE }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={service.icon} alt="" className="w-8 h-8" style={{ filter: GOLD_ICON_FILTER }} />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {localizedService.title}
              </h1>
              <p className="text-lg text-white/70 max-w-2xl">
                {localizedService.long_description || localizedService.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Tags */}
      {localizedService.tags && localizedService.tags.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
              {t('section.whatWeDo')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {localizedService.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('section.whyUs')}
          </h2>
          <BenefitList benefits={benefits} />
        </div>
      </section>

      <RelatedProjectsSection
        heading={t('section.ourProjects')}
        projects={relatedProjects}
        categorySlug={serviceSlug}
      />

      {/* Areas We Serve */}
      {areas.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('section.areasWeServe')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {areas.map((area) => {
                const localizedArea = getLocalizedArea(area, locale);
                return (
                  <Link
                    key={area.slug}
                    href={`/services/${serviceSlug}/${area.slug}`}
                    className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                  >
                    {localizedArea.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <CTASection
        heading={t('services.getQuoteForService', { service: localizedService.title })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        bg={SURFACE}
        phone={company.phone}
      />
    </div>
  );
}
