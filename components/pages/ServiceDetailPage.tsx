'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Hammer, Bath, Home, ArrowDown, Paintbrush, Building2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceType } from '@/lib/types';
import { getLocalizedService, getAllProjectsLocalized } from '@/lib/data';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import {
  NAVY, GOLD, GOLD_PALE, SURFACE, TEXT,
} from '@/lib/theme';

interface ServiceDetailPageProps {
  locale: Locale;
  serviceSlug: ServiceType;
  company: Company;
  service: Service;
}

const iconMap: Record<string, typeof Hammer> = {
  Hammer,
  Bath,
  Home,
  ArrowDown,
  Paintbrush,
  Building2,
};

export default function ServiceDetailPage({ locale, serviceSlug, company, service }: ServiceDetailPageProps) {
  const t = useTranslations();

  const localizedService = useMemo(() => getLocalizedService(service, locale), [service, locale]);
  const allProjects = useMemo(() => getAllProjectsLocalized(locale), [locale]);
  const relatedProjects = useMemo(() => allProjects.filter((p) => p.service_type === serviceSlug).slice(0, 3), [allProjects, serviceSlug]);
  const Icon = iconMap[service.icon || 'Hammer'] || Hammer;

  const benefits = [
    t('serviceBenefits.freeConsultation'),
    t('serviceBenefits.licensedInsured'),
    t('serviceBenefits.warranty', { warranty: company.warranty }),
    t('serviceBenefits.coverage', { coverage: company.liabilityCoverage }),
    t('serviceBenefits.experience', { years: company.yearsExperience }),
    t('serviceBenefits.rating'),
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: GOLD_PALE }}
            >
              <Icon className="w-8 h-8" style={{ color: GOLD }} />
            </div>
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
      />

      <CTASection
        heading={t('services.getQuoteForService', { service: localizedService.title })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        bg={SURFACE}
        phone={company.phone}
      />
    </div>
  );
}
