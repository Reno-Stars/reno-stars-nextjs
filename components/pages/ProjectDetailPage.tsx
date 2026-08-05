'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
import { MapPin, Calendar, DollarSign, Layers, ExternalLink, ZoomIn, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Project, LocalizedProject, LocalizedImagePair } from '@/lib/types';
import { getLocalizedProject, imagesToPairs } from '@/lib/data/projects';
import { formatSlug } from '@/lib/utils';
import ProjectCard from '@/components/ProjectCard';
import { BeforeAfterBadge } from '@/components/ImageBadge';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import VerifiedGoogleReviews from '@/components/projects/VerifiedGoogleReviews';
import ProjectFullscreenOverlay from '@/components/projects/ProjectFullscreenOverlay';
import type { ProjectReviewDisplay } from '@/lib/project-reviews';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import ShareBar from '@/components/share/ShareBar';
import type { ShareContext } from '@/lib/share/types';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useFullscreenModal } from '@/hooks/useFullscreenModal';
import {
  NAVY, GOLD, GOLD_PALE, NAVY_90, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface ProjectDetailPageProps {
  locale: Locale;
  project: Project;
  relatedProjects: LocalizedProject[];
  company: Company;
  serviceType?: string | null;
  serviceTypeName?: string;
  /** Verified client reviews linked to this project (verbatim quotes). */
  reviews?: ProjectReviewDisplay[];
  /** `url` is the page canonical, derived server-side via buildAlternates so it
   *  cannot drift from the canonical the page declares. */
  share: ShareContext;
}

/** Minimum swipe distance in pixels to trigger navigation */
const SWIPE_THRESHOLD = 50;

export default function ProjectDetailPage({ locale, project, relatedProjects, company, serviceType, serviceTypeName, reviews = [], share }: ProjectDetailPageProps) {
  const t = useTranslations();
  const localizedProject = useMemo(() => getLocalizedProject(project, locale), [project, locale]);

  // Get image pairs (prefer new structure, fallback to legacy)
  const imagePairs = useMemo((): LocalizedImagePair[] => {
    if (localizedProject.image_pairs && localizedProject.image_pairs.length > 0) {
      return localizedProject.image_pairs;
    }
    if (localizedProject.images && localizedProject.images.length > 0) {
      return imagesToPairs(localizedProject.images);
    }
    return [];
  }, [localizedProject.image_pairs, localizedProject.images]);

  const [activePairIndex, setActivePairIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset when project changes
  useEffect(() => {
    setActivePairIndex(0);
    setShowBefore(false);
  }, [project.slug]);

  const currentPair = imagePairs[activePairIndex];
  const hasBefore = !!(currentPair?.beforeImage || currentPair?.beforeVideo);
  const hasAfter = !!(currentPair?.afterImage || currentPair?.afterVideo);
  const hasBothImages = hasBefore && hasAfter;

  // Current display image (show after first, before when toggled)
  const displayImage = showBefore && currentPair?.beforeImage
    ? currentPair.beforeImage
    : currentPair?.afterImage || currentPair?.beforeImage;

  // Current display video: fall back to beforeVideo when afterVideo is missing
  const displayVideo = showBefore
    ? currentPair?.beforeVideo || currentPair?.afterVideo
    : currentPair?.afterVideo || currentPair?.beforeVideo;

  // Preload adjacent images and before/after pairs for instant switching
  useEffect(() => {
    if (imagePairs.length === 0) return;
    
    const preloadImages: string[] = [];
    
    // Preload current pair's opposite image
    if (currentPair?.beforeImage?.src && !showBefore) {
      preloadImages.push(currentPair.beforeImage.src);
    }
    if (currentPair?.afterImage?.src && showBefore) {
      preloadImages.push(currentPair.afterImage.src);
    }
    
    // Preload next/prev pair images
    const nextIndex = (activePairIndex + 1) % imagePairs.length;
    const prevIndex = (activePairIndex - 1 + imagePairs.length) % imagePairs.length;
    
    const nextPair = imagePairs[nextIndex];
    const prevPair = imagePairs[prevIndex];
    
    if (nextPair?.afterImage?.src) preloadImages.push(nextPair.afterImage.src);
    if (prevPair?.afterImage?.src) preloadImages.push(prevPair.afterImage.src);
    
    // Create preload link tags for faster switching
    preloadImages.forEach(src => {
      if (!src.startsWith('http')) return;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = `/api/image/?url=${encodeURIComponent(src)}&w=1200&q=70&f=webp`;
      document.head.appendChild(link);
      setTimeout(() => link.remove(), 5000);
    });
  }, [imagePairs, activePairIndex, currentPair, showBefore]);

  // Toggle before/after on click
  const handleImageClick = useCallback(() => {
    if (hasBothImages) {
      setShowBefore((prev) => !prev);
    }
  }, [hasBothImages]);

  // Fullscreen click: toggle before/after for images, just stop propagation for video
  const handleFullscreenClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayVideo && hasBothImages) {
      setShowBefore((prev) => !prev);
    }
  }, [displayVideo, hasBothImages]);

  // Select a pair from thumbnails
  const handleSelectPair = useCallback((index: number) => {
    setActivePairIndex(index);
    setShowBefore(false); // Reset to showing after when selecting new pair
  }, []);

  // Navigation handlers
  const goToPrev = useCallback(() => {
    setActivePairIndex((prev) => (prev > 0 ? prev - 1 : imagePairs.length - 1));
    setShowBefore(false);
  }, [imagePairs.length]);

  const goToNext = useCallback(() => {
    setActivePairIndex((prev) => (prev < imagePairs.length - 1 ? prev + 1 : 0));
    setShowBefore(false);
  }, [imagePairs.length]);

  // Swipe detection for touch devices
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goToNext(); // Swipe left = next
      } else {
        goToPrev(); // Swipe right = prev
      }
    }
    touchStartX.current = null;
  }, [goToNext, goToPrev]);

  // Fullscreen handlers
  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const fullscreenPrev = useCallback(() => {
    setActivePairIndex((prev) => (prev > 0 ? prev - 1 : imagePairs.length - 1));
    setShowBefore(false);
  }, [imagePairs.length]);

  const fullscreenNext = useCallback(() => {
    setActivePairIndex((prev) => (prev < imagePairs.length - 1 ? prev + 1 : 0));
    setShowBefore(false);
  }, [imagePairs.length]);

  const { overlayRef, captureTrigger } = useFullscreenModal({
    isOpen: isFullscreen,
    onClose: closeFullscreen,
    onPrev: imagePairs.length > 1 ? fullscreenPrev : undefined,
    onNext: imagePairs.length > 1 ? fullscreenNext : undefined,
  });

  const openFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    captureTrigger(e);
    setIsFullscreen(true);
  }, [captureTrigger]);

  // Drag to scroll for thumbnail strips with elastic bounce
  const {
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    wasJustDragging,
    stopPropagation,
  } = useDragScroll();

  // Thumbnail click handler (prevents firing after drag)
  const handleThumbClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (wasJustDragging()) {
      e.preventDefault();
      return;
    }
    handleSelectPair(index);
  }, [wasJustDragging, handleSelectPair]);


  // Challenge & Solution — rendered ONCE below the image gallery (single DOM
  // copy). On desktop it sits under the wide gallery column; on mobile the
  // gallery column stacks first, so it flows right after the before/after
  // images. Previously this block was duplicated across a `hidden lg:block`
  // desktop copy AND an `lg:hidden` mobile copy, which shipped the (often long,
  // zh) Challenge/Solution H2s + body text TWICE in the DOM on every project
  // page — flagged by heading-outline / duplicate-content auditors.
  const challengeSolutionBlock = (localizedProject.challenge || localizedProject.solution) ? (
    <>
      {localizedProject.challenge && (
        <div className="mb-4">
          <h2 className="text-base font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
            {t('modal.challenge')}
          </h2>
          <p className="text-base" style={{ color: TEXT_MID }}>
            {localizedProject.challenge}
          </p>
        </div>
      )}
      {localizedProject.solution && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
            {t('modal.solution')}
          </h2>
          <p className="text-base" style={{ color: TEXT_MID }}>
            {localizedProject.solution}
          </p>
        </div>
      )}
    </>
  ) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <VisualBreadcrumb variant="light" items={[
        { href: '/', label: t('nav.home') },
        { href: '/projects', label: t('nav.projects') },
        ...(serviceType && serviceTypeName
          ? [{ href: `/projects/${serviceType}`, label: serviceTypeName }]
          : []),
        { label: localizedProject.title },
      ]} />

      {/* Main Content */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Gallery - Image Pairs with Before/After Toggle */}
            <div className="lg:col-span-2">
              {/* Hero video (project walkthrough) */}
              {localizedProject.hero_video && (
                <div className="mb-4 rounded-2xl overflow-hidden" style={{ boxShadow: neu(6) }}>
                  <video
                    src={localizedProject.hero_video}
                    poster={localizedProject.hero_image || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={localizedProject.title}
                    className="w-full aspect-video object-contain bg-black"
                  />
                </div>
              )}
              {/* Link to the dedicated video watch page (only when one exists —
                  requires both a hero video and a thumbnail). Consolidates
                  video SEO signals onto /videos/[slug]/ and gives users the
                  full-screen watch experience. */}
              {localizedProject.hero_video && localizedProject.hero_image && (
                <div className="mb-6">
                  <Link
                    href={`/videos/${project.slug}`}
                    className="inline-flex items-center gap-2 font-semibold hover:underline"
                    style={{ color: NAVY }}
                  >
                    <Video className="w-4 h-4" aria-hidden="true" />
                    {locale === 'zh' ? '观看完整装修实拍视频' : 'Watch the full walkthrough'}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
              {/* Main Image */}
              <div
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden${hasBothImages && !displayVideo ? ' cursor-pointer' : ''}`}
                style={{ boxShadow: neu(6), backgroundColor: SURFACE_ALT }}
                onClick={hasBothImages && !displayVideo ? handleImageClick : undefined}
                onTouchStart={displayVideo ? undefined : handleTouchStart}
                onTouchEnd={displayVideo ? undefined : handleTouchEnd}
              >
                {displayVideo ? (
                  <video
                    key={displayVideo}
                    src={displayVideo}
                    poster={displayImage?.src}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={displayImage?.alt || localizedProject.title}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (currentPair?.afterImage || currentPair?.beforeImage) ? (
                  <>
                    {/* Render both images in DOM — toggle visibility for instant switching */}
                    {currentPair?.afterImage && (
                      <div className="absolute inset-0" style={{ opacity: showBefore ? 0 : 1, transition: 'opacity 0.15s ease' }}>
                        <OptimizedImage
                          src={currentPair.afterImage.src}
                          alt={currentPair.afterImage.alt || localizedProject.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain"
                          priority
                        />
                      </div>
                    )}
                    {currentPair?.beforeImage && (
                      <div className="absolute inset-0" style={{ opacity: showBefore ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                        <OptimizedImage
                          src={currentPair.beforeImage.src}
                          alt={currentPair.beforeImage.alt || localizedProject.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain"
                          priority={!showBefore} // preload whichever is not currently shown
                        />
                      </div>
                    )}
                    <BeforeAfterBadge
                      isBefore={showBefore && hasBothImages}
                      t={t}
                      showClickTip={hasBothImages}
                      hasPair={hasBothImages}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm" style={{ color: TEXT_MUTED }}>
                      {t('projects.noImages')}
                    </p>
                  </div>
                )}
                {localizedProject.badge && (
                  <span
                    className="absolute top-4 right-4 px-3 py-1 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: GOLD }}
                  >
                    {localizedProject.badge}
                  </span>
                )}

                {/* Navigation arrows */}
                {imagePairs.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer hidden sm:block"
                      aria-label={t('projects.previousImage')}
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToNext(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer hidden sm:block"
                      aria-label={t('projects.nextImage')}
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Thumbnail Strip - Inside image, bottom left with horizontal scroll */}
                {imagePairs.length > 1 && (
                  <div
                    className="absolute bottom-0 left-0 right-12 z-40 overflow-x-auto cursor-grab select-none touch-pan-x"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.5) transparent' }}
                    onClick={stopPropagation}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerMove={handlePointerMove}
                  >
                    <div className="flex gap-1.5 p-3">
                      {imagePairs.map((pair, idx) => {
                        const hasBothSides = (pair.beforeImage || pair.beforeVideo) && (pair.afterImage || pair.afterVideo);
                        const thumbImage = pair.afterImage || pair.beforeImage;
                        return (
                        <button
                          key={`${thumbImage?.src || pair.afterVideo || pair.beforeVideo || idx}-${idx}`}
                          onClick={(e) => handleThumbClick(e, idx)}
                          className={`relative rounded-lg overflow-hidden shrink-0 transition-all duration-200 h-[30px] sm:h-[60px] ${
                            hasBothSides ? 'w-[45px] sm:w-[90px]' : 'w-[30px] sm:w-[60px]'
                          } ${idx === activePairIndex ? 'opacity-85 sm:opacity-100' : 'opacity-50 sm:opacity-75'}`}
                          aria-label={`${t('projects.viewImage')} ${idx + 1} / ${imagePairs.length}`}
                          aria-pressed={idx === activePairIndex}
                          style={{
                            outline: idx === activePairIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.5)',
                            outlineOffset: '1px',
                          }}
                        >
                          {pair.beforeImage && pair.afterImage ? (
                            // Split view: needs two images for visual preview (video-only or mixed pairs show as single/icon)
                            <div className="flex h-full">
                              <div className="relative w-1/2 h-full">
                                <OptimizedImage
                                  src={pair.beforeImage.src}
                                  alt={pair.beforeImage.alt || `${localizedProject.title} - ${t('projects.beforeLabel')}`}
                                  fill
                                  sizes="45px"
                                  className="object-cover"
                                />
                                <span
                                  className="absolute bottom-0.5 left-0.5 px-0.5 py-px text-[6px] font-semibold rounded text-white"
                                  style={{ backgroundColor: NAVY_90 }}
                                >
                                  {t('projects.beforeLabel')}
                                </span>
                              </div>
                              <div className="w-px bg-white/80" />
                              <div className="relative w-1/2 h-full">
                                <OptimizedImage
                                  src={pair.afterImage.src}
                                  alt={pair.afterImage.alt || `${localizedProject.title} - ${t('projects.afterLabel')}`}
                                  fill
                                  sizes="45px"
                                  className="object-cover"
                                />
                                <span
                                  className="absolute bottom-0.5 right-0.5 px-0.5 py-px text-[6px] font-semibold rounded text-white"
                                  style={{ backgroundColor: GOLD }}
                                >
                                  {t('projects.afterLabel')}
                                </span>
                              </div>
                            </div>
                          ) : thumbImage ? (
                            // Single image (before or after only)
                            <div className="relative w-full h-full">
                              <OptimizedImage
                                src={thumbImage.src}
                                alt={thumbImage.alt || localizedProject.title}
                                fill
                                sizes="60px"
                                className="object-cover"
                              />
                              {pair.beforeImage && !pair.afterImage && (
                                <span
                                  className="absolute bottom-0.5 left-0.5 px-0.5 py-px text-[6px] font-semibold rounded text-white"
                                  style={{ backgroundColor: NAVY_90 }}
                                >
                                  {t('projects.beforeLabel')}
                                </span>
                              )}
                            </div>
                          ) : (
                            // Video-only pair (no image thumbnails available)
                            <div className="relative w-full h-full flex items-center justify-center" style={{ backgroundColor: NAVY_90 }}>
                              <Video className="w-4 h-4 sm:w-6 sm:h-6 text-white/80" />
                            </div>
                          )}
                        </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fullscreen button - bottom right */}
                {(displayImage || displayVideo) && (
                  <button
                    onClick={openFullscreen}
                    className="absolute bottom-3 right-3 z-40 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
                    aria-label={t('projects.viewFullscreen')}
                  >
                    <ZoomIn className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>

              {/* Challenge & Solution — single copy, below the gallery (see the
                  challengeSolutionBlock definition above for why it renders once). */}
              {challengeSolutionBlock && (
                <div className="mt-8">{challengeSolutionBlock}</div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
                {localizedProject.title}
              </h1>
              <p className="text-base mb-6" style={{ color: TEXT_MID }}>
                {localizedProject.description}
              </p>

              {/* ===== SEO CONTENT EXPANSION: What's Included ===== */}
              <div className="mb-8 space-y-6 rounded-2xl p-5 sm:p-6" style={{ backgroundColor: CARD, boxShadow: neu(4) }}>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>
                  {locale === 'zh' ? '服务内容' : "What's Included"}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                  {locale === 'zh'
                    ? 'Reno Stars 的厨房翻新工程涵盖从拆除到安装的全流程服务。我们负责所有前期准备工作，包括旧橱柜、地板、瓷砖和电器的安全拆除，以及建筑废料的清运。拆除完成后，我们的持牌水电工和装修团队将同步开展电气改造、管道调整和防水处理，确保所有隐蔽工程符合不列颠哥伦比亚省建筑规范。'
                    : 'Our Surrey kitchen renovation service covers every stage from demo to handover. We start by safely removing old cabinets, flooring, tiles, and appliances, then haul away all construction debris. Our licensed electricians and plumbers handle any rewiring or re-piping required, while our carpenters and tilers build and finish your new kitchen to code.'}
                </p>
                <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                  {locale === 'zh'
                    ? '中期工程包括新地板铺装（实木复合地板、瓷砖或乙烯基板）、墙壁与天花板刷漆、橱柜与台面安装，以及所有照明灯具、开关插座和水龙头的安装调试。我们还提供定制选项，包括中岛台、酒柜、开放式搁架和智能家电整合，确保每个厨房都独一无二。'
                    : 'Mid-stage work covers new flooring installation — hardwood, tile, or luxury vinyl — along with wall and ceiling painting, cabinet and countertop fitting, and the installation of all light fixtures, outlets, and plumbing hardware. Custom add-ons such as kitchen islands, pantries, open shelving, and smart appliance integration are all available.'}
                </p>
                <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                  {locale === 'zh'
                    ? '完工阶段我们进行全面的清洁与深度保洁，移除所有装修保护膜和残余建筑材料。Reno Stars 团队会在移交前安排正式的竣工验收，向您演示所有新设备的使用方法，并提供完整的工作质保与材料厂家保修单据。'
                    : 'The final phase involves thorough post-construction cleaning, removal of all protective films and residual materials, and a formal handover walkthrough where our team demonstrates every appliance and fixture. Every Reno Stars project is backed by a workmanship guarantee and manufacturer warranties on all installed products.'}
                </p>
              </div>

              {/* ===== SEO CONTENT EXPANSION: Cost Guide ===== */}
              <div className="mb-8 space-y-4 rounded-2xl p-5 sm:p-6" style={{ backgroundColor: CARD, boxShadow: neu(4) }}>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>
                  {locale === 'zh' ? '萨里厨房翻新费用 2026' : 'Kitchen Renovation Costs in Surrey 2026'}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                  {locale === 'zh'
                    ? '萨里及大温哥华地区厨房翻新的费用取决于空间大小、材料档次和工程范围。以下价格区间基于 2026 年第一季度市场行情，供您在规划预算时参考。具体报价将在我们的免费上门评估后提供。'
                    : 'Kitchen renovation costs in Surrey and the Greater Vancouver area depend on kitchen size, material grade, and project scope. The ranges below reflect Q1 2026 market conditions and are provided as a planning guide. A detailed quote is provided after our free in-home consultation.'}
                </p>
                <div className="space-y-3">
                  {[
                    { label: locale === 'zh' ? '经济型翻新（$15,000 – $30,000）' : 'Economy Renovation ($15,000 – $30,000)', desc: locale === 'zh' ? '更换橱柜面板、新台面、表面翻新、地板换新、局部油漆' : 'Cabinet refacing, new countertops, surface refinishing, new flooring, partial repainting' },
                    { label: locale === 'zh' ? '中档翻新（$30,000 – $55,000）' : 'Mid-Range Renovation ($30,000 – $55,000)', desc: locale === 'zh' ? '全柜换新、石英石台面、新电器、全屋水电改造、瓷砖地板' : 'Full cabinet replacement, quartz countertops, new appliances, complete electrical and plumbing upgrade, tile flooring' },
                    { label: locale === 'zh' ? '高端定制（$55,000 – $100,000+）' : 'High-End Custom ($55,000 – $100,000+)', desc: locale === 'zh' ? '定制实木橱柜、进口石材台面、高端电器、智能家居集成、开放式扩建' : 'Custom solid-wood cabinetry, imported stone countertops, premium appliances, smart-home integration, open-concept additions' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 rounded-xl p-3" style={{ backgroundColor: GOLD_PALE }}>
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold" style={{ color: NAVY }}>{item.label}</span>
                        <span className="text-sm" style={{ color: TEXT_MID }} — {item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                  {locale === 'zh'
                    ? '注：上述价格为加元含税估算，不含特殊结构改造或市政许可费用。实际价格将根据现场条件和选材最终确认。'
                    : 'Note: All estimates in CAD including applicable taxes. Special structural modifications or city permits are quoted separately. Final pricing confirmed after on-site assessment.'}
                </p>
              </div>

              {/* ===== SEO CONTENT EXPANSION: Our Process ===== */}
              <div className="mb-8 space-y-4 rounded-2xl p-5 sm:p-6" style={{ backgroundColor: CARD, boxShadow: neu(4) }}>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>
                  {locale === 'zh' ? '我们的流程' : 'Our Process'}
                </h2>
                <ol className="space-y-4">
                  {[
                    { step: locale === 'zh' ? '第一步：免费咨询与评估' : 'Step 1 — Free Consultation & Assessment', desc: locale === 'zh' ? '预约上门测量，了解您的需求、预算和生活习惯。我们的设计师将根据您的想法提供初步方案和材质建议，全部免费、无承诺。' : 'Book a free in-home measurement and consultation. Our designer listens to your needs, lifestyle, and budget, then presents a preliminary layout and material guide — at no charge and with no obligation.' },
                    { step: locale === 'zh' ? '第二步：设计方案与详细报价' : 'Step 2 — Design & Detailed Quote', desc: locale === 'zh' ? '根据您的反馈，我们提供 3D 渲染图和完整的分项报价单，材料清单和工期计划一目了然。确认方案后签订正式施工合同。' : 'Based on your feedback we deliver 3D renderings and a line-by-line quote covering materials, labour, and schedule. Once you approve the design we sign a formal contract.' },
                    { step: locale === 'zh' ? '第三步：施工准备与许可申请' : 'Step 3 — Permits & Site Preparation', desc: locale === 'zh' ? '我们代为申请不列颠哥伦比亚省所需的装修许可，并在开工前做好全屋防护，铺设地面保护膜和家具遮盖，确保您的居住环境不受施工影响。' : 'We handle all required BC building permits and prepare the site — protecting your belongings, covering floors, and sealing off construction zones so your home stays liveable during the build.' },
                    { step: locale === 'zh' ? '第四步：主体施工' : 'Step 4 — Core Construction', desc: locale === 'zh' ? '按照工程计划依次进行拆除、水电改造、防水、贴砖、橱柜安装和油漆涂刷。各工种有序衔接，我们每天清理现场建筑垃圾，保持安全整洁。' : 'Construction proceeds in sequence — demo, rough-in, waterproofing, tiling, cabinet installation, and finishing. Trades are coordinated daily, and the site is cleaned each evening for safety.' },
                    { step: locale === 'zh' ? '第五步：竣工验收与售后质保' : 'Step 5 — Handover & Aftercare', desc: locale === 'zh' ? '完工后进行正式验收，向您演示所有设备操作。Reno Stars 提供工程质保和材料保修，并可在未来提供维护和升级服务。' : 'A formal walkthrough covers every detail. Reno Stars provides a workmanship warranty and manufacturer coverage on materials, with ongoing maintenance and upgrade options available.' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 rounded-xl p-4" style={{ backgroundColor: SURFACE_ALT }}>
                      <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm" style={{ backgroundColor: GOLD, color: '#fff' }} aria-hidden>
                        {i + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-base" style={{ color: NAVY }}>{item.step}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* ===== SEO CONTENT EXPANSION: FAQ ===== */}
              <div className="mb-8 space-y-4 rounded-2xl p-5 sm:p-6" style={{ backgroundColor: CARD, boxShadow: neu(4) }}>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>
                  {locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
                </h2>
                <dl className="space-y-3">
                  {([
                    {
                      q: locale === 'zh' ? '萨里厨房翻新一般需要多长时间？' : 'How long does a kitchen renovation in Surrey take?',
                      a: locale === 'zh' ? '普通规模的厨房翻新通常需要 4–8 周，具体取决于工程范围和材料到货时间。高端定制橱柜可能延长至 10–12 周。我们会在签约时提供详细的工程进度表，并定期向您汇报进展。' : 'A standard kitchen remodel typically takes 4–8 weeks depending on scope and material lead times. High-end custom cabinetry can extend this to 10–12 weeks. We provide a detailed schedule at contract signing and give regular progress updates throughout.',
                    },
                    {
                      q: locale === 'zh' ? '厨房翻新期间我可以继续住在家里吗？' : 'Can I stay in my home during the renovation?',
                      a: locale === 'zh' ? '是的，大多数情况下您可以继续居住。我们会将施工区域与生活区有效隔离，并尽量在白天施工。如果您有多套卫生间，翻新期间可使用备用卫生间减少不便。' : 'In most cases, yes — we isolate the work zone from living areas and work during daytime hours. If you have a second bathroom, it can serve as a backup during peak construction phases to minimise disruption.',
                    },
                    {
                      q: locale === 'zh' ? 'Reno Stars 是否提供厨房翻新的融资方案？' : 'Does Reno Stars offer financing for kitchen renovations?',
                      a: locale === 'zh' ? '是的，我们与多家加拿大本地金融机构合作，可提供 HELOC、信用额度和分期付款等多种融资方案，帮助您灵活管理大额翻新支出。欢迎联系我们获取个性化融资建议。' : 'Yes. We partner with Canadian lenders to offer HELOCs, lines of credit, and installment plans so you can manage larger renovation costs flexibly. Contact us for a personalised financing assessment.',
                    },
                    {
                      q: locale === 'zh' ? '厨房翻新需要申请建筑许可吗？' : 'Do I need a building permit for a kitchen renovation in Surrey?',
                      a: locale === 'zh' ? '橱柜更换、表面翻新和地板翻新通常不需要许可。但如果涉及电气改造、管道改动、结构改动或扩建，则需要向萨里市政府申请许可。Reno Stars 会帮您判断是否需要许可并代办申请流程。' : 'Simple cabinet replacement and surface updates usually don\'t require a permit, but electrical rewiring, plumbing changes, structural modifications, or additions do. Reno Stars determines permit requirements and handles all applications on your behalf.',
                    },
                  ] as const).map((item, i) => (
                    <details key={i} className="rounded-xl px-4 py-3" style={{ backgroundColor: SURFACE_ALT, border: `1px solid ${GOLD_PALE}` }}>
                      <summary className="cursor-pointer text-base font-medium list-none [&::-webkit-details-marker]:hidden flex justify-between items-center gap-3" style={{ color: NAVY }}>
                        <span>{item.q}</span>
                        <span aria-hidden className="text-xl flex-shrink-0 font-light" style={{ color: GOLD }}>+</span>
                      </summary>
                      <dd className="mt-3 text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                        {item.a}
                      </dd>
                    </details>
                  ))}
                </dl>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" style={{ color: GOLD }} />
                    <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                      {t('modal.location')}
                    </span>
                  </div>
                  <span className="text-base font-semibold" style={{ color: TEXT }}>
                    {localizedProject.location_city}
                  </span>
                </div>
                {localizedProject.duration && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.duration')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.duration}
                    </span>
                  </div>
                )}
                {localizedProject.budget_range && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.budget')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.budget_range}
                    </span>
                  </div>
                )}
                {localizedProject.space_type && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.spaceType')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.space_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Scope */}
              {localizedProject.service_scope && localizedProject.service_scope.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('modal.serviceScope')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {localizedProject.service_scope.map((scope) => (
                      <span
                        key={scope}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Products */}
              {localizedProject.external_products && localizedProject.external_products.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('projects.externalProducts')}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {localizedProject.external_products.map((ep) => (
                      <a
                        key={ep.url}
                        href={ep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:brightness-95"
                        style={{ boxShadow: neu(3), backgroundColor: CARD }}
                      >
                        {ep.image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: SURFACE_ALT }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ep.image_url} alt={ep.label} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1 text-sm font-medium" style={{ color: TEXT }}>
                          {ep.label}
                        </span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_MUTED }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic content blocks (FAQ, HowTo, callouts, images, etc.) */}
              {project.dynamic_blocks && project.dynamic_blocks.length > 0 && (
                <div className="mb-8">
                  <BlockRenderer blocks={project.dynamic_blocks as Parameters<typeof BlockRenderer>[0]['blocks']} locale={locale} />
                </div>
              )}

              {/* Verified Google Review(s) from the client whose project this
                  is — social proof placed right before the conversion CTA.
                  Verbatim quotes; shown in their original language on every
                  locale (never machine-translated). */}
              <VerifiedGoogleReviews reviews={reviews} locale={locale} />

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
                >
                  {t('cta.getFreeQuote')}
                </Link>
                <a
                  href={`tel:${company.phone}`}
                  className="px-6 py-3 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200"
                  style={{ boxShadow: neu(4), backgroundColor: CARD, color: TEXT }}
                >
                  {t('cta.callNow')}
                </a>
              </div>

              {/* Contextual internal links */}
              {serviceType && serviceTypeName && (
                <div className="flex flex-wrap gap-2 mt-6">
                  <Link
                    href={`/services/${serviceType}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:brightness-95"
                    style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                  >
                    {t('projects.aboutService', { service: serviceTypeName })}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  {localizedProject.location_city && (
                    <Link
                      href={`/services/${serviceType}/${formatSlug(localizedProject.location_city)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:brightness-95"
                      style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                    >
                      {t('projects.serviceInCity', { service: serviceTypeName, city: localizedProject.location_city })}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}

              {/* Share — rail (xl+) + labelled row, both rendered by ShareBar */}
              <ShareBar
                locale={locale}
                context={share}
                contentType="project"
                itemId={project.slug}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: TEXT }}>
                {t('projects.relatedProjects')}
              </h2>
              {serviceType && (
                <Link
                  href={`/projects/${serviceType}`}
                  className="hidden md:flex items-center gap-1 text-sm font-semibold"
                  style={{ color: GOLD }}
                >
                  {t('cta.viewAllProjects')} <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rp) => (
                <ProjectCard key={rp.slug} project={rp} href={`/projects/${rp.slug}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2026-06-26: Planning guide cross-links. Project pages are high-intent
          — visitors have already self-selected into a specific renovation type.
          Surfacing the planning guides here converts project browsers into
          content readers and passes PageRank from project leaf pages to the
          6 blog guide hub posts. */}
      <section className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
            Planning Your Renovation?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {([
              { href: '/blog/how-to-choose-renovation-contractor-vancouver', label: 'Choose a Contractor' },
              { href: '/guides/whole-house-renovation-cost-vancouver', label: 'Cost Guide 2026' },
              { href: '/blog/renovation-timeline-how-long-does-each-project-take', label: 'Timeline Guide' },
              { href: '/blog/renovation-permits-bc-guide', label: 'Permits Guide' },
              { href: '/blog/renovation-financing-vancouver-heloc', label: 'Financing Guide' },
              { href: '/blog/strata-renovation-rules-vancouver', label: 'Strata Rules' },
            ] as const).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-75"
                style={{ backgroundColor: GOLD_PALE, color: NAVY }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fullscreen Image Overlay */}
      {isFullscreen && (displayImage || displayVideo) && (
        <ProjectFullscreenOverlay
          overlayRef={overlayRef}
          title={localizedProject.title}
          displayImage={displayImage}
          displayVideo={displayVideo}
          currentPair={currentPair}
          showBefore={showBefore}
          hasBothImages={hasBothImages}
          imagePairs={imagePairs}
          activePairIndex={activePairIndex}
          onClose={closeFullscreen}
          onPrev={fullscreenPrev}
          onNext={fullscreenNext}
          onImageAreaClick={handleFullscreenClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onThumbClick={handleThumbClick}
          stopPropagation={stopPropagation}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
        />
      )}
    </div>
  );
}
