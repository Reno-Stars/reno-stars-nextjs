'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HouseStack from '@/components/admin/HouseStack';
import SiteForm from '@/components/admin/SiteForm';
import ProjectForm from '@/components/admin/ProjectForm';
import { updateSite } from '@/app/actions/admin/sites';
import { createProject, updateProject, deleteProject, reorderProjectsInSite, moveProjectToSite } from '@/app/actions/admin/projects';
import MoveProjectDialog from '@/components/admin/MoveProjectDialog';
import { generateBlogFromProject, generateBlogFromSite } from '@/app/actions/admin/generate-blog';
import { CARD, NAVY, GOLD, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { useToast } from '@/components/admin/ToastProvider';
import { mapDbImagePairToForm } from '@/lib/admin/form-utils';

interface City {
  nameEn: string;
  nameZh: string;
}

interface ProjectImagePair {
  beforeImageUrl: string | null;
  beforeAltTextEn: string | null;
  beforeAltTextZh: string | null;
  afterImageUrl: string | null;
  afterAltTextEn: string | null;
  afterAltTextZh: string | null;
  titleEn: string | null;
  titleZh: string | null;
  captionEn: string | null;
  captionZh: string | null;
  photographerCredit: string | null;
  keywords: string | null;
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
  excerptEn: string | null;
  excerptZh: string | null;
  poNumber: string | null;
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
  imagePairs: ProjectImagePair[];
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
  spaceTypeEn?: string;
  poNumber?: string;
  excerptEn?: string;
  excerptZh?: string;
  metaTitleEn?: string;
  metaTitleZh?: string;
  metaDescriptionEn?: string;
  metaDescriptionZh?: string;
  focusKeywordEn?: string;
  focusKeywordZh?: string;
  seoKeywordsEn?: string;
  seoKeywordsZh?: string;
  showAsProject: boolean;
  featured: boolean;
  isPublished: boolean;
  imagePairs?: {
    beforeUrl: string;
    beforeAltEn: string;
    beforeAltZh: string;
    afterUrl: string;
    afterAltEn: string;
    afterAltZh: string;
    titleEn: string;
    titleZh: string;
    captionEn: string;
    captionZh: string;
    photographerCredit: string;
    keywords: string;
  }[];
}

interface SiteOption {
  id: string;
  titleEn: string;
  titleZh: string;
  poNumber: string | null;
}

interface Props {
  site: SiteData;
  projects: ProjectWithDetails[];
  cities: City[];
  allSites: SiteOption[];
}

export default function SiteDetailClient({ site, projects, cities, allSites }: Props) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isBlogPending, startBlogTransition] = useTransition();
  const [blogMessage, setBlogMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [moveProjectId, setMoveProjectId] = useState<string | null>(null);
  const [isMovePending, startMoveTransition] = useTransition();

  // Pre-select project or new-project form from URL params (e.g. ?project=<id> or ?new)
  const projectParam = searchParams.get('project');
  const isNewParam = searchParams.has('new');
  const hasValidProject = projectParam && projects.some((p) => p.id === projectParam);
  const initialSelected = isNewParam ? 'new' : hasValidProject ? projectParam : 'site';
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
      excerptEn: project.excerptEn ?? '',
      excerptZh: project.excerptZh ?? '',
      poNumber: project.poNumber ?? '',
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
      imagePairs: project.imagePairs.map(mapDbImagePairToForm),
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

  // Handle blog generation from project or site
  const handleGenerateBlog = () => {
    setBlogMessage(null);
    startBlogTransition(async () => {
      const result = selected === 'site'
        ? await generateBlogFromSite(site.id)
        : await generateBlogFromProject(selected);

      if (result.success && result.blogPostId) {
        setBlogMessage({ type: 'success', text: t.sites.blogGenerated });
        router.push(`/admin/blog/${result.blogPostId}`);
      } else {
        setBlogMessage({ type: 'error', text: result.error || t.sites.blogGenerateFailed });
      }
    });
  };

  // Move project to another site
  const handleMoveProject = (targetSiteId: string) => {
    if (!moveProjectId) return;
    startMoveTransition(async () => {
      const result = await moveProjectToSite(moveProjectId, targetSiteId);
      if (result.success) {
        // If the moved project was selected, switch to site view
        if (selected === moveProjectId) {
          setSelected('site');
        }
        setMoveProjectId(null);
        toast(t.sites.moveProjectSuccess, 'success');
        router.refresh();
      } else {
        toast(result.error || t.common.unexpectedError, 'error');
      }
    });
  };

  // Site options for move dialog (exclude current site)
  const moveSiteOptions = useMemo(
    () => allSites
      .filter((s) => s.id !== site.id)
      .map((s) => ({
        id: s.id,
        label: locale === 'zh' ? s.titleZh : s.titleEn,
        searchText: s.poNumber ?? undefined,
      })),
    [allSites, site.id, locale]
  );

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {selectedProject && (
              <button
                type="button"
                onClick={() => setMoveProjectId(selectedProject!.id)}
                disabled={isPending || isMovePending}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: NAVY,
                  backgroundColor: 'transparent',
                  border: `1.5px solid ${NAVY}`,
                  borderRadius: '6px',
                  cursor: isPending || isMovePending ? 'not-allowed' : 'pointer',
                  opacity: isPending || isMovePending ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
                {t.sites.moveProject}
              </button>
            )}
            {selected !== 'new' && !(selected === 'site' && projects.length === 0) && (
              <button
                type="button"
                onClick={handleGenerateBlog}
                disabled={isBlogPending || isPending}
                aria-busy={isBlogPending}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: '#fff',
                  backgroundColor: GOLD,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isBlogPending || isPending ? 'not-allowed' : 'pointer',
                  opacity: isBlogPending || isPending ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {isBlogPending ? t.sites.generatingBlog : t.sites.generateBlog}
              </button>
            )}
            {isPending && (
              <span style={{ fontSize: '0.8125rem', color: 'rgba(27,54,93,0.5)' }}>
                {t.common.processing}
              </span>
            )}
          </div>
        </div>

        {/* Blog generation feedback */}
        {blogMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: blogMessage.type === 'success' ? SUCCESS_BG : ERROR_BG,
              color: blogMessage.type === 'success' ? SUCCESS : ERROR,
            }}
          >
            {blogMessage.text}
          </div>
        )}

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

      {/* Move Project Dialog */}
      <MoveProjectDialog
        open={moveProjectId !== null}
        siteOptions={moveSiteOptions}
        onConfirm={handleMoveProject}
        onCancel={() => setMoveProjectId(null)}
        loading={isMovePending}
      />
    </div>
  );
}
