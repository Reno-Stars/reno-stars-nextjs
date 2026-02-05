'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import type { Locale } from '@/i18n/config';
import type { Company, Project, LocalizedProject } from '@/lib/types';
import { getLocalizedProject, getCategoriesLocalized } from '@/lib/data/projects';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, SURFACE, TEXT_MID,
} from '@/lib/theme';

interface ProjectCategoryPageProps {
  locale: Locale;
  categorySlug: string;
  company: Company;
  projects: Project[];
}

export default function ProjectCategoryPage({ locale, categorySlug, company, projects }: ProjectCategoryPageProps) {
  const t = useTranslations();
  const allProjects = useMemo(() => projects.map((p) => getLocalizedProject(p, locale)), [projects, locale]);
  const categories = useMemo(() => getCategoriesLocalized(), []);

  // Find the category from slug
  const categoryData = categories.find(
    (c) => c.en.toLowerCase().replace(/\s+/g, '-') === categorySlug
  );

  const categoryName = categoryData ? categoryData[locale] : categorySlug;

  const filteredProjects = allProjects.filter(
    (p) => p.category === categoryName
  );

  const [selectedProject, setSelectedProject] = useState<LocalizedProject | null>(null);

  const handleCardClick = useCallback((project: LocalizedProject) => {
    setSelectedProject(project);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto">
          <VisualBreadcrumb items={[
            { href: '/', label: t('nav.home') },
            { href: '/projects', label: t('nav.projects') },
            { label: categoryName },
          ]} />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('projects.categoryTitle', { category: categoryName })}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {t('projects.categorySubtitle', { category: categoryName })}
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: TEXT_MID }}>
                {t('projects.noProjectsFound')}
              </p>
              <Link
                href="/projects"
                className="mt-4 inline-block px-6 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: GOLD, color: 'white' }}
              >
                {t('cta.viewAllProjects')}
              </Link>
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
