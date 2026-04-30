'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
import { ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Project, SiteWithProjects, DisplayProject, LocalizedImagePair } from '@/lib/types';
import { getLocalizedProject } from '@/lib/data/projects';
import { pickLocale, pickLocaleOptional } from '@/lib/utils';
// categories passed as prop from server component
import SelectDropdown from '@/components/SelectDropdown';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, SURFACE, SURFACE_ALT, CARD,
  TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

/** Collected image for display in modal gallery */
interface GalleryImage {
  src: string;
  alt: string;
  is_before?: boolean;
}

/**
 * Collects unique images from image pairs, skipping duplicates.
 * Used by both site and project conversion to avoid code duplication.
 */
function collectImagesFromPairs(
  pairs: Array<{
    afterImage?: { src: string; alt: string } | null;
    beforeImage?: { src: string; alt: string } | null;
  }> | undefined,
  existingImages: GalleryImage[],
  fallbackAlt: string
): void {
  if (!pairs) return;
  for (const pair of pairs) {
    if (pair.afterImage && !existingImages.some((img) => img.src === pair.afterImage!.src)) {
      existingImages.push({
        src: pair.afterImage.src,
        alt: pair.afterImage.alt || fallbackAlt,
        is_before: false,
      });
    }
    if (pair.beforeImage && !existingImages.some((img) => img.src === pair.beforeImage!.src)) {
      existingImages.push({
        src: pair.beforeImage.src,
        alt: pair.beforeImage.alt || fallbackAlt,
        is_before: true,
      });
    }
  }
}

const PROJECTS_PER_PAGE = 12;

/** Check if a project matches a given service type category */
function matchesCategory(project: DisplayProject, serviceType: string): boolean {
  return serviceType === 'whole-house'
    ? project.isSiteProject === true || project.service_type === 'whole-house'
    : project.service_type === serviceType;
}

interface ProjectsPageProps {
  locale: Locale;
  company: Company;
  projects: Project[];
  sitesAsProjects?: SiteWithProjects[];
  categories: ({ serviceType: string } & import('@/lib/types').Localized<string>)[];
  initialService?: string;
}

