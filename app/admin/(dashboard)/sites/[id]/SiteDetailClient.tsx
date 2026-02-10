'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HouseStack from '@/components/admin/HouseStack';
import SiteForm from '@/components/admin/SiteForm';
import ProjectForm from '@/components/admin/ProjectForm';
import { updateSite } from '@/app/actions/admin/sites';
import { createProject, updateProject, deleteProject, reorderProjectsInSite } from '@/app/actions/admin/projects';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

interface City {
  nameEn: string;
  nameZh: string;
}

interface ProjectImage {
  imageUrl: string;
  altTextEn: string | null;
  altTextZh: string | null;
  isBefore: boolean;
  displayOrder: number;
}

interface ProjectScope {
  scopeEn: string;
  scopeZh: string;
  displayOrder: number;
}

interface ProjectExternalProduct {
  url: string;
  imageUrl: string | null;
  labelEn: string;
  labelZh: string;
  displayOrder: number;
}

interface ProjectWithDetails {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  serviceType: string;
  categoryEn: string | null;
  categoryZh: string | null;
  locationCity: string | null;
  budgetRange: string | null;
  durationEn: string | null;
  durationZh: string | null;
  spaceTypeEn: string | null;
  spaceTypeZh: string | null;
  heroImageUrl: string | null;
  challengeEn: string | null;
  challengeZh: string | null;
  solutionEn: string | null;
  solutionZh: string | null;
  badgeEn: string | null;
  badgeZh: string | null;
  metaTitleEn: string | null;
  metaTitleZh: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionZh: string | null;
  focusKeywordEn: string | null;
  focusKeywordZh: string | null;
  seoKeywordsEn: string | null;
  seoKeywordsZh: string | null;
  featured: boolean;
  isPublished: boolean;
  siteId: string;
  displayOrderInSite: number;
  images: ProjectImage[];
  scopes: ProjectScope[];
  externalProducts: ProjectExternalProduct[];
}

interface SiteData {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  locationCity: string;
  heroImageUrl: string;
  badgeEn: string;
  badgeZh: string;
  showAsProject: boolean;
  featured: boolean;
  isPublished: boolean;
  images?: { url: string; altEn: string; altZh: string; isBefore: boolean }[];
}

interface Props {
  site: SiteData;
  projects: ProjectWithDetails[];
  cities: City[];
}

