'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Company, LocalizedProject } from '@/lib/types';
import {
  getAllProjectsLocalized,
  getCategoriesLocalized,
  getProjectLocations,
} from '@/lib/data';
import SelectDropdown from '@/components/SelectDropdown';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface ProjectsPageProps {
  locale: Locale;
  company: Company;
}

export default function ProjectsPage({ locale, company }: ProjectsPageProps) {
  const t = useTranslations();
  const allProjects = useMemo(() => getAllProjectsLocalized(locale), [locale]);
  const categories = useMemo(() => getCategoriesLocalized(), []);
  const locations = useMemo(() => getProjectLocations(), []);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<LocalizedProject | null>(null);

  const handleCardClick = useCallback((project: LocalizedProject) => {
    setSelectedProject(project);
  }, []);

  const categoryOptions = useMemo(() => categories.map((c) => ({
    value: c.en,
    label: c[locale],
  })), [categories, locale]);

  const locationOptions = useMemo(() => [
    { value: 'All', label: t('filter.allLocations') },
    ...locations.map((loc) => ({ value: loc, label: loc })),
  ], [locations, t]);

  const filteredProjects = useMemo(() => allProjects.filter((project) => {
    const categoryMatch = activeCategory === 'All' || project.category === (
      categories.find((c) => c.en === activeCategory)?.[locale] ?? activeCategory
    );
    const locationMatch = locationFilter === 'All' || project.location_city === locationFilter;
    return categoryMatch && locationMatch;
  }), [allProjects, categories, activeCategory, locationFilter, locale]);

  const clearFilters = () => {
    setActiveCategory('All');
    setLocationFilter('All');
  };

  const hasActiveFilters = activeCategory !== 'All' || locationFilter !== 'All';

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('section.ourProjects')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('projects.subtitle')}
          </p>
        </div>
      </section>

      {/* Category Cards — horizontal scroll */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold mb-4" style={{ color: TEXT }}>
            {t('filter.browseByCategory')}
          </h2>
          <div className="flex gap-4 overflow-x-auto p-2 -m-2 snap-x snap-mandatory scrollbar-hide">
            {categories.filter((c) => c.en !== 'All' && allProjects.some((p) => p.category === c[locale])).map((category) => {
              const categoryProjects = allProjects.filter(
                (p) => p.category === category[locale]
              );
              const firstProject = categoryProjects[0];
              const isActive = activeCategory === category.en;

              return (
                <button
                  key={category.en}
                  onClick={() => setActiveCategory(category.en)}
                  className="relative rounded-xl overflow-hidden text-left transition-all duration-200 shrink-0 snap-start"
                  style={{
                    width: '220px',
                    boxShadow: neu(4),
                    ...(isActive
                      ? { outline: `2px solid ${GOLD}`, outlineOffset: '2px' }
                      : {}),
                  }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {firstProject && (
                      <Image
                        src={firstProject.hero_image}
                        alt={category[locale]}
                        fill
                        sizes="220px"
                        className={`object-cover transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-base font-bold text-white block">
                        {category[locale]}
                      </span>
                      <span className="text-xs text-white/70 mt-0.5 block">
                        {categoryProjects.length} {t('filter.projects')}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b" style={{ backgroundColor: SURFACE, borderColor: `${TEXT}10` }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <SelectDropdown
            value={activeCategory}
            onChange={setActiveCategory}
            options={categoryOptions}
            ariaLabel={t('modal.category')}
          />
          <SelectDropdown
            value={locationFilter}
            onChange={setLocationFilter}
            options={locationOptions}
            ariaLabel={t('filter.location')}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              style={{ color: GOLD }}
            >
              <X className="w-4 h-4" />
              {t('filter.clearAll')}
            </button>
          )}

          <span className="ml-auto text-sm" style={{ color: TEXT_MID }}>
            {t('filter.showing')} {filteredProjects.length} {t('filter.projects')}
          </span>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: TEXT_MID }}>
                {t('filter.noProjectsMatch')}
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: GOLD, color: 'white' }}
              >
                {t('filter.clearAll')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} showDescription showChevron onClick={handleCardClick} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        heading={t('projects.readyToStart2')}
        subtitle={t('projects.ctaSubtitle7', { years: company.yearsExperience })}
        phone={company.phone}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
