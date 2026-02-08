'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Company, Project, SiteWithProjects, DisplayProject } from '@/lib/types';
import { getLocalizedProject } from '@/lib/data/projects';
import { getCategoriesLocalized } from '@/lib/data';
import SelectDropdown from '@/components/SelectDropdown';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, SURFACE, SURFACE_ALT,
  TEXT, TEXT_MID, neu,
} from '@/lib/theme';

interface ProjectsPageProps {
  locale: Locale;
  company: Company;
  projects: Project[];
  sitesAsProjects?: SiteWithProjects[];
}

export default function ProjectsPage({ locale, company, projects: rawProjects, sitesAsProjects = [] }: ProjectsPageProps) {
  const t = useTranslations();

  // Convert sites to display format (as "Whole House" projects)
  const wholeHouseCategory = t('category.wholeHouse');
  const sitesAsDisplayProjects: DisplayProject[] = useMemo(() =>
    sitesAsProjects
      .filter((site) => site.hero_image) // Skip sites without a hero image
      .map((site) => ({
        id: site.id,
        slug: site.slug,
        title: site.title[locale],
        description: site.description[locale],
        category: wholeHouseCategory,
        // Sites don't have a service_type - they're collections of room projects
        location_city: site.location_city || '',
        hero_image: site.hero_image!,
        images: [{ src: site.hero_image!, alt: site.title[locale] }],
        featured: site.featured,
        badge: site.badge?.[locale],
        isSiteProject: true,
        projectCount: site.project_count ?? site.projects?.length ?? 0,
        // Site-specific aggregated data
        childAreas: site.projects?.map((p) => p.category[locale]) ?? [],
        totalBudget: site.aggregated?.totalBudget,
        totalDuration: site.aggregated?.totalDuration?.[locale],
        allServiceScopes: site.aggregated?.allServiceScopes?.[locale] ?? [],
        allExternalProducts: site.aggregated?.allExternalProducts?.map((ep) => ({
          url: ep.url,
          image_url: ep.image_url,
          label: ep.label[locale],
        })) ?? [],
      })),
  [sitesAsProjects, locale, wholeHouseCategory]);

  // Convert individual projects
  const projectsAsDisplay: DisplayProject[] = useMemo(() =>
    rawProjects.map((p) => ({ ...getLocalizedProject(p, locale), isSiteProject: false })),
  [rawProjects, locale]);

  // Combine all displayable items (sites first if featured, then projects)
  const allProjects: DisplayProject[] = useMemo(() => {
    const featured = [...sitesAsDisplayProjects, ...projectsAsDisplay].filter((p) => p.featured);
    const nonFeatured = [...sitesAsDisplayProjects, ...projectsAsDisplay].filter((p) => !p.featured);
    return [...featured, ...nonFeatured];
  }, [sitesAsDisplayProjects, projectsAsDisplay]);

  const categories = useMemo(() => getCategoriesLocalized(), []);
  const locations = useMemo(() => {
    const locs = new Set([
      ...rawProjects.map((p) => p.location_city),
      ...sitesAsProjects.map((s) => s.location_city).filter(Boolean),
    ]);
    return Array.from(locs).filter(Boolean).sort() as string[];
  }, [rawProjects, sitesAsProjects]);
  const spaceTypes = useMemo(() => {
    const types = new Set(rawProjects.map((p) => p.space_type?.en).filter((v): v is string => !!v));
    return Array.from(types).sort();
  }, [rawProjects]);
  const budgetRanges = useMemo(() => {
    const ranges = new Set(rawProjects.map((p) => p.budget_range).filter((r): r is string => !!r));
    return Array.from(ranges).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
      return numA - numB;
    });
  }, [rawProjects]);

  const projectsRef = useRef<HTMLElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasDragged: false, lastX: 0, velocity: 0, lastTime: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    e.preventDefault();
    dragState.current = { isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, hasDragged: false, lastX: e.pageX, velocity: 0, lastTime: Date.now() };
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
    el.style.scrollSnapType = 'none'; // Disable snap during drag
  }, []);

  const handleDragEnd = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const ds = dragState.current;
    ds.isDown = false;
    el.style.cursor = 'grab';
    el.style.userSelect = '';

    // Apply momentum scrolling
    if (Math.abs(ds.velocity) > 0.5) {
      const momentum = ds.velocity * 150; // Adjust multiplier for momentum strength
      el.scrollBy({ left: -momentum, behavior: 'smooth' });
    }

    // Re-enable snap after momentum settles
    setTimeout(() => {
      el.style.scrollSnapType = 'x proximity';
    }, 300);

    // Reset hasDragged after click event fires (click fires after mouseup)
    requestAnimationFrame(() => { dragState.current.hasDragged = false; });
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    const ds = dragState.current;
    if (!ds.isDown) return;
    const el = categoryScrollRef.current;
    if (!el) return;

    const now = Date.now();
    const dt = now - (ds.lastTime || now);
    const x = e.pageX - el.offsetLeft;
    const walk = x - ds.startX;

    // Calculate velocity for momentum
    if (dt > 0) {
      ds.velocity = (e.pageX - (ds.lastX || e.pageX)) / dt;
    }
    ds.lastX = e.pageX;
    ds.lastTime = now;

    if (Math.abs(walk) > 3) ds.hasDragged = true;
    el.scrollLeft = ds.scrollLeft - walk;
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [spaceTypeFilter, setSpaceTypeFilter] = useState<string>('All');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');
  const neuShadow4 = useMemo(() => neu(4), []);
  const [selectedProject, setSelectedProject] = useState<DisplayProject | null>(null);

  const handleCategoryClick = useCallback((categoryEn: string) => {
    setActiveCategory(categoryEn);
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Open modal for all projects (including whole house site-projects)
  const handleCardClick = useCallback((project: DisplayProject) => {
    setSelectedProject(project);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const categoryOptions = useMemo(() => categories.map((c) => ({
    value: c.en,
    label: c[locale],
  })), [categories, locale]);

  const locationOptions = useMemo(() => [
    { value: 'All', label: t('filter.allLocations') },
    ...locations.map((loc) => ({ value: loc, label: loc })),
  ], [locations, t]);

  const spaceTypeOptions = useMemo(() => [
    { value: 'All', label: t('filter.allSpaceTypes') },
    ...spaceTypes.map((st) => {
      const match = rawProjects.find((p) => p.space_type?.en === st);
      const label = match?.space_type?.[locale] ?? st;
      return { value: st, label };
    }),
  ], [spaceTypes, rawProjects, locale, t]);

  const budgetOptions = useMemo(() => [
    { value: 'All', label: t('filter.allBudgets') },
    ...budgetRanges.map((br) => ({ value: br, label: br })),
  ], [budgetRanges, t]);

  const localizedSpaceType = useMemo(() => {
    if (spaceTypeFilter === 'All') return null;
    const match = rawProjects.find((p) => p.space_type?.en === spaceTypeFilter);
    return match?.space_type?.[locale] ?? null;
  }, [spaceTypeFilter, locale, rawProjects]);

  const filteredProjects = useMemo(() => allProjects.filter((project) => {
    const categoryMatch = activeCategory === 'All' || project.category === (
      categories.find((c) => c.en === activeCategory)?.[locale] ?? activeCategory
    );
    const locationMatch = locationFilter === 'All' || project.location_city === locationFilter;
    const spaceTypeMatch = spaceTypeFilter === 'All' || project.space_type === localizedSpaceType;
    const budgetMatch = budgetFilter === 'All' || project.budget_range === budgetFilter;
    return categoryMatch && locationMatch && spaceTypeMatch && budgetMatch;
  }), [allProjects, categories, activeCategory, locationFilter, spaceTypeFilter, localizedSpaceType, budgetFilter, locale]);

  const clearFilters = useCallback(() => {
    setActiveCategory('All');
    setLocationFilter('All');
    setSpaceTypeFilter('All');
    setBudgetFilter('All');
  }, []);

  const hasActiveFilters = useMemo(() =>
    activeCategory !== 'All' || locationFilter !== 'All' || spaceTypeFilter !== 'All' || budgetFilter !== 'All',
  [activeCategory, locationFilter, spaceTypeFilter, budgetFilter]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('section.ourProjects')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
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
          <div
            ref={categoryScrollRef}
            className="flex gap-4 overflow-x-auto p-2 -m-2 snap-x snap-proximity category-scroll"
            style={{ cursor: 'grab', scrollBehavior: 'auto' }}
            onMouseDown={handleDragStart}
            onMouseLeave={handleDragEnd}
            onMouseUp={handleDragEnd}
            onMouseMove={handleDragMove}
          >
            {categories.filter((c) => c.en !== 'All' && allProjects.some((p) => p.category === c[locale])).map((category) => {
              const categoryProjects = allProjects.filter(
                (p) => p.category === category[locale]
              );
              const firstProject = categoryProjects[0];
              const isActive = activeCategory === category.en;

              return (
                <button
                  key={category.en}
                  onClick={() => { if (!dragState.current.hasDragged) handleCategoryClick(category.en); }}
                  className="relative rounded-xl overflow-hidden transition-all duration-200 shrink-0 snap-start group/cat"
                  style={{
                    width: '220px',
                    boxShadow: isActive ? `0 0 0 2px ${GOLD}` : neuShadow4,
                  }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {firstProject && (
                      <Image
                        src={firstProject.hero_image}
                        alt={category[locale]}
                        fill
                        sizes="220px"
                        className={`object-cover transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover/cat:scale-105'}`}
                      />
                    )}
                    <div
                      className="absolute inset-0 transition-colors duration-200"
                      style={{ backgroundColor: isActive ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.45)' }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-xl font-bold text-white block mb-1 drop-shadow-lg">
                        {category[locale]}
                      </span>
                      <span className="text-sm text-white/90 block">
                        {categoryProjects.length} {t('filter.projects')}
                      </span>
                      {isActive && (
                        <div className="w-8 h-0.5 rounded-full mt-2" style={{ backgroundColor: GOLD }} />
                      )}
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
          <SelectDropdown
            value={spaceTypeFilter}
            onChange={setSpaceTypeFilter}
            options={spaceTypeOptions}
            ariaLabel={t('filter.spaceType')}
          />
          <SelectDropdown
            value={budgetFilter}
            onChange={setBudgetFilter}
            options={budgetOptions}
            ariaLabel={t('filter.budget')}
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
      <section ref={projectsRef} className="py-14 px-4 sm:px-6 lg:px-8 scroll-mt-16" style={{ backgroundColor: SURFACE }}>
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
                <ProjectCard
                  key={project.slug}
                  project={project}
                  showDescription
                  showChevron
                  onClick={handleCardClick}
                  isSiteProject={project.isSiteProject}
                  projectCount={project.projectCount}
                  areasCountLabel={project.isSiteProject ? t('wholeHouse.areasCount', { count: project.projectCount ?? 0 }) : undefined}
                  siteBadgeLabel={project.isSiteProject ? t('wholeHouse.siteBadge') : undefined}
                />
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
        onClose={handleModalClose}
      />
    </div>
  );
}
