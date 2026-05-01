'use client';

import { useMemo } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronRight, MapPin, Star } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import { getLocalizedArea } from '@/lib/data/areas';
import { getLocalizedProject } from '@/lib/data/projects';
import type { Company, Faq, GooglePlaceRating, LocalizedService, Project, ServiceArea } from '@/lib/types';
import { pickLocale } from '@/lib/utils';
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
  allAreas: ServiceArea[];
  company: Company;
  services: LocalizedService[];
  faqs: Faq[];
  areaProjects: Project[];
  /** Optional code-driven intro paragraph that wins over the DB description (used for SEO CTR overrides). */
  introOverride?: string;
  googleReviews?: GooglePlaceRating;
}

// Stable hash-based offset so each city slug shows a different rotation of reviews.
// Same city always shows the same set (cached page is stable across rebuilds).
function cityReviewOffset(slug: string, total: number): number {
  if (total === 0) return 0;
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % total;
}

export default function AreaPage({ locale, area, allAreas, company, services, faqs, areaProjects, introOverride, googleReviews }: AreaPageProps) {
  const t = useTranslations();
  const citySlug = area.slug;

  const localizedArea = useMemo(() => getLocalizedArea(area, locale), [area, locale]);

  // Localize FAQs for the FaqSection component
  const localizedFaqs = useMemo(
    () => faqs.map((faq) => ({
      id: faq.id,
      question: pickLocale(faq.question, locale),
      answer: pickLocale(faq.answer, locale),
    })),
    [faqs, locale],
  );

  // Localize area projects for display
  const localizedProjects = useMemo(
    () => areaProjects.map((p) => getLocalizedProject(p, locale)),
    [areaProjects, locale],
  );

  // Other areas for cross-linking (exclude current area)
  const otherAreas = useMemo(
    () => allAreas
      .filter((a) => a.slug !== area.slug)
      .map((a) => getLocalizedArea(a, locale)),
    [allAreas, area.slug, locale],
  );

  // 2 deterministic reviews per area page, rotated by city slug. Avoids
  // showing the same 2 reviews on every area page (near-duplicate content).
  const cityReviews = useMemo(() => {
    const all = googleReviews?.reviews ?? [];
    if (all.length === 0) return [];
    const offset = cityReviewOffset(area.slug, all.length);
    const pick = 2;
    return Array.from({ length: Math.min(pick, all.length) }, (_, i) => all[(offset + i) % all.length]);
  }, [googleReviews, area.slug]);

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
            {introOverride || localizedArea.description || t('areas.cityDescription', { city: localizedArea.name })}
          </p>
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
                      <OptimizedImage
                        src={project.hero_image}
                        alt={`${project.title} — ${localizedArea.name} renovation project`}
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

      {/* Reviews — 2 reviews rotated by city slug for diversity across the 14 area pages */}
      {cityReviews.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <h2 className="text-2xl font-bold" style={{ color: TEXT }}>
                {t('section.clientReviews')}
              </h2>
              {googleReviews && googleReviews.userRatingCount > 0 && (
                <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_MID }}>
                  <Star className="w-4 h-4 fill-current" style={{ color: GOLD }} />
                  <span className="font-bold" style={{ color: GOLD }}>{googleReviews.rating.toFixed(1)}</span>
                  <span>· {googleReviews.userRatingCount} Google reviews</span>
                </div>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {cityReviews.map((review, idx) => (
                <div key={`${review.authorName}-${idx}`} className="rounded-2xl p-6" style={{ backgroundColor: CARD, boxShadow: neu(4) }}>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: GOLD }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4 line-clamp-6" style={{ color: TEXT_MID }}>
                    {(locale === 'zh' && review.textZh) ? review.textZh : review.text}
                  </p>
                  <div className="flex items-baseline justify-between text-xs" style={{ color: TEXT_MID }}>
                    <span className="font-bold" style={{ color: TEXT }}>{review.authorName}</span>
                    {review.relativePublishTime && <span>{review.relativePublishTime}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Contextual Internal Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
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
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('cta.viewAllServices')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Nearby Service Areas */}
      {otherAreas.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-6" style={{ color: TEXT }}>
              {t('areas.nearbyAreas')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherAreas.map((a) => (
                <Link
                  key={a.slug}
                  href={`/areas/${a.slug}`}
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

      <CTASection
        heading={t('areas.readyToStartRenovation', { area: localizedArea.name })}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
      />

    </div>
  );
}
