'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { getAllGalleryItemsLocalized, getAllProjectsLocalized } from '@/lib/data';
import type { Company } from '@/lib/types';
import TetrisGallery from '@/components/TetrisGallery';
import CTASection from '@/components/CTASection';
import RelatedProjectsSection from '@/components/RelatedProjectsSection';
import {
  NAVY, SURFACE, TEXT, neu,
} from '@/lib/theme';

interface DesignPageProps {
  locale: Locale;
  company: Company;
}

export default function DesignPage({ locale, company }: DesignPageProps) {
  const t = useTranslations();
  const gallery = useMemo(() => getAllGalleryItemsLocalized(locale), [locale]);
  const projects = useMemo(() => getAllProjectsLocalized(locale), [locale]);
  const featuredProjects = useMemo(() => projects.filter((p) => p.featured).slice(0, 6), [projects]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('section.designInspirations')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('section.designSubtitle')}
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
            {t('section.gallery')}
          </h2>
          <TetrisGallery
            items={gallery}
            cardClassName="rounded-xl"
            cardStyle={{ boxShadow: neu(5) }}
          />
        </div>
      </section>

      <RelatedProjectsSection
        heading={t('projects.featuredProjects')}
        projects={featuredProjects}
      />

      <CTASection
        heading={t('projects.readyToTransform')}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
        bg={SURFACE}
      />

    </div>
  );
}
