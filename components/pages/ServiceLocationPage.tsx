'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Service, ServiceType, ServiceArea, Project, LocalizedService as LocalizedServiceType } from '@/lib/types';
import {
  getLocalizedService,
  getLocalizedArea,
  getLocalizedProject,
} from '@/lib/data';
import CTASection from '@/components/CTASection';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import BenefitList from '@/components/BenefitList';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import FaqSection from '@/components/home/FaqSection';
import StickyComboCta from '@/components/StickyComboCta';
import {
  NAVY, GOLD, SURFACE, SURFACE_ALT, TEXT, TEXT_MID, CARD, neu,
} from '@/lib/theme';
import { renderProseHtml } from '@/lib/markdown-html';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface ServiceLocationPageProps {
  locale: Locale;
  serviceSlug: ServiceType;
  citySlug: string;
  company: Company;
  service: Service;
  area: ServiceArea;
  services?: Service[];
  areas?: ServiceArea[];
  faqs?: FaqItem[];
  areaProjects?: Project[];
}

export default function ServiceLocationPage({
  locale, serviceSlug, citySlug, company, service, area,
  services = [], areas = [], faqs = [], areaProjects = [],
}: ServiceLocationPageProps) {
  const t = useTranslations();

  const localizedService = useMemo(() => getLocalizedService(service, locale), [service, locale]);
  const localizedArea = useMemo(() => getLocalizedArea(area, locale), [area, locale]);

  // Localize and filter projects: prefer area-specific, then service-type matches
  const relatedProjects = useMemo(() => {
    const localized = areaProjects.map((p) => getLocalizedProject(p, locale));
    // Prioritize projects matching the service type
    const serviceMatch = localized.filter((p) => p.service_type === serviceSlug);
    const others = localized.filter((p) => p.service_type !== serviceSlug);
    return [...serviceMatch, ...others].slice(0, 3);
  }, [areaProjects, locale, serviceSlug]);

  // Other areas offering the same service (exclude current), pre-localized
  const otherAreas = useMemo(
    () => areas
      .filter((a) => a.slug !== area.slug)
      .map((a) => ({ slug: a.slug, name: getLocalizedArea(a, locale).name })),
    [areas, area.slug, locale],
  );

  // Other services available in this area (exclude current)
  const otherServices: LocalizedServiceType[] = useMemo(
    () => services
      .filter((s) => s.slug !== serviceSlug)
      .map((s) => getLocalizedService(s, locale)),
    [services, serviceSlug, locale],
  );

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
            <OptimizedImage
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

      {/* Service Description — accepts markdown OR HTML */}
      {localizedService.long_description && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="sr-only">
              {t('areas.aboutService', { service: localizedService.title, area: localizedArea.name })}
            </h2>
            <div
              className="prose prose-lg max-w-none prose-headings:text-[#1B365D] prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-1 prose-strong:text-[#1B365D]"
              style={{ color: TEXT_MID }}
              dangerouslySetInnerHTML={{ __html: renderProseHtml(localizedService.long_description) }}
            />
          </div>
        </section>
      )}

      {/* Area Content */}
      {localizedArea.content && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('areas.areaServiceContent', { service: localizedService.title, area: localizedArea.name })}
            </h2>
            {localizedArea.content.split('\n\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

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

      {/* Why Choose Us */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('areas.whyChooseArea', { area: localizedArea.name })}
          </h2>
          <BenefitList benefits={(localizedArea.highlights?.length ?? 0) > 0 ? localizedArea.highlights! : benefits} />
        </div>
      </section>

      <RelatedProjectsSection
        heading={t('areas.areaProjects', { area: localizedArea.name })}
        projects={relatedProjects}
        categorySlug={serviceSlug}
      />

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <FaqSection
          faqs={faqs}
          translations={{ title: t('areas.serviceFaqTitle', { service: localizedService.title, area: localizedArea.name }) }}
        />
      )}

      {/* Contextual Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link
            href="/workflow"
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
            href={`/services/${serviceSlug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.serviceLinkText', { service: localizedService.title })} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/areas/${citySlug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.areaLinkText', { area: localizedArea.name })} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Other Areas for Same Service */}
      {otherAreas.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('areas.otherAreasForService', { service: localizedService.title })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {otherAreas.map((a) => (
                <Link
                  key={a.slug}
                  href={`/services/${serviceSlug}/${a.slug}`}
                  className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Services in Same Area */}
      {otherServices.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT }}>
              {t('areas.otherServicesInArea', { area: localizedArea.name })}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {otherServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}/${citySlug}`}
                  className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        heading={t('areas.readyToStartIn', { area: localizedArea.name, service: localizedService.title })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        bg={SURFACE_ALT}
        phone={company.phone}
      />
      {/* Mobile-only sticky bottom CTA — combo pages have impressions but
          low CTR; this gives a persistent one-tap quote/call path. */}
      <StickyComboCta
        area={localizedArea.name}
        service={localizedService.title}
        phone={company.phone}
      />
      {/* Spacer so the sticky bar doesn't cover the footer on mobile. */}
      <div aria-hidden className="h-20 sm:hidden" />
    </div>
  );
}