export default function ProjectsPage({ locale, company, projects: rawProjects, sitesAsProjects = [], categories, initialService }: ProjectsPageProps) {
  const t = useTranslations();

  // Convert sites to display format (as "Whole House" projects)
  const wholeHouseCategory = t('category.wholeHouse');
  const sitesAsDisplayProjects: DisplayProject[] = useMemo(() =>
    sitesAsProjects
      .reduce<DisplayProject[]>((acc, site) => {
        // Resolve hero image: site's own or first child project's
        const heroImage = site.hero_image || site.projects?.find((p) => p.hero_image)?.hero_image;
        if (!heroImage) return acc; // Skip sites with no hero image at all

        // Collect all images: hero + site image pairs + all aggregated images from child projects
        const allImages: GalleryImage[] = [];
        const siteTitle = pickLocale(site.title, locale);

        // Add hero image first
        allImages.push({ src: heroImage, alt: siteTitle });

        // Build proper image_pairs for the modal (preserves before/after pairing)
        const combinedImagePairs: LocalizedImagePair[] = [];

        // Add site's own image pairs
        if (site.image_pairs && site.image_pairs.length > 0) {
          for (const pair of site.image_pairs) {
            combinedImagePairs.push({
              beforeImage: pair.beforeImage
                ? { src: pair.beforeImage.src, alt: pickLocale(pair.beforeImage.alt, locale) }
                : undefined,
              afterImage: pair.afterImage
                ? { src: pair.afterImage.src, alt: pickLocale(pair.afterImage.alt, locale) }
                : undefined,
              beforeVideo: pair.beforeVideo,
              afterVideo: pair.afterVideo,
              title: pickLocaleOptional(pair.title, locale),
              caption: pickLocaleOptional(pair.caption, locale),
              photographerCredit: pair.photographerCredit,
              keywords: pair.keywords,
            });
          }
        }

        // Add child projects' image pairs
        if (site.projects) {
          for (const proj of site.projects) {
            if (proj.image_pairs && proj.image_pairs.length > 0) {
              for (const pair of proj.image_pairs) {
                combinedImagePairs.push({
                  beforeImage: pair.beforeImage
                    ? { src: pair.beforeImage.src, alt: pickLocale(pair.beforeImage.alt, locale) }
                    : undefined,
                  afterImage: pair.afterImage
                    ? { src: pair.afterImage.src, alt: pickLocale(pair.afterImage.alt, locale) }
                    : undefined,
                  beforeVideo: pair.beforeVideo,
                  afterVideo: pair.afterVideo,
                  title: pickLocaleOptional(pair.title, locale),
                  caption: pickLocaleOptional(pair.caption, locale),
                  photographerCredit: pair.photographerCredit,
                  keywords: pair.keywords,
                });
              }
            }
          }
        }

        // Also build flat images for legacy compatibility
        collectImagesFromPairs(combinedImagePairs.map((p) => ({
          afterImage: p.afterImage ?? null,
          beforeImage: p.beforeImage ?? null,
        })), allImages, siteTitle);

        acc.push({
          id: site.id,
          slug: site.slug,
          title: pickLocale(site.title, locale),
          description: pickLocale(site.description, locale),
          category: wholeHouseCategory,
          // Sites don't have a service_type - they're collections of room projects
          location_city: site.location_city || '',
          hero_image: heroImage,
          hero_video: site.hero_video,
          images: allImages,
          image_pairs: combinedImagePairs,
          featured: site.featured,
          badge: pickLocaleOptional(site.badge, locale),
          space_type: pickLocaleOptional(site.space_type, locale),
          po_number: site.po_number,
          isSiteProject: true,
          projectCount: site.project_count ?? site.projects?.length ?? 0,
          // Site-specific data
          childAreas: site.projects?.map((p) => pickLocale(p.category, locale)) ?? [],
          totalBudget: site.budget_range,
          totalDuration: pickLocaleOptional(site.duration, locale),
          allServiceScopes: site.aggregated?.allServiceScopes ? pickLocale(site.aggregated.allServiceScopes, locale) : [],
          allExternalProducts: site.aggregated?.allExternalProducts?.map((ep) => ({
            url: ep.url,
            image_url: ep.image_url,
            label: pickLocale(ep.label, locale),
          })) ?? [],
        });
        return acc;
      }, []),
  [sitesAsProjects, locale, wholeHouseCategory]);

  // Convert individual projects with all images collected
  const projectsAsDisplay: DisplayProject[] = useMemo(() =>
    rawProjects.map((p) => {
      const localized = getLocalizedProject(p, locale);

      // Collect all images: hero + images array + image_pairs
      const allImages: GalleryImage[] = [];

      // Add hero image first (if not already in images array)
      if (localized.hero_image) {
        allImages.push({ src: localized.hero_image, alt: localized.title });
      }

      // Add images from images array (skip duplicates)
      if (localized.images) {
        localized.images.forEach((img) => {
          if (!allImages.some((existing) => existing.src === img.src)) {
            allImages.push({
              src: img.src,
              alt: img.alt || localized.title,
              is_before: img.is_before,
            });
          }
        });
      }

      // Add images from image_pairs using shared helper (skip duplicates)
      collectImagesFromPairs(localized.image_pairs, allImages, localized.title);

      return {
        ...localized,
        images: allImages,
        isSiteProject: false,
      };
    }),
  [rawProjects, locale]);

  // Combine all displayable items (sites first if featured, then projects).
  // Exclude individual projects whose slug matches a site-as-project to avoid duplicates.
  const allProjects: DisplayProject[] = useMemo(() => {
    const siteSlugs = new Set(sitesAsDisplayProjects.map((s) => s.slug));
    const dedupedProjects = projectsAsDisplay.filter((p) => !siteSlugs.has(p.slug));
    const combined = [...sitesAsDisplayProjects, ...dedupedProjects];
    const featured = combined.filter((p) => p.featured);
    const nonFeatured = combined.filter((p) => !p.featured);
    return [...featured, ...nonFeatured];
  }, [sitesAsDisplayProjects, projectsAsDisplay]);


  const locations = useMemo(() => {
    const locs = new Set([
      ...rawProjects.map((p) => p.location_city),
      ...sitesAsProjects.map((s) => s.location_city).filter(Boolean),
    ]);
    return Array.from(locs).filter(Boolean).sort() as string[];
  }, [rawProjects, sitesAsProjects]);
  const spaceTypes = useMemo(() => {
    const types = new Set([
      ...rawProjects.map((p) => p.space_type?.en).filter((v): v is string => !!v),
      ...sitesAsProjects.map((s) => s.space_type?.en).filter((v): v is string => !!v),
    ]);
    return Array.from(types).sort();
  }, [rawProjects, sitesAsProjects]);
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

  // Track scroll position for fade indicators (false/false avoids flash before measurement)
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollIndicators = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const SCROLL_THRESHOLD = 8;
    const left = el.scrollLeft > SCROLL_THRESHOLD;
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - SCROLL_THRESHOLD;
    setCanScrollLeft((prev) => prev !== left ? left : prev);
    setCanScrollRight((prev) => prev !== right ? right : prev);
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);
    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators]);

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

  const [activeCategory, setActiveCategory] = useState<string>(initialService ?? 'All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [spaceTypeFilter, setSpaceTypeFilter] = useState<string>('All');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const neuShadow4 = useMemo(() => neu(4), []);

  // Sync when initialService prop changes (e.g. client-side nav with ?service= param)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setActiveCategory(initialService ?? 'All');
    setCurrentPage(1);
  }, [initialService]);
  const [selectedProject, setSelectedProject] = useState<DisplayProject | null>(null);

  const handleCategoryClick = useCallback((serviceType: string) => {
    setActiveCategory(serviceType);
    setCurrentPage(1);
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
    value: c.serviceType,
    label: pickLocale(c, locale),
  })), [categories, locale]);

  const locationOptions = useMemo(() => [
    { value: 'All', label: t('filter.allLocations') },
    ...locations.map((loc) => ({ value: loc, label: loc })),
  ], [locations, t]);

  const spaceTypeOptions = useMemo(() => [
    { value: 'All', label: t('filter.allSpaceTypes') },
    ...spaceTypes.map((st) => {
      const matchProject = rawProjects.find((p) => p.space_type?.en === st);
      const matchSite = sitesAsProjects.find((s) => s.space_type?.en === st);
      const label = matchProject?.space_type?.[locale] ?? matchSite?.space_type?.[locale] ?? st;
      return { value: st, label };
    }),
  ], [spaceTypes, rawProjects, sitesAsProjects, locale, t]);

  const budgetOptions = useMemo(() => [
    { value: 'All', label: t('filter.allBudgets') },
    ...budgetRanges.map((br) => ({ value: br, label: br })),
  ], [budgetRanges, t]);

  const localizedSpaceType = useMemo(() => {
    if (spaceTypeFilter === 'All') return null;
    const matchProject = rawProjects.find((p) => p.space_type?.en === spaceTypeFilter);
    const matchSite = sitesAsProjects.find((s) => s.space_type?.en === spaceTypeFilter);
    return matchProject?.space_type?.[locale] ?? matchSite?.space_type?.[locale] ?? null;
  }, [spaceTypeFilter, locale, rawProjects, sitesAsProjects]);

  const filteredProjects = useMemo(() => allProjects.filter((project) => {
    const categoryMatch = activeCategory === 'All' || matchesCategory(project, activeCategory);
    const locationMatch = locationFilter === 'All' || project.location_city === locationFilter;
    const spaceTypeMatch = spaceTypeFilter === 'All' || project.space_type === localizedSpaceType;
    const budgetMatch = budgetFilter === 'All' || project.budget_range === budgetFilter;
    const q = searchQuery.toLowerCase();
    const searchMatch = !searchQuery || [project.title, project.po_number].some((v) => v?.toLowerCase().includes(q));
    return categoryMatch && locationMatch && spaceTypeMatch && budgetMatch && searchMatch;
  }), [allProjects, activeCategory, locationFilter, spaceTypeFilter, localizedSpaceType, budgetFilter, searchQuery]);

  const handleCategoryChange = useCallback((v: string) => { setActiveCategory(v); setCurrentPage(1); }, []);
  const handleLocationChange = useCallback((v: string) => { setLocationFilter(v); setCurrentPage(1); }, []);
  const handleSpaceTypeChange = useCallback((v: string) => { setSpaceTypeFilter(v); setCurrentPage(1); }, []);
  const handleBudgetChange = useCallback((v: string) => { setBudgetFilter(v); setCurrentPage(1); }, []);

  const clearFilters = useCallback(() => {
    setActiveCategory('All');
    setLocationFilter('All');
    setSpaceTypeFilter('All');
    setBudgetFilter('All');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() =>
    activeCategory !== 'All' || locationFilter !== 'All' || spaceTypeFilter !== 'All' || budgetFilter !== 'All' || searchQuery !== '',
  [activeCategory, locationFilter, spaceTypeFilter, budgetFilter, searchQuery]);

  // Pagination
  const totalPages = useMemo(() => Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE), [filteredProjects.length]);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push('ellipsis');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      {/* Hero */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            {t('section.projectsH1')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {t('projects.subtitle')}
          </p>
        </div>
      </section>

      {/* Category Cards — horizontal scroll */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: TEXT }}>
              {t('filter.browseByCategory')}
            </h2>
            <span className="text-xs sm:hidden swipe-hint" aria-hidden="true" style={{ color: TEXT_MUTED }}>
              {t('filter.swipeToSeeMore')}
            </span>
          </div>
          <div className="relative">
            {/* Left fade — visible when scrolled */}
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 transition-opacity duration-300"
              style={{
                background: `linear-gradient(to right, ${SURFACE_ALT}, transparent)`,
                opacity: canScrollLeft ? 1 : 0,
              }}
            />
            {/* Right fade — visible when more content available */}
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 transition-opacity duration-300"
              style={{
                background: `linear-gradient(to left, ${SURFACE_ALT}, transparent)`,
                opacity: canScrollRight ? 1 : 0,
              }}
            />
            <div
              ref={categoryScrollRef}
              className="flex gap-4 overflow-x-auto p-2 -m-2 snap-x snap-proximity category-scroll"
              style={{ cursor: 'grab', scrollBehavior: 'auto' }}
              onMouseDown={handleDragStart}
              onMouseLeave={handleDragEnd}
              onMouseUp={handleDragEnd}
              onMouseMove={handleDragMove}
            >
              {categories.filter((c) => c.serviceType !== 'All' && allProjects.some((p) => matchesCategory(p, c.serviceType))).map((category) => {
                const categoryProjects = allProjects.filter((p) => matchesCategory(p, category.serviceType));
                const firstProject = categoryProjects[0];
                const isActive = activeCategory === category.serviceType;

                return (
                  <button
                    key={category.serviceType}
                    onClick={() => { if (!dragState.current.hasDragged) handleCategoryClick(category.serviceType); }}
                    className="relative rounded-xl overflow-hidden transition-all duration-200 shrink-0 snap-start group/cat w-[180px] sm:w-[220px]"
                    style={{
                      boxShadow: isActive ? `0 0 0 2px ${GOLD}` : neuShadow4,
                    }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {firstProject && (
                        <OptimizedImage
                          src={firstProject.hero_image}
                          alt={`${pickLocale(category, locale)} renovation projects in Vancouver`}
                          fill
                          sizes="(max-width: 640px) 180px, 220px"
                          className={`object-cover transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover/cat:scale-105'}`}
                        />
                      )}
                      <div
                        className="absolute inset-0 transition-colors duration-200"
                        style={{ backgroundColor: isActive ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.45)' }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <span className="text-xl font-bold text-white block mb-1 drop-shadow-lg">
                          {pickLocale(category, locale)}
                        </span>
                        <span className="text-sm text-white/90 block">
                          {categoryProjects.length} {t('filter.projects', { count: categoryProjects.length })}
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
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b" style={{ backgroundColor: SURFACE, borderColor: `${TEXT}10` }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder={t('filter.search')}
            aria-label={t('filter.search')}
            className="rounded-lg text-sm px-3 py-2 border-0 outline-none"
            style={{ backgroundColor: CARD, color: TEXT, boxShadow: neu(3), width: '180px' }}
          />
          <SelectDropdown
            value={activeCategory}
            onChange={handleCategoryChange}
            options={categoryOptions}
            ariaLabel={t('modal.category')}
          />
          <SelectDropdown
            value={locationFilter}
            onChange={handleLocationChange}
            options={locationOptions}
            ariaLabel={t('filter.location')}
          />
          <SelectDropdown
            value={spaceTypeFilter}
            onChange={handleSpaceTypeChange}
            options={spaceTypeOptions}
            ariaLabel={t('filter.spaceType')}
          />
          <SelectDropdown
            value={budgetFilter}
            onChange={handleBudgetChange}
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
            {t('filter.showing')} {filteredProjects.length} {t('filter.projects', { count: filteredProjects.length })}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    showDescription
                    showChevron
                    href={`/projects/${project.slug}`}
                    onClick={handleCardClick}
                    isSiteProject={project.isSiteProject}
                    projectCount={project.projectCount}
                    areasCountLabel={project.isSiteProject ? t('wholeHouse.areasCount', { count: project.projectCount ?? 0 }) : undefined}
                    siteBadgeLabel={project.isSiteProject ? t('wholeHouse.siteBadge') : undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="mt-10 flex items-center justify-center gap-2"
                  aria-label={t('filter.pagination')}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage > 1 ? 'cursor-pointer hover:translate-x-[-2px] hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                    style={{
                      color: currentPage > 1 ? NAVY : TEXT_MUTED,
                      boxShadow: currentPage > 1 ? neu(3) : undefined,
                      backgroundColor: CARD,
                    }}
                    aria-label={t('filter.previousPage')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('filter.previous')}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum, idx) =>
                      pageNum === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 py-2 text-sm"
                          style={{ color: TEXT_MUTED }}
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className="min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:shadow-lg"
                          style={{
                            color: pageNum === currentPage ? 'white' : NAVY,
                            backgroundColor: pageNum === currentPage ? GOLD : CARD,
                            boxShadow: pageNum === currentPage ? `0 4px 12px ${GOLD}44` : neu(3),
                          }}
                          aria-current={pageNum === currentPage ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage < totalPages ? 'cursor-pointer hover:translate-x-[2px] hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                    style={{
                      color: currentPage < totalPages ? NAVY : TEXT_MUTED,
                      boxShadow: currentPage < totalPages ? neu(3) : undefined,
                      backgroundColor: CARD,
                    }}
                    aria-label={t('filter.nextPage')}
                  >
                    <span className="hidden sm:inline">{t('filter.next')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}

              {/* Count info */}
              {filteredProjects.length > 0 && (
                <p className="mt-4 text-center text-sm" style={{ color: TEXT_MUTED }}>
                  {t('filter.showingProjects', {
                    start: (currentPage - 1) * PROJECTS_PER_PAGE + 1,
                    end: Math.min(currentPage * PROJECTS_PER_PAGE, filteredProjects.length),
                    total: filteredProjects.length,
                  })}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Internal Cross-Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('cta.viewAllServices')} <ArrowRight className="w-4 h-4" />
          </Link>
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
