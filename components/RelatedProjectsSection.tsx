'use client';

import { useState, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { LocalizedProject } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { GOLD, SURFACE_ALT, TEXT, TEXT_MID } from '@/lib/theme';

interface RelatedProjectsSectionProps {
  heading: string;
  projects: LocalizedProject[];
  bg?: string;
}

export default function RelatedProjectsSection({
  heading,
  projects,
  bg = SURFACE_ALT,
}: RelatedProjectsSectionProps) {
  const t = useTranslations();
  const [selectedProject, setSelectedProject] = useState<LocalizedProject | null>(null);

  const handleCardClick = useCallback((project: LocalizedProject) => {
    setSelectedProject(project);
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>
              {heading}
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
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} href={`/projects/${project.slug}`} onClick={handleCardClick} />
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