export default function SiteDetailClient({ site, projects, cities }: Props) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Pre-select project from URL param (e.g. ?project=<id>)
  const projectParam = searchParams.get('project');
  const initialSelected = projectParam && projects.some((p) => p.id === projectParam) ? projectParam : 'site';
  const [selected, setSelected] = useState<string | 'site' | 'new'>(initialSelected);

  // Find selected project
  const selectedProject = selected !== 'site' && selected !== 'new'
    ? projects.find((p) => p.id === selected)
    : null;

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (!result.error) {
        // If the deleted project was selected, switch to site view
        if (selected === projectId) {
          setSelected('site');
        }
        router.refresh();
      }
    });
  };

  // Handle project reordering
  const handleReorderProjects = async (projectIds: string[]) => {
    startTransition(async () => {
      const result = await reorderProjectsInSite(site.id, projectIds);
      if (!result.error) {
        router.refresh();
      }
    });
  };

  // Parse budget range string (e.g., "$15,000 - $25,000") into min/max values
  const parseBudgetRange = (range: string | null): { min: string; max: string } => {
    if (!range) return { min: '', max: '' };
    // Remove $ and commas, then extract numbers
    const cleaned = range.replace(/[$,]/g, '');
    // Check for "X+" format (e.g., "$15,000+")
    if (cleaned.endsWith('+')) {
      const min = cleaned.slice(0, -1).trim();
      return { min, max: '' };
    }
    // Check for range format "X - Y"
    const parts = cleaned.split(/\s*-\s*/);
    if (parts.length === 2) {
      return { min: parts[0].trim(), max: parts[1].trim() };
    }
    // Single value
    return { min: '', max: cleaned.trim() };
  };

  // Convert project data to form format
  const getProjectFormData = (project: ProjectWithDetails) => {
    const budget = parseBudgetRange(project.budgetRange);
    return {
      id: project.id,
      slug: project.slug,
      titleEn: project.titleEn,
      titleZh: project.titleZh,
      descriptionEn: project.descriptionEn,
      descriptionZh: project.descriptionZh,
      serviceType: project.serviceType,
      locationCity: project.locationCity ?? '',
      budgetMin: budget.min,
      budgetMax: budget.max,
      durationEn: project.durationEn ?? '',
      durationZh: project.durationZh ?? '',
      spaceTypeEn: project.spaceTypeEn ?? '',
      spaceTypeZh: project.spaceTypeZh ?? '',
      heroImageUrl: project.heroImageUrl ?? '',
      challengeEn: project.challengeEn ?? '',
      challengeZh: project.challengeZh ?? '',
      solutionEn: project.solutionEn ?? '',
      solutionZh: project.solutionZh ?? '',
      badgeEn: project.badgeEn ?? '',
      badgeZh: project.badgeZh ?? '',
      metaTitleEn: project.metaTitleEn ?? '',
      metaTitleZh: project.metaTitleZh ?? '',
      metaDescriptionEn: project.metaDescriptionEn ?? '',
      metaDescriptionZh: project.metaDescriptionZh ?? '',
      focusKeywordEn: project.focusKeywordEn ?? '',
      focusKeywordZh: project.focusKeywordZh ?? '',
      seoKeywordsEn: project.seoKeywordsEn ?? '',
      seoKeywordsZh: project.seoKeywordsZh ?? '',
      featured: project.featured,
      isPublished: project.isPublished,
      siteId: project.siteId,
      images: project.images.map((img) => ({
        url: img.imageUrl,
        altEn: img.altTextEn ?? '',
        altZh: img.altTextZh ?? '',
        isBefore: img.isBefore,
      })),
      scopes: project.scopes.map((s) => ({
        en: s.scopeEn,
        zh: s.scopeZh,
      })),
      externalProducts: project.externalProducts.map((ep) => ({
        url: ep.url,
        imageUrl: ep.imageUrl ?? '',
        labelEn: ep.labelEn,
        labelZh: ep.labelZh,
      })),
    };
  };

  // Get panel title
  const getPanelTitle = () => {
    if (selected === 'site') return t.sites.siteDetails;
    if (selected === 'new') return t.sites.newProjectInSite;
    if (selectedProject) {
      return locale === 'zh' ? selectedProject.titleZh : selectedProject.titleEn;
    }
    return '';
  };

  return (
    <div
      className="admin-site-detail-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '1.5rem',
        alignItems: 'start',
      }}
    >
      {/* Left: House Stack */}
      <div style={{ position: 'sticky', top: '1rem' }}>
        <HouseStack
          site={site}
          projects={projects.map((p) => ({
            id: p.id,
            titleEn: p.titleEn,
            titleZh: p.titleZh,
            serviceType: p.serviceType,
            isPublished: p.isPublished,
            displayOrderInSite: p.displayOrderInSite,
          }))}
          selectedId={selected}
          onSelect={setSelected}
          onDeleteProject={handleDeleteProject}
          onReorderProjects={handleReorderProjects}
        />
      </div>

      {/* Right: Detail Panel */}
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(4),
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(27,54,93,0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: NAVY,
              margin: 0,
            }}
          >
            {getPanelTitle()}
          </h2>
          {isPending && (
            <span style={{ fontSize: '0.8125rem', color: 'rgba(27,54,93,0.5)' }}>
              {t.common.processing}
            </span>
          )}
        </div>

        {/* Panel Content */}
        {selected === 'site' && (
          <SiteForm
            action={updateSite.bind(null, site.id)}
            cities={cities}
            initialData={site}
            submitLabel={t.sites.updateSite}
          />
        )}

        {selected === 'new' && (
          <ProjectForm
            action={createProject}
            cities={cities}
            hideSiteSelector
            fixedSiteId={site.id}
            submitLabel={t.projects.createProject}
          />
        )}

        {selectedProject && (
          <ProjectForm
            key={selectedProject.id}
            action={updateProject.bind(null, selectedProject.id)}
            initialData={getProjectFormData(selectedProject)}
            cities={cities}
            hideSiteSelector
            fixedSiteId={site.id}
            submitLabel={t.projects.updateProject}
          />
        )}
      </div>
    </div>
  );
}
