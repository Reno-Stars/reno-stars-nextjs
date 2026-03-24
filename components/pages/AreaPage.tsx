'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import { getLocalizedArea } from '@/lib/data/areas';
import { getLocalizedProject } from '@/lib/data/projects';
import type { Company, Faq, LocalizedService, Project, ServiceArea } from '@/lib/types';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import FaqSection from '@/components/home/FaqSection';
import {
  NAVY, GOLD, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, neu,
} from '@/lib/theme';

interface AreaPageProps {
  locale: Locale;
  area: ServiceArea;
  company: Company;
  services: LocalizedService[];
  faqs: Faq[];
  areaProjects: Project[];
}

export default function AreaPage({ locale, area, company, services, faqs, areaProjects }: AreaPageProps) {
  const t = useTranslations();
  const citySlug = area.slug;

  const localizedArea = useMemo(() => getLocalizedArea(area, locale), [area, locale]);

  // Localize FAQs for the FaqSection component
  const localizedFaqs = useMemo(
    () => faqs.map((faq) => ({
      id: faq.id,
      question: faq.question[locale],
      answer: faq.answer[locale],
    })),
    [faqs, locale],
  );

  // Localize area projects for display
  const localizedProjects = useMemo(
    () => areaProjects.map((p) => getLocalizedProject(p, locale)),
    [areaProjects, locale],
  );

  // Use custom highlights when present, fallback to hardcoded i18n benefits
  const benefits = useMemo(() => {
    if (localizedArea.highlights && localizedArea.highlights.length > 0) {
      return localizedArea.highlights;
    }
    return [
      t('areaBenefits.localTeam'),
      t('areaBenefits.quickResponse'),
      t('areaBenefits.buildingCodes'),
      t('areaBenefits.supplierRelationships'),
      t('areaBenefits.freeOnsite'),
      t('areaBenefits.competitivePricing'),
    ];
  }, [localizedArea.highlights, t]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { href: '/areas', label: t('nav.areas') },
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

      {/* Unique Content */}
      {localizedArea.content && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="sr-only">{t('areas.aboutArea', { area: localizedArea.name })}</h2>
            {localizedArea.content.split('\n\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: localizedArea.content ? SURFACE_ALT : SURFACE }}>
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

      {/* Area-specific FAQs */}
      {localizedFaqs.length > 0 && (
        <FaqSection
          faqs={localizedFaqs}
          translations={{
            title: t('areas.faqTitle', { area: localizedArea.name }),
          }}
        />
      )}

      {/* Why Choose Us */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('areas.whyChooseArea', { area: localizedArea.name })}
          </h2>
          <BenefitList benefits={benefits} />
        </div>
      </section>

      {/* Related Projects from DB */}
      {localizedProjects.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>
                  {t('areas.viewProjects', { city: localizedArea.name })}
                </h2>
                <p className="text-sm" style={{ color: TEXT_MID }}>
                  {t('projects.subtitle')}
                </p>
              </div>
              <Link
                href="/projects"
                className="hidden md:flex items-center gap-1 text-sm font-semibold"
                style={{ color: GOLD }}
              >
                {t('cta.viewAllProjects')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localizedProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="rounded-xl overflow-hidden group"
                  style={{ boxShadow: neu(4), backgroundColor: CARD }}
                >
                  {project.hero_image && (
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <Image
                        src={project.hero_image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold mb-1 group-hover:text-gold transition-colors" style={{ color: TEXT }}>
                      {project.title}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: TEXT_MID }}>
                      {project.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contextual Internal Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
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
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('cta.viewAllServices')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <CTASection
        heading={t('areas.readyToStartRenovation', { area: localizedArea.name })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
      />

    </div>
  );
}
